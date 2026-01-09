package com.eHealth.eHealth.utility;

import java.security.Key;
import java.util.Date;

import com.eHealth.eHealth.enumRole.Role;
import com.eHealth.eHealth.model.User;
import com.eHealth.eHealth.repository.UserRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

public class JwtUtil {

    // ================= CONFIG =================
    private static final long EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour

    private static final Key SECRET_KEY =
            Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // ================= TOKEN GENERATION =================
    public static String generateToken(String email, Role role) {

        return Jwts.builder()
                .setSubject(email)
                // role is NOT trusted anymore
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY)
                .compact();
    }

    // ================= TOKEN PARSING =================
    private static Claims getClaims(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ================= VALIDATION =================
    public static boolean isTokenValid(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // ================= DATA EXTRACTION =================
    public static String getEmail(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * UPDATED METHOD
     * Role is resolved from database using email from JWT
     */
    public static Role getRole(String token, UserRepository userRepository) {

        String email = getEmail(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found for email: " + email)
                );

        return user.getRole();
    }

    // ================= ROLE CHECKS =================
    public static boolean isAdmin(String token, UserRepository userRepository) {
        return isTokenValid(token) && getRole(token, userRepository) == Role.ADMIN;
    }

    public static boolean isPatient(String token, UserRepository userRepository) {
        return isTokenValid(token) && getRole(token, userRepository) == Role.PATIENT;
    }

    public static boolean isDoctor(String token, UserRepository userRepository) {
        return isTokenValid(token) && getRole(token, userRepository) == Role.DOCTOR;
    }
}