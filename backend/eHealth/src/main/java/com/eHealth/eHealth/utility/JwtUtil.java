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

    private static final long EXPIRATION_TIME = 60 * 60 * 1000 * 3; // 3 hours

    private static final String SECRET =
            "MyVeryStrongJwtSecretKeyThatIsAtLeast32Chars";

    private static final Key SECRET_KEY =
            Keys.hmacShaKeyFor(SECRET.getBytes());

    public static String generateToken(String email, Role role, String ipAddress) {

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role) 
                .claim("ip", ipAddress) 
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    private static Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public static boolean isTokenValid(String token,JwtSessionRepository jwtSessionRepository,String requestIp) {
        try {
            JwtSession session = jwtSessionRepository.findByJwt(token)
                    .orElse(null);

            if (session == null) return false;

            Claims claims = getClaims(token);
            boolean isNotExpired = claims.getExpiration().after(new Date());
            
            if (!isNotExpired) return false;

            String tokenIp = claims.get("ip", String.class);
            
            return tokenIp != null && tokenIp.equals(requestIp);

        } catch (Exception e) {
            return false;
        }
    }

    public static String getUserId(String token, UserRepository userRepository, JwtSessionRepository jwtSessionRepository) {
        String email = getEmail(token, jwtSessionRepository);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found for email: " + email));

        return user.getId();
    }

    public static String getEmail(String token, JwtSessionRepository jwtSessionRepository) {
        JwtSession session = jwtSessionRepository.findByJwt(token)
                .orElseThrow(() -> new RuntimeException("Session expired or invalid"));

        return session.getEmail();
    }

    public static Role getRole(String token, UserRepository userRepository, JwtSessionRepository jwtSessionRepository) {
        String email = getEmail(token, jwtSessionRepository);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found for email: " + email));

        return user.getRole();
    }

    public static boolean isAdmin(String token, UserRepository uRepo, JwtSessionRepository jRepo, String requestIp) {
        return isTokenValid(token, jRepo, requestIp) && getRole(token, uRepo, jRepo) == Role.ADMIN;
    }

    public static boolean isDoctor(String token, UserRepository uRepo, JwtSessionRepository jRepo, String requestIp) {
        return isTokenValid(token, jRepo, requestIp) && getRole(token, uRepo, jRepo) == Role.DOCTOR;
    }

    public static boolean isPatient(String token, UserRepository uRepo, JwtSessionRepository jRepo, String requestIp) {
        return isTokenValid(token, jRepo, requestIp) && getRole(token, uRepo, jRepo) == Role.PATIENT;
    }
}