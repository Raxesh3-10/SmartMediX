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
    public Patient getPatient() { return patient; }
    public User getUser() { return user; }
    public String getRelation() { return relation; }
    public boolean isPrimary() { return primary; }
}