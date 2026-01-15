package com.eHealth.eHealth.family;

import com.eHealth.eHealth.dto.AddFamilyMemberRequest;
import com.eHealth.eHealth.dto.FamilyMemberResponse;
import com.eHealth.eHealth.model.*;
import com.eHealth.eHealth.repository.*;
import com.eHealth.eHealth.utility.JwtUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class FamilyService {

    private final FamilyRepository familyRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final JwtSessionRepository jwtSessionRepository;

    public FamilyService(
            FamilyRepository familyRepository,
            PatientRepository patientRepository,
            UserRepository userRepository,
            JwtSessionRepository jwtSessionRepository
    ) {
        this.familyRepository = familyRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.jwtSessionRepository = jwtSessionRepository;
    }

    /* ================= JWT → PATIENT ================= */

    private Patient resolvePatient(String token) {
        String userId = JwtUtil.getUserId(token, userRepository, jwtSessionRepository);
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    /* ================= 1. CREATE FAMILY ================= */

    @Transactional
    public Family createFamily(String token) {

        Patient owner = resolvePatient(token);

        if (owner.getFamilyId() != null)
            throw new RuntimeException("Patient already belongs to a family");

        Family family = new Family();
        family.setOwnerPatientId(owner.getPatientId());

        FamilyMember self = new FamilyMember();
        self.setPatientId(owner.getPatientId());
        self.setRelation("SELF");
        self.setPrimary(true);

        family.getMembers().add(self);

        family = familyRepository.save(family);

        owner.setFamilyId(family.getFamilyId());
        patientRepository.save(owner);

        return family;
    }

    /* ================= 2. ADD MEMBER (MAX 4) ================= */

    @Transactional
    public Family addMember(String token, AddFamilyMemberRequest req) {

        Patient owner = resolvePatient(token);

        Family family = familyRepository.findByOwnerPatientId(owner.getPatientId())
                .orElseThrow(() -> new RuntimeException("Family not found"));

        if (family.getMembers().size() >= 4)
            throw new RuntimeException("Maximum 4 family members allowed");

        Patient newMember = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        if (newMember.getFamilyId() != null)
            throw new RuntimeException("Patient already belongs to another family");

        FamilyMember member = new FamilyMember();
        member.setPatientId(newMember.getPatientId());
        member.setRelation(req.getRelation());
        member.setPrimary(false);

        family.getMembers().add(member);

        newMember.setFamilyId(family.getFamilyId());

        patientRepository.save(newMember);
        return familyRepository.save(family);
    }

    /* ================= 3. REMOVE MEMBER + AUTO DELETE ================= */

    @Transactional
    public void removeMember(String token, String patientId) {

        Patient owner = resolvePatient(token);

        Family family = familyRepository.findByOwnerPatientId(owner.getPatientId())
                .orElseThrow(() -> new RuntimeException("Family not found"));

        family.getMembers().removeIf(m -> m.getPatientId().equals(patientId));

        patientRepository.findById(patientId).ifPresent(p -> {
            p.setFamilyId(null);
            patientRepository.save(p);
        });

        if (family.getMembers().size() == 1) {
            // only owner remains
            owner.setFamilyId(null);
            patientRepository.save(owner);
            familyRepository.delete(family);
        } else {
            familyRepository.save(family);
        }
    }

    /* ================= 4. GET FAMILY (Patient + User) ================= */

    public List<FamilyMemberResponse> getFamilyMembers(String token) {

        Patient patient = resolvePatient(token);

        if (patient.getFamilyId() == null)
            return List.of();

        Family family = familyRepository.findById(patient.getFamilyId())
                .orElseThrow(() -> new RuntimeException("Family not found"));

        List<FamilyMemberResponse> response = new ArrayList<>();

        for (FamilyMember m : family.getMembers()) {

            Patient p = patientRepository.findById(m.getPatientId()).orElse(null);
            if (p == null) continue;

            User u = userRepository.findById(p.getUserId()).orElse(null);
            response.add(new FamilyMemberResponse(p, u));
        }

        return response;
    }
}