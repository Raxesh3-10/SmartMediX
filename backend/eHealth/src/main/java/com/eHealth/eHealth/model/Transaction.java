package com.eHealth.eHealth.model;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;
@Document(collection = "transactions")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Transaction {
    @Id
    private String transactionId;
    private String appointmentId;
    private String patientId;
    private String doctorId;
    private double consultationFee;
    private double patientPlatformFee; 
    private double doctorPlatformFee;  
    private double tax; 
    private double totalPaidByPatient;
    private double totalDoctorReceives;
    private String status; // SUCCESS | FAILED | PENDING
    private Instant paidAt;
    private Instant createdAt;
}