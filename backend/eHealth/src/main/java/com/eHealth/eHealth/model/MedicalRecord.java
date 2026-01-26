package com.eHealth.eHealth.model;
import java.time.Instant;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MedicalRecord {
    private String doctorId;
    private String appointmentId;
    private String diagnosis;
    private String prescription;
    private List<String> fileUrls;
    private Instant createdAt;
}