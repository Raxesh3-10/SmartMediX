package com.eHealth.eHealth.auth.service.impl;

import org.springframework.stereotype.Service;
import com.eHealth.eHealth.auth.dto.LoginRequest;
import com.eHealth.eHealth.auth.dto.SignupRequest;
import com.eHealth.eHealth.auth.model.User;
import com.eHealth.eHealth.auth.repository.UserRepository;
import com.eHealth.eHealth.auth.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    public AuthServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public String signup(SignupRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "User already exists";
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // hash later

        userRepository.save(user);
        return "Signup successful";
    }

    @Override
    public String login(LoginRequest request) {

        return userRepository.findByEmail(request.getEmail())
                .filter(u -> u.getPassword().equals(request.getPassword()))
                .map(u -> "Login successful")
                .orElse("Invalid credentials");
    }
}
