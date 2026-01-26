package com.eHealth.eHealth.dto;
import com.eHealth.eHealth.enumRole.Role;
import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VerifyOtpRequest {

    private String name;
    private String email;
    private String password;
    private Role role;
    private String otp;
}