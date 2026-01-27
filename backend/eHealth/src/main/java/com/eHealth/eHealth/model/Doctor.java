package com.eHealth.eHealth.model;
import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
@Document(collection = "doctors")

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

    public String getDoctorId() {
        return this.doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public String getUserId() {
        return this.userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUpi() {
        return this.upi;
    }

    public void setUpi(String upi) {
        this.upi = upi;
    }

    public String getSpecialization() {
        return this.specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public int getExperienceYears() {
        return this.experienceYears;
    }

    public void setExperienceYears(int experienceYears) {
        this.experienceYears = experienceYears;
    }

    public double getConsultationFee() {
        return this.consultationFee;
    }

    public void setConsultationFee(double consultationFee) {
        this.consultationFee = consultationFee;
    }

    public boolean isPremium() {
        return this.premium;
    }

    public boolean getPremium() {
        return this.premium;
    }

    public void setPremium(boolean premium) {
        this.premium = premium;
    }

    public List<AvailabilitySlot> getSlots() {
        return this.slots;
    }

    public void setSlots(List<AvailabilitySlot> slots) {
        this.slots = slots;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

}