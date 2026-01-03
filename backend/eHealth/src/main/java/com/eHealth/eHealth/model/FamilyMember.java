package com.eHealth.eHealth.model;

public class FamilyMember {

    private String patientId;
    private String relation;
    private boolean primary;

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getRelation() { return relation; }
    public void setRelation(String relation) { this.relation = relation; }

    public boolean isPrimary() { return primary; }
    public void setPrimary(boolean primary) { this.primary = primary; }
}