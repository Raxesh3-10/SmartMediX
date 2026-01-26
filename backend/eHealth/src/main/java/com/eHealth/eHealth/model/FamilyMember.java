package com.eHealth.eHealth.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FamilyMember {
    private String patientId;
    private String relation;
    private boolean primary;
}