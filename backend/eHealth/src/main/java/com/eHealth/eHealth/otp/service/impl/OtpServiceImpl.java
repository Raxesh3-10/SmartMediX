package com.eHealth.eHealth.otp.service.impl;

import com.eHealth.eHealth.otp.service.OtpService;
import com.eHealth.eHealth.repository.OtpRepository;
import com.eHealth.eHealth.model.OtpEntity;

import java.time.Instant;
import java.util.Random;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class OtpServiceImpl implements OtpService {

    private final JavaMailSender mailSender;
    private final OtpRepository otpRepository;

    public OtpServiceImpl(JavaMailSender mailSender,
                          OtpRepository otpRepository) {
        this.mailSender = mailSender;
        this.otpRepository = otpRepository;
    }

    @Override
    public void sendEmailOtp(String email) {

        String otp = generateOtp();
        saveOtp(email, otp);

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(email);
        msg.setSubject("OTP Verification");
        msg.setText("Your OTP is: " + otp + " (Valid for 5 minutes)");
        mailSender.send(msg);
    }

    @Override
    public void sendMobileOtp(String mobile) {

        String otp = generateOtp();
        saveOtp(mobile, otp);
        System.out.println(otp);
    }

    @Override
    public boolean verifyOtp(String target, String otp) {
        return otpRepository.findByTarget(target)
                .filter(o -> o.getOtp().equals(otp))
                .filter(o -> o.getExpiryTime().isAfter(Instant.now()))
                .isPresent();
    }

    private String generateOtp() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }

    private void saveOtp(String target, String otp) {
        OtpEntity entity = new OtpEntity();
        entity.setTarget(target);
        entity.setOtp(otp);
        entity.setExpiryTime(Instant.now().plusSeconds(300));
        otpRepository.save(entity);
    }
}