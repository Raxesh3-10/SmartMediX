package com.eHealth.eHealth.auth.service;

import java.util.Optional;

import com.eHealth.eHealth.dto.LoginRequest;
import com.eHealth.eHealth.dto.LoginResponse;
import com.eHealth.eHealth.dto.SignupRequest;
import com.eHealth.eHealth.dto.UpdateProfileRequest;
import com.eHealth.eHealth.dto.VerifyOtpRequest;
import com.eHealth.eHealth.model.User;

public interface AuthService {
    String logout(String token);
    Optional<User> getUser(String token);
    String updateProfile(UpdateProfileRequest request);
    String signup(SignupRequest request);
    String verifyOtpAndCreateUser(VerifyOtpRequest request);
    LoginResponse  login(LoginRequest request);
}