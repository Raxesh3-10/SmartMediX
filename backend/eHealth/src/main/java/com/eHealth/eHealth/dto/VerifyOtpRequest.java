package com.eHealth.eHealth.dto;

import com.eHealth.eHealth.enumRole.Role;

public class VerifyOtpRequest {

    private String name;
    private String email;
    private String password;
    private Role role;
    private String otp;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}