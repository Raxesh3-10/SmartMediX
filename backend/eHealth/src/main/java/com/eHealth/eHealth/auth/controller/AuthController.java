package com.eHealth.eHealth.auth.controller;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.eHealth.eHealth.auth.service.AuthService;
import com.eHealth.eHealth.dto.LoginRequest;
import com.eHealth.eHealth.dto.LoginResponse;
import com.eHealth.eHealth.dto.SignupRequest;
import com.eHealth.eHealth.dto.UpdateProfileRequest;
import com.eHealth.eHealth.dto.VerifyOtpRequest;
import com.eHealth.eHealth.model.User;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.GetMapping;
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@RequestHeader("JWT") String token) {
        return ResponseEntity.of(authService.getUser(token));
    }
    @PostMapping("/signup")
    public String signup(@RequestBody SignupRequest req) {
        return authService.signup(req);
    }
    @PostMapping("/update-profile")
    public String updateProfile(@RequestBody UpdateProfileRequest req) {
        return authService.updateProfile(req);
    }
    @PostMapping("/logout")
    public String logout(@RequestHeader("Authorization") String token) {
        return authService.logout(token);
    }
    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestBody VerifyOtpRequest req) {
        return authService.verifyOtpAndCreateUser(req);
    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req , HttpServletRequest request) {
        return ResponseEntity.ok(authService.login(req, request));
    }
}