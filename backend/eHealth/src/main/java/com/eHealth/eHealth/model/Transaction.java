package com.eHealth.eHealth.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "transactions")
public class Transaction {

    @Id
    private String transactionId;

    private String appointmentId;
    private String patientId;
    private String doctorId;

    /* ===== Base Amount ===== */
    private double consultationFee;

    /* ===== Platform Charges ===== */
    private double patientPlatformFee; // 0 now, 3% later
    private double doctorPlatformFee;  // 0 now, 3% later

    /* ===== Tax (Website does NOT charge tax) ===== */
    private double tax; // ALWAYS 0.0

    /* ===== Totals ===== */
    private double totalPaidByPatient;
    private double totalDoctorReceives;

    /* ===== Payment Info ===== */
    private String status; // SUCCESS | FAILED | PENDING
    private Instant paidAt;
    private Instant createdAt;

    /* getters & setters */

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(String appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public double getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(double consultationFee) {
        this.consultationFee = consultationFee;
    }

    public double getPatientPlatformFee() {
        return patientPlatformFee;
    }

    public void setPatientPlatformFee(double patientPlatformFee) {
        this.patientPlatformFee = patientPlatformFee;
    }   
    public double getDoctorPlatformFee() {
        return doctorPlatformFee;
    }
    public void setDoctorPlatformFee(double doctorPlatformFee) {
        this.doctorPlatformFee = doctorPlatformFee;
    }
    public double getTax() {
        return tax;
    }
    public void setTax(double tax) {
        this.tax = tax;
    }
    public double getTotalPaidByPatient() {
        return totalPaidByPatient;
    }
    public void setTotalPaidByPatient(double totalPaidByPatient) {
        this.totalPaidByPatient = totalPaidByPatient;
    }
    public double getTotalDoctorReceives() {
        return totalDoctorReceives;
    }
    public void setTotalDoctorReceives(double totalDoctorReceives) {
        this.totalDoctorReceives = totalDoctorReceives;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public Instant getPaidAt() {
        return paidAt;
    }
    public void setPaidAt(Instant paidAt) {
        this.paidAt = paidAt;
    }
    public Instant getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}