package com.eHealth.eHealth.dto;

import com.eHealth.eHealth.model.Transaction;
import com.eHealth.eHealth.model.User;
import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TransactionHistoryResponse {
    private Transaction transaction;
    private String doctorName;
    private String doctorEmail;
    private String patientName;
    private String patientEmail;
    public TransactionHistoryResponse(Transaction transaction, User doctorUser ,User patientUser) {
        this.transaction = transaction;
        this.doctorName = doctorUser.getName();
        this.doctorEmail = doctorUser.getEmail();
        this.patientName = patientUser.getName();
        this.patientEmail = patientUser.getEmail();
    }
}
