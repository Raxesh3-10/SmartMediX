package com.eHealth.eHealth.model;

import java.time.Instant;
import java.time.LocalTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "appointments")
public class Appointment {

    @Id
    private String appointmentId;

    private String doctorId;
    private String patientId;

    private String day;
    private LocalTime startTime;
    private LocalTime endTime;

    private Instant appointmentDate; // specific date (this week only)

    private int tokenNumber;
    private int estimatedWaitMinutes;

    private String status; 
    // CREATED, PAID, CONFIRMED, COMPLETED, CANCELLED

    private String conferenceType; // VIDEO / VOICE
    private String roomId;

    private Instant createdAt;

    public String getAppointmentId() { return appointmentId; }
    public void setAppointmentId(String appointmentId) { this.appointmentId = appointmentId; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }


    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getTokenNumber() { return tokenNumber; }
    public void setTokenNumber(int tokenNumber) { this.tokenNumber = tokenNumber; }

    public int getEstimatedWaitMinutes() { return estimatedWaitMinutes; }
    public void setEstimatedWaitMinutes(int estimatedWaitMinutes) { this.estimatedWaitMinutes = estimatedWaitMinutes; }

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public String getConferenceType() { return conferenceType; }
    public void setConferenceType(String conferenceType) { this.conferenceType = conferenceType; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    
    public String getDay() { return day; }
    public void setDay(String day) { this.day = day; }  
    
    public Instant getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(Instant appointmentDate) { this.appointmentDate = appointmentDate; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}