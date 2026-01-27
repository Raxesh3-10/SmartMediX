package com.eHealth.eHealth.dto;
import com.eHealth.eHealth.model.Patient;
import com.eHealth.eHealth.model.User;
public class FamilyMemberResponse {

    private Patient patient;
    private User user;
    private String relation;
    private boolean primary;

    public FamilyMemberResponse(Patient patient, User user, String relation, boolean primary) {
        this.patient = patient;
        this.user = user;
        this.relation = relation;
        this.primary = primary;
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

    public String getRelation() {
        return this.relation;
    }

    public void setRelation(String relation) {
        this.relation = relation;
    }

    public boolean isPrimary() {
        return this.primary;
    }

    public boolean getPrimary() {
        return this.primary;
    }

    public void setPrimary(boolean primary) {
        this.primary = primary;
    }

}