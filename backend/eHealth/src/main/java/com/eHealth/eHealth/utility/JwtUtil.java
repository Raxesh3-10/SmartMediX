package com.eHealth.eHealth.utility;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
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
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.xml.bind.DatatypeConverter;

public class JwtUtil {

    private static final long EXPIRATION_TIME = 60 * 60 * 1000 * 3; // 3 hours

    private static final String SECRET =
            "MyVeryStrongJwtSecretKeyThatIsAtLeast32Chars";

    private static final Key SECRET_KEY =
            Keys.hmacShaKeyFor(SECRET.getBytes());

    // UPDATED: Now requires UserAgent to create the security fingerprint
    public static String generateToken(String email, Role role, String ipAddress, String userAgent,String deviceId) {
        String uaHash = generateUserAgentHash(userAgent); // Generate Fingerprint
        String diHash = generateUserAgentHash(deviceId);
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .claim("ip", ipAddress)
                .claim("diHash",diHash)
                .claim("uaHash", uaHash) // Storing the browser fingerprint
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    public static Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // UPDATED: Basic validation + Fingerprint check is now done in the Filter
    public static boolean isTokenValid(String token, JwtSessionRepository jwtSessionRepository, String requestIp) {
        try {
            // Basic Signature Check
            Jwts.parserBuilder().setSigningKey(SECRET_KEY).build().parseClaimsJws(token);
            
            // DB Check
            JwtSession session = jwtSessionRepository.findByJwt(token).orElse(null);
            if (session == null) return false;

            // Expiry Check
            Claims claims = getClaims(token);
            return claims.getExpiration().after(new Date());

        } catch (Exception e) {
            return false;
        }
    }

    // Helper: Create SHA-256 Hash of the User-Agent
    public static String generateUserAgentHash(String componet ) {
        try {
            if(componet == null) componet = "UNKNOWN";
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(componet.getBytes(StandardCharsets.UTF_8));
            return DatatypeConverter.printHexBinary(hash).toUpperCase();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }
    public static Role getRoleFromClaims(Claims claims) {
        String roleStr = claims.get("role", String.class);
        return Role.valueOf(roleStr);
    }
    //Helper for take token
    public static String extractToken(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
    // --- YOUR EXISTING METHODS (UNCHANGED) ---

    public static String getUserId(String token, UserRepository userRepository, JwtSessionRepository jwtSessionRepository) {
        String email = getEmail(token, jwtSessionRepository);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found for email: " + email));
        return user.getId();
    }

    public static String getEmail(String token, JwtSessionRepository jwtSessionRepository) {
        // We can trust the token claims if signature validates, but DB check is safer
        Claims claims = getClaims(token);
        return claims.getSubject();
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