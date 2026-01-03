package com.eHealth.eHealth.model;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "appointments")
public class Appointment {

    @Id
    private String appointmentId;
    private String patientId;
    private String doctorId;
    private Instant appointmentTime;
    private String status;
    private int tokenNumber;
    private int estimatedWaitMinutes;
    private String videoRoomId;
    private Instant createdAt;

    public String getAppointmentId() { return appointmentId; }
    public void setAppointmentId(String appointmentId) { this.appointmentId = appointmentId; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public Instant getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(Instant appointmentTime) { this.appointmentTime = appointmentTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getTokenNumber() { return tokenNumber; }
    public void setTokenNumber(int tokenNumber) { this.tokenNumber = tokenNumber; }

    public int getEstimatedWaitMinutes() { return estimatedWaitMinutes; }
    public void setEstimatedWaitMinutes(int estimatedWaitMinutes) { this.estimatedWaitMinutes = estimatedWaitMinutes; }

    public String getVideoRoomId() { return videoRoomId; }
    public void setVideoRoomId(String videoRoomId) { this.videoRoomId = videoRoomId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}