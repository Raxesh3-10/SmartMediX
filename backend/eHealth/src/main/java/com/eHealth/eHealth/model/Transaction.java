package com.eHealth.eHealth.model;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
@Document(collection = "transactions")
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

    public String getTransactionId() {
        return this.transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getAppointmentId() {
        return this.appointmentId;
    }

    public void setAppointmentId(String appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getPatientId() {
        return this.patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getDoctorId() {
        return this.doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public double getConsultationFee() {
        return this.consultationFee;
    }

    public void setConsultationFee(double consultationFee) {
        this.consultationFee = consultationFee;
    }

    public double getPatientPlatformFee() {
        return this.patientPlatformFee;
    }

    public void setPatientPlatformFee(double patientPlatformFee) {
        this.patientPlatformFee = patientPlatformFee;
    }

    public double getDoctorPlatformFee() {
        return this.doctorPlatformFee;
    }

    public void setDoctorPlatformFee(double doctorPlatformFee) {
        this.doctorPlatformFee = doctorPlatformFee;
    }

    public double getTax() {
        return this.tax;
    }

    public void setTax(double tax) {
        this.tax = tax;
    }

    public double getTotalPaidByPatient() {
        return this.totalPaidByPatient;
    }

    public void setTotalPaidByPatient(double totalPaidByPatient) {
        this.totalPaidByPatient = totalPaidByPatient;
    }

    public double getTotalDoctorReceives() {
        return this.totalDoctorReceives;
    }

    public void setTotalDoctorReceives(double totalDoctorReceives) {
        this.totalDoctorReceives = totalDoctorReceives;
    }

    public String getStatus() {
        return this.status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getPaidAt() {
        return this.paidAt;
    }

    public void setPaidAt(Instant paidAt) {
        this.paidAt = paidAt;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

}