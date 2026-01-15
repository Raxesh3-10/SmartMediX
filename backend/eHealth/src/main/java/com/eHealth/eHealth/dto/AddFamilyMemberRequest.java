package com.eHealth.eHealth.dto;

public class AddFamilyMemberRequest {

    private String patientId;
    private String relation;
    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getRelation() { return relation; }
    public void setRelation(String relation) { this.relation = relation; }

}
