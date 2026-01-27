package com.eHealth.eHealth.dto;
public class AddFamilyMemberRequest {
    private String patientId;
    private String relation;

    public String getPatientId() {
        return this.patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getRelation() {
        return this.relation;
    }

    public void setRelation(String relation) {
        this.relation = relation;
    }

}