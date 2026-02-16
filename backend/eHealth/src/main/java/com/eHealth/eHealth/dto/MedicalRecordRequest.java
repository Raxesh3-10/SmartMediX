package com.eHealth.eHealth.dto;
import java.util.List;
public class MedicalRecordRequest {
    private String patientId;
    private String appointmentId; // optional
    private String diagnosis;
    private String prescription;
    private List<String> fileUrls;
    public MedicalRecordRequest() {}
    public String getPatientId() {
        return patientId;
    }


    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }


    public String getAppointmentId() {
        return appointmentId;
    }


    public void setAppointmentId(String appointmentId) {
        this.appointmentId = appointmentId;
    }


    public String getDiagnosis() {
        return diagnosis;
    }


    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }


    public String getPrescription() {
        return prescription;
    }


    public void setPrescription(String prescription) {
        this.prescription = prescription;
    }


    public List<String> getFileUrls() {
        return fileUrls;
    }


    public void setFileUrls(List<String> fileUrls) {
        this.fileUrls = fileUrls;
    }
}