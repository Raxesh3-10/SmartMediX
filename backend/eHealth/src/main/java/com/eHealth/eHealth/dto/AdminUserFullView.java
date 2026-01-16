package com.eHealth.eHealth.dto;

import java.util.List;

import com.eHealth.eHealth.model.*;

public class AdminUserFullView {

    private User user;

    // one of these will be populated
    private Patient patient;
    private Doctor doctor;

    private Family family;

    private List<Appointment> appointments;
    private List<Transaction> transactions;

    // getters and setters
    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }
    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }
    public Doctor getDoctor() {
        return doctor;
    }
    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }
    public Family getFamily() {
        return family;
    }
    public void setFamily(Family family) {
        this.family = family;
    }

    public List<Appointment> getAppointments() {
        return appointments;
    }
    public void setAppointments(List<Appointment> appointments) {
        this.appointments = appointments;
    }
    public List<Transaction> getTransactions() {
        return transactions;
    }
    public void setTransactions(List<Transaction> transactions) {
        this.transactions = transactions;
    }
}
