package com.eHealth.eHealth.model;

import java.time.Instant;
import java.util.List;

public class MedicalRecord {

    private String doctorId;
    private String appointmentId;
    private String diagnosis;
    private String prescription;
    private List<String> fileIds;
    private Instant createdAt;

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public String getAppointmentId() { return appointmentId; }
    public void setAppointmentId(String appointmentId) { this.appointmentId = appointmentId; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getPrescription() { return prescription; }
    public void setPrescription(String prescription) { this.prescription = prescription; }

    public List<String> getFileIds() { return fileIds; }
    public void setFileIds(List<String> fileIds) { this.fileIds = fileIds; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}