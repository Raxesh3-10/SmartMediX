package com.eHealth.eHealth.utility;

import java.security.Key;
import java.util.Date;

import com.eHealth.eHealth.enumRole.Role;

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
                .claim("role", role.name())
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

    public static Role getRole(String token) {
        String role = getClaims(token).get("role", String.class);
        return Role.valueOf(role);
    }

    // ================= ADMIN CHECK =================
    public static boolean isAdmin(String token) {
        return isTokenValid(token) && getRole(token) == Role.ADMIN;
    }
    public static boolean isPatient(String token) {
        return isTokenValid(token) && getRole(token) == Role.PATIENT;
    }
    public static boolean isDoctor(String token) {
        return isTokenValid(token) && getRole(token) == Role.DOCTOR;
    }
}