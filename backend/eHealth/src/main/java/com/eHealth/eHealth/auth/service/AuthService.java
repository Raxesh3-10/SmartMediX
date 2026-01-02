package com.eHealth.eHealth.auth.service;

import com.eHealth.eHealth.dto.LoginRequest;
import com.eHealth.eHealth.dto.SignupRequest;
import com.eHealth.eHealth.dto.VerifyOtpRequest;

public interface AuthService {
    String signup(SignupRequest request);
    String verifyOtpAndCreateUser(VerifyOtpRequest request);
    String login(LoginRequest request);
}