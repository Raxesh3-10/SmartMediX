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
        return this.patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
    }

}