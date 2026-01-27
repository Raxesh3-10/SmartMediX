package com.eHealth.eHealth.config;

import com.eHealth.eHealth.enumRole.Role;
import com.eHealth.eHealth.model.JwtSession;
import com.eHealth.eHealth.repository.JwtSessionRepository;
import com.eHealth.eHealth.repository.UserRepository;
import com.eHealth.eHealth.utility.JwtUtil;
import io.jsonwebtoken.Claims;
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
    private final JavaMailSender mailSender; // Required for security alerts

    public JwtAuthenticationFilter(UserRepository userRepo, JwtSessionRepository jwtRepo, JavaMailSender mailSender) {
        this.userRepo = userRepo;
        this.jwtRepo = jwtRepo;
        this.mailSender = mailSender;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String token = null;

        // 1. PRIORITIZE HTTP-ONLY COOKIE (Most Secure)
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    token = cookie.getValue();
                }
            }
        }

        // 3. START SECURITY CHECKS
        if (token != null && JwtUtil.isTokenValid(token, jwtRepo, request.getRemoteAddr())) {
            
            try {
                // A. Load Session
                JwtSession session = jwtRepo.findByJwt(token).orElse(null);
                if (session == null) {
                    filterChain.doFilter(request, response);
                    return;
                }

                // B. BROWSER FINGERPRINT CHECK
                // We hash the incoming User-Agent and compare it with the one inside the Token
                String incomingUaHash = JwtUtil.generateUserAgentHash(request.getHeader("User-Agent"));
                Claims claims = io.jsonwebtoken.Jwts.parserBuilder()
                        .setSigningKey("MyVeryStrongJwtSecretKeyThatIsAtLeast32Chars".getBytes())
                        .build().parseClaimsJws(token).getBody();
                
                String tokenUaHash = claims.get("uaHash", String.class);

                // If fingerprints don't match, it's a hijacked token -> BLOCK
                if (tokenUaHash != null && !tokenUaHash.equals(incomingUaHash)) {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Security Warning: Browser Mismatch");
                    return;
                }

                // C. IP CHANGE DETECTION
                String currentIp = request.getRemoteAddr();
                if (!currentIp.equals(session.getIpAddress())) {
                    // IP Changed! Increment counter.
                    int changes = session.getIpChanges() + 1;
                    session.setIpChanges(changes);
                    session.setIpAddress(currentIp); // Update to new IP
                    jwtRepo.save(session);

                    // If changed more than 3 times -> SECURITY ALERT & BLOCK
                    if (changes > 3) {
                        sendSecurityAlert(session.getEmail(), currentIp);
                        jwtRepo.delete(session); // Revoke token instantly
                        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Session terminated due to suspicious IP activity.");
                        return;
                    }
                }

                // D. AUTHENTICATION SUCCESS
                String email = session.getEmail();
                Role role = JwtUtil.getRole(token, userRepo, jwtRepo); // Using your utility method

                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role.name());
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email, null, Collections.singletonList(authority)
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);

            } catch (Exception e) {
                // Token manipulation detected
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private void sendSecurityAlert(String email, String ip) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Security Alert: Session Terminated");
        message.setText("We detected >3 IP address changes on your active session. " +
                "Last IP: " + ip + ". You have been logged out for your protection.");
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.out.println("Failed to send email: " + e.getMessage());
        }
    }
}