package com.eHealth.eHealth.model;

import java.time.Instant;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "families")
public class Family {

    @Id
    private String familyId;

    private String ownerUserId;
    private List<FamilyMember> members;
    private Instant createdAt;

    public String getFamilyId() { return familyId; }
    public void setFamilyId(String familyId) { this.familyId = familyId; }

    public String getOwnerUserId() { return ownerUserId; }
    public void setOwnerUserId(String ownerUserId) { this.ownerUserId = ownerUserId; }

    public List<FamilyMember> getMembers() { return members; }
    public void setMembers(List<FamilyMember> members) { this.members = members; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
