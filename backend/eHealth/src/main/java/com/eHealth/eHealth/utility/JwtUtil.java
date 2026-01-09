package com.eHealth.eHealth.utility;

import java.security.Key;
import java.util.Date;

import com.eHealth.eHealth.enumRole.Role;
import com.eHealth.eHealth.model.JwtSession;
import com.eHealth.eHealth.model.User;
import com.eHealth.eHealth.repository.JwtSessionRepository;
import com.eHealth.eHealth.repository.UserRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

public class JwtUtil {

    // ================= CONFIG =================

    private static final long EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour

    private static final String SECRET =
            "MyVeryStrongJwtSecretKeyThatIsAtLeast32Chars";

    private static final Key SECRET_KEY =
            Keys.hmacShaKeyFor(SECRET.getBytes());

    // ================= TOKEN GENERATION =================
    public static String generateToken(String email, Role role) {

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
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
    public static boolean isTokenValid(
            String token,
            JwtSessionRepository jwtSessionRepository
    ) {
        try {
            JwtSession session = jwtSessionRepository.findByJwt(token)
                    .orElse(null);

            if (session == null) return false;

            // validate JWT signature & expiry
            Claims claims = getClaims(token);
            return claims.getExpiration().after(new Date());

        } catch (Exception e) {
            return false;
        }
    }

    public static String getUserId(String token,UserRepository userRepository,JwtSessionRepository jwtSessionRepository)
    {
        String email = getEmail(token, jwtSessionRepository);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found for email: " + email));

        return user.getId();
    }
    // ================= DATA EXTRACTION =================
    public static String getEmail(
            String token,
            JwtSessionRepository jwtSessionRepository
    ) {
        JwtSession session = jwtSessionRepository.findByJwt(token)
                .orElseThrow(() ->
                        new RuntimeException("Session expired or invalid"));

        return session.getEmail();
    }

    /**
     * Role is resolved via:
     * JWT → JwtSession → email → User → role
     */
    public static Role getRole(
            String token,
            UserRepository userRepository,
            JwtSessionRepository jwtSessionRepository
    ) {
        String email = getEmail(token, jwtSessionRepository);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found for email: " + email));

        return user.getRole();
    }

    // ================= ROLE CHECKS =================
    public static boolean isAdmin(
            String token,
            UserRepository userRepository,
            JwtSessionRepository jwtSessionRepository
    ) {
        return isTokenValid(token, jwtSessionRepository)
                && getRole(token, userRepository, jwtSessionRepository) == Role.ADMIN;
    }

    public static boolean isPatient(
            String token,
            UserRepository userRepository,
            JwtSessionRepository jwtSessionRepository
    ) {
        return isTokenValid(token, jwtSessionRepository)
                && getRole(token, userRepository, jwtSessionRepository) == Role.PATIENT;
    }

    public static boolean isDoctor(
            String token,
            UserRepository userRepository,
            JwtSessionRepository jwtSessionRepository
    ) {
        return isTokenValid(token, jwtSessionRepository)
                && getRole(token, userRepository, jwtSessionRepository) == Role.DOCTOR;
    }
}