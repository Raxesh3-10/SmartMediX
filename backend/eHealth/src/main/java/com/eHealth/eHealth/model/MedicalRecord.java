package com.eHealth.eHealth.model;
import java.time.Instant;
import java.util.List;
public class MedicalRecord {
    private String appointmentId;
    private String diagnosis;
    private String prescription;
    private List<String> fileUrls;
    private Instant createdAt;

    public String getAppointmentId() {
        return this.appointmentId;
    }

    public void setAppointmentId(String appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getDiagnosis() {
        return this.diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getPrescription() {
        return this.prescription;
    }

    public void setPrescription(String prescription) {
        this.prescription = prescription;
    }

    public List<String> getFileUrls() {
        return this.fileUrls;
    }

    public void setFileUrls(List<String> fileUrls) {
        this.fileUrls = fileUrls;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

}