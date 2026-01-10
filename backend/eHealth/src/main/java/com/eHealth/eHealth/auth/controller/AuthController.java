package com.eHealth.eHealth.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.eHealth.eHealth.auth.LoginResponse;
import com.eHealth.eHealth.auth.service.AuthService;
import com.eHealth.eHealth.dto.LoginRequest;
import com.eHealth.eHealth.dto.SignupRequest;
import com.eHealth.eHealth.dto.UpdateProfileRequest;
import com.eHealth.eHealth.dto.VerifyOtpRequest;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
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
public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
    return ResponseEntity.ok(authService.login(req));
}

}
