package com.eHealth.eHealth.auth.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.eHealth.eHealth.auth.service.AuthService;
import com.eHealth.eHealth.dto.LoginRequest;
import com.eHealth.eHealth.dto.LoginResponse;
import com.eHealth.eHealth.dto.SignupRequest;
import com.eHealth.eHealth.dto.UpdateProfileRequest;
import com.eHealth.eHealth.dto.VerifyOtpRequest;
import com.eHealth.eHealth.model.User;
import com.eHealth.eHealth.utility.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Value("${app.is-production:false}")
    private boolean isProduction;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public String signup(@RequestBody SignupRequest req) {
        return authService.signup(req);
    }

    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestBody VerifyOtpRequest req) {
        return authService.verifyOtpAndCreateUser(req);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req, HttpServletRequest request) {
        LoginResponse response = authService.login(req, request);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, response.getCookieHeader())
                .body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        String token = JwtUtil.extractToken(request);
        if(token != null) {
            authService.logout(token);
        }

        ResponseCookie cookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(isProduction)
                .path("/")
                .maxAge(0) 
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Logout successful");
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(HttpServletRequest request) {
        String token = JwtUtil.extractToken(request);
        if (token == null) return ResponseEntity.status(401).build();

        return ResponseEntity.of(authService.getUser(token));
    }

    @PostMapping("/update-profile")
    public String updateProfile(@RequestBody UpdateProfileRequest req) {
        return authService.updateProfile(req);
    }
}