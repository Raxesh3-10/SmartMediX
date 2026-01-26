package com.eHealth.eHealth.dto;
import com.eHealth.eHealth.model.Patient;
import com.eHealth.eHealth.model.User;
import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FamilyMemberResponse {

    private Patient patient;
    private User user;
    private String relation;
    private boolean primary;
}