package com.eHealth.eHealth.config;

import com.eHealth.eHealth.enumRole.Role;
import com.eHealth.eHealth.model.JwtSession;
import com.eHealth.eHealth.repository.JwtSessionRepository;
import com.eHealth.eHealth.repository.UserRepository;
import com.eHealth.eHealth.utility.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final UserRepository userRepo;
    private final JwtSessionRepository jwtRepo;
    private final JavaMailSender mailSender;

    public JwtAuthenticationFilter(UserRepository userRepo, JwtSessionRepository jwtRepo, JavaMailSender mailSender) {
        this.userRepo = userRepo;
        this.jwtRepo = jwtRepo;
        this.mailSender = mailSender;
    }

    @Override
protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
    // Tells the filter to SKIP execution for these public endpoints
    String path = request.getRequestURI();
    return path.equals("/api/auth/login") || 
           path.equals("/api/auth/signup") || 
           path.equals("/api/auth/verify-otp") || path.equals("/api/auth/logout");
}
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String token = null;
        String deviceIdCookie = null;

        // 1. Try to get Token from Cookie
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    token = cookie.getValue();
                }
                if ("deviceId".equals(cookie.getName())) {
                    deviceIdCookie = cookie.getValue();
                }
            }
        }

        // 2. Fallback: Try to get Token from Header (Good for debugging/Postman)
        if (token == null) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }

        // 3. Authenticate if Token exists
        if (token != null) {
            try {
                // A. Crypto Validation (Cheap check first)
                Claims claims = JwtUtil.getClaims(token);

                // B. Database Session Check (Expensive check)
                // If the user switched accounts, the old session ID in the token won't exist here.
                JwtSession session = jwtRepo.findByJwt(token).orElse(null);

                if (session == null) {
                    // CRITICAL FIX: The token is crypto-valid but Session is gone (Logout/Role Switch).
                    // We must clear the cookie so the browser doesn't keep sending the dead token.
                    clearAuthCookies(response);
                    // Continue chain -> Request is Anonymous -> 401 at Controller
                    filterChain.doFilter(request, response);
                    return;
                }

                // C. Fingerprint Validation
                String incomingUaHash = JwtUtil.generateUserAgentHash(request.getHeader("User-Agent"));
                String incomingDiHash = JwtUtil.generateUserAgentHash(deviceIdCookie);

                String tokenUaHash = claims.get("uaHash", String.class);
                String tokenDiHash = claims.get("diHash", String.class);

                if (tokenUaHash != null && !tokenUaHash.equals(incomingUaHash)) {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Security Warning: Browser Mismatch");
                    jwtRepo.delete(session);
                    clearAuthCookies(response);
                    return;
                }
                // Only check Device ID if it was enforced in the token
                if (tokenDiHash != null && !tokenDiHash.equals(incomingDiHash)) {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Security Warning: Device Mismatch");
                    jwtRepo.delete(session);
                    clearAuthCookies(response);
                    return;
                }

                // D. IP Change Detection
                String currentIp = request.getRemoteAddr();
                if (!currentIp.equals(session.getIpAddress())) {
                    int changes = session.getIpChanges() + 1;
                    session.setIpChanges(changes);
                    session.setIpAddress(currentIp);
                    jwtRepo.save(session);

                    if (changes > 3) {
                        sendSecurityAlert(session.getEmail(), currentIp);
                        jwtRepo.delete(session);
                        clearAuthCookies(response);
                        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Session terminated: Suspicious IP activity.");
                        return;
                    }
                }

                // E. Set Security Context
                String email = session.getEmail();
                Role role = JwtUtil.getRoleFromClaims(claims); // Optimized: Get role from Token, not DB again

                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role.name());
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email, null, Collections.singletonList(authority)
                );
                
                SecurityContextHolder.getContext().setAuthentication(authToken);

            } catch (JwtException e) {
                // Token corrupted or expired
                clearAuthCookies(response);
                SecurityContextHolder.clearContext();
            } catch (Exception e) {
                // General error
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private void clearAuthCookies(HttpServletResponse response) {
        Cookie cookie = new Cookie("accessToken", null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0); // Delete cookie
        response.addCookie(cookie);
        cookie = new Cookie("deviceId", null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0); // Delete cookie
        response.addCookie(cookie);
    }

    private void sendSecurityAlert(String email, String ip) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Security Alert: Session Terminated");
        message.setText("Suspicious activity detected. Session terminated. Last IP: " + ip);
        try {
            mailSender.send(message);
        } catch (Exception ignored) {}
    }
}