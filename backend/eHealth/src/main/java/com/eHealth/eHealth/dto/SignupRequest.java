package com.eHealth.eHealth.dto;
import com.eHealth.eHealth.enumRole.Role;
import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SignupRequest {
    private String name;
    private String email;
    private String password;
    private Role role;
}