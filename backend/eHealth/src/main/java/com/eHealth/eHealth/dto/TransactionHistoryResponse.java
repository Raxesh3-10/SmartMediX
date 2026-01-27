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
        return this.transaction;
    }

    public void setTransaction(Transaction transaction) {
        this.transaction = transaction;
    }

    public String getDoctorName() {
        return this.doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getDoctorEmail() {
        return this.doctorEmail;
    }

    public void setDoctorEmail(String doctorEmail) {
        this.doctorEmail = doctorEmail;
    }

    public String getPatientName() {
        return this.patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getPatientEmail() {
        return this.patientEmail;
    }

    public void setPatientEmail(String patientEmail) {
        this.patientEmail = patientEmail;
    }

}
