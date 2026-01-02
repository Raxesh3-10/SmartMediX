package com.eHealth.eHealth.otp.service;

public interface OtpService {

    void sendEmailOtp(String email);

    void sendMobileOtp(String mobile);

    boolean verifyOtp(String target, String otp);
}