package com.eHealth.eHealth.dto;
import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AddFamilyMemberRequest {
    private String patientId;
    private String relation;
}