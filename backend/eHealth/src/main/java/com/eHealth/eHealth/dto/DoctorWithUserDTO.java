package com.eHealth.eHealth.dto;
import com.eHealth.eHealth.model.Doctor;
import com.eHealth.eHealth.model.User;
import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DoctorWithUserDTO {
    private Doctor doctor;
    private User user;
}