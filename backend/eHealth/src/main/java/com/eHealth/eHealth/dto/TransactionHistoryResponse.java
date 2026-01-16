package com.eHealth.eHealth.dto;

import com.eHealth.eHealth.model.Transaction;
import com.eHealth.eHealth.model.User;

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

    public Transaction getTransaction() {
        return transaction;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public String getDoctorEmail() {
        return doctorEmail;
    }
    public String getPatientName() {
        return patientName;
    }
    public String getPatientEmail() {
        return patientEmail;
    }
}
