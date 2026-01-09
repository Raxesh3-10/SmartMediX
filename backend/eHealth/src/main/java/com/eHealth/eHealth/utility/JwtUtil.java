package com.eHealth.eHealth.utility;

import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Component;

import com.eHealth.eHealth.enumRole.Role;
import com.eHealth.eHealth.model.User;
import com.eHealth.eHealth.repository.UserRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    // ================= CONFIG =================
    private static final long EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour

    private static final Key SECRET_KEY =
            Keys.secretKeyFor(SignatureAlgorithm.HS256);

    private final UserRepository userRepository;

    // ================= CONSTRUCTOR =================
    public JwtUtil(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ================= TOKEN GENERATION =================
    public String generateToken(String email, Role role) {

        return Jwts.builder()
                .setSubject(email)
                // role is NOT trusted anymore
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + EXPIRATION_TIME)
                )
                .signWith(SECRET_KEY)
                .compact();
    }

    // ================= TOKEN PARSING =================
    private Claims getClaims(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ================= VALIDATION =================
    public boolean isTokenValid(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // ================= DATA EXTRACTION =================
    public String getEmail(String token) {
        return getClaims(token).getSubject();
    }

    // ================= ROLE RESOLUTION =================
    public Role getRole(String token) {

        String email = getEmail(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found for email: " + email)
                );

        return user.getRole();
    }

    // ================= ROLE CHECKS =================
    public boolean isAdmin(String token) {
        return isTokenValid(token) && getRole(token) == Role.ADMIN;
    }

    public boolean isPatient(String token) {
        return isTokenValid(token) && getRole(token) == Role.PATIENT;
    }

    public boolean isDoctor(String token) {
        return isTokenValid(token) && getRole(token) == Role.DOCTOR;
    }
}