package com.eHealth.eHealth.auth.service.impl;

import java.time.Instant;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eHealth.eHealth.auth.service.AuthService;
import com.eHealth.eHealth.utility.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;

import com.eHealth.eHealth.dto.LoginRequest;
import com.eHealth.eHealth.dto.LoginResponse;
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
    private final PasswordEncoder passwordEncoder;

    // We inject the property here so Service decides if Cookie is Secure (HTTPS)
    @Value("${app.is-production:false}")
    private boolean isProduction;

    public AuthServiceImpl(UserRepository userRepository,
                           JwtSessionRepository jwtRepo,
                           OtpService otpService,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtRepo = jwtRepo;
        this.otpService = otpService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public String signup(SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "User already exists";
        }
        otpService.sendEmailOtp(request.getEmail());
        return "OTP sent to email";
    }

    @Override
    @Transactional
    public String verifyOtpAndCreateUser(VerifyOtpRequest request) {
        boolean validOtp = otpService.verifyOtp(request.getEmail(), request.getOtp());
        if (!validOtp) return "Invalid or expired OTP";
        if (userRepository.findByEmail(request.getEmail()).isPresent()) return "User already exists";
        
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        userRepository.save(user);
        return "Signup successful";
    }

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        String userAgent = httpRequest.getHeader("User-Agent");
        String jwt = JwtUtil.generateToken(user.getEmail(), user.getRole(), httpRequest.getRemoteAddr(), userAgent);

        JwtSession session = new JwtSession();
        session.setEmail(user.getEmail());
        session.setJwt(jwt);
        session.setLoginTime(Instant.now());
        session.setIpAddress(httpRequest.getRemoteAddr());
        session.setIpChanges(0);
        session.setExpiryTime(Instant.now().plusSeconds(3 * 3600)); 
        jwtRepo.save(session);

        ResponseCookie cookie = ResponseCookie.from("accessToken", jwt)
                .httpOnly(true)
                .secure(isProduction)
                .path("/")
                .maxAge(-1)
                .sameSite("Strict")
                .build();

        return new LoginResponse(null, user.getRole().name(), cookie.toString());
    }

    @Override
    @Transactional
    public String logout(String token) {
        jwtRepo.deleteByJwt(token);
        return "Logout successful";
    }

    @Override
    @Transactional
    public Optional<User> getUser(String token) {
        try {
            String userId = JwtUtil.getUserId(token, userRepository, jwtRepo);
            return userRepository.findById(userId);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    @Override
    @Transactional
    public String updateProfile(UpdateProfileRequest request) {
        User user = userRepository.findByEmail(request.getCurrentEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        boolean emailChange = request.getNewEmail() != null && !request.getNewEmail().isBlank() && !request.getNewEmail().equals(user.getEmail());
        boolean nameChange = request.getNewName() != null && !request.getNewName().isBlank() && !request.getNewName().equals(user.getName());
        boolean passwordChange = request.getNewPassword() != null && !request.getNewPassword().isBlank();

        if (!emailChange && !nameChange && !passwordChange) return "No changes requested";

        if (request.getOtp() == null) {
            if (emailChange && userRepository.findByEmail(request.getNewEmail()).isPresent()) {
                return "Email already in use";
            }
            String otpTargetEmail = emailChange ? request.getNewEmail() : user.getEmail();
            otpService.sendEmailOtp(otpTargetEmail);
            return "OTP sent";
        }

        String otpTargetEmail = emailChange ? request.getNewEmail() : user.getEmail();
        boolean validOtp = otpService.verifyOtp(otpTargetEmail, request.getOtp());
        if (!validOtp) return "Invalid or expired OTP";

        if (emailChange) user.setEmail(request.getNewEmail());
        if (nameChange) user.setName(request.getNewName());
        if (passwordChange) user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);
        return "Profile updated successfully";
    }
}