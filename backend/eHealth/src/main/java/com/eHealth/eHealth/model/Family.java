package com.eHealth.eHealth.model;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Document(collection = "families")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Family {
    @Id
    private String familyId;
    private String ownerPatientId;   // primary patient
    private List<FamilyMember> members = new ArrayList<>();
    private Instant createdAt;
}