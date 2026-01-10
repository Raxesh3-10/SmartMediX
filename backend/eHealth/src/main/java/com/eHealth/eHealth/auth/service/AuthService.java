package com.eHealth.eHealth.auth.service;

import com.eHealth.eHealth.auth.LoginResponse;
import com.eHealth.eHealth.dto.LoginRequest;
import com.eHealth.eHealth.dto.SignupRequest;
import com.eHealth.eHealth.dto.UpdateProfileRequest;
import com.eHealth.eHealth.dto.VerifyOtpRequest;

public interface AuthService {
    String logout(String token);
    String updateProfile(UpdateProfileRequest request);
    String signup(SignupRequest request);
    String verifyOtpAndCreateUser(VerifyOtpRequest request);
    LoginResponse  login(LoginRequest request);
}