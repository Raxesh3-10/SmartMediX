package com.eHealth.eHealth.dto;

public class UpdateProfileRequest {

    private String currentEmail;

    private String newName;
    private String newEmail;
    private String newPassword;

    // OTP (null in step-1)
    private String otp;

    public String getCurrentEmail() { return currentEmail; }
    public void setCurrentEmail(String currentEmail) { this.currentEmail = currentEmail; }

    public String getNewName() { return newName; }
    public void setNewName(String newName) { this.newName = newName; }

    public String getNewEmail() { return newEmail; }
    public void setNewEmail(String newEmail) { this.newEmail = newEmail; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}