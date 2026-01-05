package com.eHealth.eHealth.patient.service.impl;

import java.time.Instant;

import org.springframework.stereotype.Service;
import com.eHealth.eHealth.model.Patient;
import com.eHealth.eHealth.patient.service.PatientService;
import com.eHealth.eHealth.repository.PatientRepository;
import com.eHealth.eHealth.utility.JwtUtil;

@Service
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepo;

    public PatientServiceImpl(PatientRepository patientRepo) {
        this.patientRepo = patientRepo;
    }

    // ================= VALIDATION =================
    private String validatePatientJwt(String jwt) {
        if (!JwtUtil.isPatient(jwt)) {
            throw new RuntimeException("PATIENT access only");
        }
        return JwtUtil.getEmail(jwt);
    }

    // ================= CREATE =================
    @Override
    public Patient createPatientProfile(Patient patient, String jwt) {

        validatePatientJwt(jwt);

        // Ensure ONE patient per user
        if (patientRepo.findByUserId(patient.getUserId()).isPresent()) {
            throw new RuntimeException("Patient profile already exists for this user");
        }

        patient.setPatientId(null);
        patient.setCreatedAt(Instant.now());
        return patientRepo.save(patient);
    }

    // ================= READ =================
    @Override
    public Patient getPatientById(String patientId, String jwt) {

        if (!JwtUtil.isAdmin(jwt)) {
            throw new RuntimeException("ADMIN only access");
        }
        return patientRepo.findById(patientId).orElse(null);
    }

    @Override
    public Patient getMyPatientProfile(String jwt) {

        String email = validatePatientJwt(jwt);

        return patientRepo.findAll().stream()
                .filter(p -> email.equals(p.getUserId()))
                .findFirst()
                .orElse(null);
    }

    // ================= UPDATE =================
    @Override
    public Patient updatePatient(String patientId, Patient updated, String jwt) {

        validatePatientJwt(jwt);

        return patientRepo.findById(patientId).map(p -> {
            p.setAge(updated.getAge());
            p.setGender(updated.getGender());
            p.setMobile(updated.getMobile());
            p.setFamilyId(updated.getFamilyId());
            p.setMedicalHistory(updated.getMedicalHistory());
            return patientRepo.save(p);
        }).orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    // ================= DELETE =================
    @Override
    public String deletePatient(String patientId, String jwt) {

        if (!JwtUtil.isAdmin(jwt)) {
            throw new RuntimeException("ADMIN only operation");
        }
        patientRepo.deleteById(patientId);
        return "Patient profile deleted";
    }
}
