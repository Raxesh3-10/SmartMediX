package com.eHealth.eHealth.auth.service;

import com.eHealth.eHealth.auth.dto.LoginRequest;
import com.eHealth.eHealth.auth.dto.SignupRequest;

public interface AuthService {

    String signup(SignupRequest request);
    String login(LoginRequest request);
}
