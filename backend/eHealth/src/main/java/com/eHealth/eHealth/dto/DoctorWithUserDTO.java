package com.eHealth.eHealth.dto;
import com.eHealth.eHealth.model.Doctor;
import com.eHealth.eHealth.model.User;
public class DoctorWithUserDTO {
    private Doctor doctor;
    private User user;

    public DoctorWithUserDTO(Doctor doctor, User user) {
        this.doctor = doctor;
        this.user = user;
    }

    public Doctor getDoctor() {
        return this.doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
    }
    
}