package com.eHealth.eHealth.model;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
@Document(collection = "families")
public class Family {
    @Id
    private String familyId;
    private String ownerPatientId;   // primary patient
    private List<FamilyMember> members = new ArrayList<>();
    private Instant createdAt;

    public String getFamilyId() {
        return this.familyId;
    }

    public void setFamilyId(String familyId) {
        this.familyId = familyId;
    }

    public String getOwnerPatientId() {
        return this.ownerPatientId;
    }

    public void setOwnerPatientId(String ownerPatientId) {
        this.ownerPatientId = ownerPatientId;
    }

    public List<FamilyMember> getMembers() {
        return this.members;
    }

    public void setMembers(List<FamilyMember> members) {
        this.members = members;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

}