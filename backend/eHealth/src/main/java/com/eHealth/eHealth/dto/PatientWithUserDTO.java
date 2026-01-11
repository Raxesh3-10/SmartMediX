package com.eHealth.eHealth.dto;

import com.eHealth.eHealth.model.Patient;
import com.eHealth.eHealth.model.User;

public class PatientWithUserDTO {

    private Patient patient;
    private User user;

    public PatientWithUserDTO(Patient patient, User user) {
        this.patient = patient;
        this.user = user;
    }

    public Patient getPatient() {
        return patient;
    }

    public User getUser() {
        return user;
    }
}