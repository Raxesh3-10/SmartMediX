package com.eHealth.eHealth.patient.service.impl;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.eHealth.eHealth.dto.PatientWithUserDTO;
import com.eHealth.eHealth.model.Patient;
import com.eHealth.eHealth.model.User;
import com.eHealth.eHealth.patient.service.PatientService;
import com.eHealth.eHealth.repository.JwtSessionRepository;
import com.eHealth.eHealth.repository.PatientRepository;
import com.eHealth.eHealth.repository.UserRepository;
import com.eHealth.eHealth.utility.JwtUtil;

@Service
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepo;
    private final UserRepository userRepo;
    private final JwtSessionRepository jwtRepo;

    public PatientServiceImpl(PatientRepository patientRepo,UserRepository userRepo,JwtSessionRepository jwtRepo) {
        this.patientRepo = patientRepo;
        this.userRepo=userRepo;
        this.jwtRepo=jwtRepo;
    }

    @Override
    public List<PatientWithUserDTO> getAllPatients(String jwt) {
        validatePatientJwt(jwt);
        return patientRepo.findAll()
                .stream()
                .map(patient -> {
                    User user = userRepo
                            .findById(patient.getUserId())
                            .orElse(null);

                    return new PatientWithUserDTO(patient, user);
                })
                .toList();
    }

    // ================= VALIDATION =================
    private String validatePatientJwt(String jwt) {
        if (!JwtUtil.isPatient(jwt,userRepo,jwtRepo)) {
            throw new RuntimeException("PATIENT access only");
        }
        return JwtUtil.getEmail(jwt,jwtRepo);
    }

    // ================= CREATE =================
    @Override
    public Patient createPatientProfile(Patient patient, String jwt) {

        validatePatientJwt(jwt);
        String userId=JwtUtil.getUserId(jwt, userRepo, jwtRepo);
        // Ensure ONE patient per user
        if (patientRepo.findByUserId(patient.getUserId()).isPresent()) {
            throw new RuntimeException("Patient profile already exists for this user");
        }
        patient.setUserId(userId);
        patient.setPatientId(null);
        patient.setCreatedAt(Instant.now());
        return patientRepo.save(patient);
    }

@Override
public Patient getMyPatientProfile(String jwt) {
    validatePatientJwt(jwt);
    String id = JwtUtil.getUserId(jwt,userRepo,jwtRepo);
    return patientRepo.findByUserId(id)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Patient profile not created"
                )
            );
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

        if (!JwtUtil.isAdmin(jwt,userRepo,jwtRepo)) {
            throw new RuntimeException("ADMIN only operation");
        }
        patientRepo.deleteById(patientId);
        return "Patient profile deleted";
    }
}
