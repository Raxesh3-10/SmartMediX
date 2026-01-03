package com.eHealth.eHealth.auth.service.impl;

import java.time.Instant;

import org.springframework.stereotype.Service;

import com.eHealth.eHealth.auth.service.AuthService;
import com.eHealth.eHealth.utility.JwtUtil;
import com.eHealth.eHealth.dto.LoginRequest;
import com.eHealth.eHealth.dto.SignupRequest;
import com.eHealth.eHealth.dto.UpdateProfileRequest;
import com.eHealth.eHealth.dto.VerifyOtpRequest;
import com.eHealth.eHealth.model.JwtSession;
import com.eHealth.eHealth.model.User;
import com.eHealth.eHealth.otp.service.OtpService;
import com.eHealth.eHealth.repository.JwtSessionRepository;
import com.eHealth.eHealth.repository.UserRepository;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtSessionRepository jwtRepo;
    private final OtpService otpService;

    public AuthServiceImpl(UserRepository userRepository,
                           JwtSessionRepository jwtRepo,
                           OtpService otpService) {
        this.userRepository = userRepository;
        this.jwtRepo = jwtRepo;
        this.otpService = otpService;
    }

    // STEP 1: Send OTP only
    @Override
    public String signup(SignupRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "User already exists";
        }

        otpService.sendEmailOtp(request.getEmail());
        return "OTP sent to email";
    }

    // STEP 2: Verify OTP and save user
    @Override
    public String verifyOtpAndCreateUser(VerifyOtpRequest request) {

        boolean validOtp = otpService.verifyOtp(
                request.getEmail(),
                request.getOtp()
        );

        if (!validOtp) {
            return "Invalid or expired OTP";
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "User already exists";
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // later hash
        user.setRole(request.getRole());

        userRepository.save(user);

        return "Signup successful";
    }
    @Override
    public String updateProfile(UpdateProfileRequest request) {
        User user = userRepository.findByEmail(request.getCurrentEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        boolean isEmailChange = request.getNewEmail() != null &&
                            !request.getNewEmail().equals(user.getEmail());

    /* ---------------- EMAIL CHANGE FLOW ---------------- */
        if (isEmailChange) {
        // Check email availability
            if (userRepository.findByEmail(request.getNewEmail()).isPresent()) {
                return "Email already in use";
            }
        // OTP not yet provided → SEND OTP
            if (request.getOtp() == null) {
                otpService.sendEmailOtp(request.getNewEmail());
                return "OTP sent to new email";
            }
        // OTP provided → VERIFY
            boolean validOtp = otpService.verifyOtp(
                    request.getNewEmail(),
                    request.getOtp()
            );
            if (!validOtp) {
            return "Invalid or expired OTP";
            }
        // Update email
        user.setEmail(request.getNewEmail());
        }
    /* ---------------- NAME CHANGE FLOW ---------------- */
        if (request.getNewName() != null &&
            !request.getNewName().equals(user.getName())) {
            user.setName(request.getNewName());
            }
        userRepository.save(user);
        return "Profile updated successfully";
    }

    @Override
    public String logout(String token) {
        String jwt = token.replace("Bearer ", "");
        jwtRepo.deleteByJwt(jwt);
        return "Logout successful";
    }

    @Override
    public String login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String jwt = JwtUtil.generateToken(user.getEmail(), user.getRole());

        JwtSession session = new JwtSession();
        session.setEmail(user.getEmail());
        session.setJwt(jwt);
        session.setLoginTime(Instant.now());
        session.setExpiryTime(Instant.now().plusSeconds(3600));

        jwtRepo.save(session);

        return jwt;
    }
}
