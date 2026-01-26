package com.eHealth.eHealth.model;
import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "doctors")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Doctor {
    @Id
    private String doctorId;
    private String userId;
    private String upi;
    private String specialization;
    private int experienceYears;
    private double consultationFee;
    private boolean premium;
    private List<AvailabilitySlot> slots;
    private Instant createdAt;
}