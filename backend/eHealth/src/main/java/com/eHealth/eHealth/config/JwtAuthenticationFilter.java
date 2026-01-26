package com.eHealth.eHealth.config; // Adjust package as needed

import com.eHealth.eHealth.enumRole.Role;
import com.eHealth.eHealth.repository.JwtSessionRepository;
import com.eHealth.eHealth.repository.UserRepository;
import com.eHealth.eHealth.utility.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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

    public JwtAuthenticationFilter(UserRepository userRepo, JwtSessionRepository jwtRepo) {
        this.userRepo = userRepo;
        this.jwtRepo = jwtRepo;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

    String token = null;

        // 1. Try getting the standard "Authorization" header
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // Remove "Bearer " prefix (7 characters)
            token = authHeader.substring(7);
        } 
        // 2. If Authorization is missing, try your custom "JWT" header
        else if (request.getHeader("JWT") != null) {
            token = request.getHeader("JWT");
        }

        // 2. Validate Token using your existing logic
        if (token != null && JwtUtil.isTokenValid(token, jwtRepo,request.getRemoteAddr())) {
            
            // 3. Extract info
            String email = JwtUtil.getEmail(token, jwtRepo);
            Role role = JwtUtil.getRole(token, userRepo, jwtRepo);

            // 4. Create Authority (Spring Security expects "ROLE_" prefix usually)
            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role.name());

            // 5. Create Authentication Object
            // We pass 'email' as the principal, and credentials is null (already verified)
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    email, 
                    null, 
                    Collections.singletonList(authority)
            );

            // 6. Set the context
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }
}