package com.eHealth.eHealth.model;
import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Document(collection = "patients")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Patient {
    @Id
    private String patientId;
    private String userId;
    private String mobile;
    private String gender;
    private int age;
    private String familyId;
    private List<MedicalRecord> medicalHistory;
    private Instant createdAt;
}