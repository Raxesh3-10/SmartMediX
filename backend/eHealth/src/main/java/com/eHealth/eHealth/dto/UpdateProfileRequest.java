package com.eHealth.eHealth.dto;
import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileRequest {
    private String currentEmail;
    private String newName;
    private String newEmail;
    private String newPassword;
    private String otp;
}