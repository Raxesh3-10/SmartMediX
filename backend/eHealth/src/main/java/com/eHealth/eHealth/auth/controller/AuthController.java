package com.eHealth.eHealth.auth.controller;

import org.springframework.web.bind.annotation.*;
import com.eHealth.eHealth.auth.dto.LoginRequest;
import com.eHealth.eHealth.auth.dto.SignupRequest;
import com.eHealth.eHealth.auth.service.AuthService;

@RestController
@RequestMapping("/v1/api/auth")
@CrossOrigin(origins = "http://localhost:3000") // React
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public String signup(@RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
