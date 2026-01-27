package com.eHealth.eHealth.patient.service.impl;

import java.time.Instant;
import java.util.List;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    public PatientServiceImpl(PatientRepository patientRepo, UserRepository userRepo, JwtSessionRepository jwtRepo) {
        this.patientRepo = patientRepo;
        this.userRepo = userRepo;
        this.jwtRepo = jwtRepo;
    }

    @Override
    @Transactional
    public List<PatientWithUserDTO> getAllPatients() {
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

    @Override
    @Transactional
    public Patient createPatientProfile(Patient patient, HttpServletRequest request) {
        String token = JwtUtil.extractToken(request);
        String userId = JwtUtil.getUserId(token, userRepo, jwtRepo);

        if (patientRepo.findByUserId(userId).isPresent()) {
            throw new RuntimeException("Patient profile already exists for this user");
        }
        
        patient.setUserId(userId);
        patient.setPatientId(null);
        patient.setCreatedAt(Instant.now());
        
        return patientRepo.save(patient);
    }

    @Override
    @Transactional
    public Patient getMyPatientProfile(HttpServletRequest request) {
        String token = JwtUtil.extractToken(request);
        String id = JwtUtil.getUserId(token, userRepo, jwtRepo);
        
        return patientRepo.findByUserId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient profile not created"));
    }

    @Override
    @Transactional
    public Patient updatePatient(String patientId, Patient updated, HttpServletRequest request) {
        String token = JwtUtil.extractToken(request);
        String currentUserId = JwtUtil.getUserId(token, userRepo, jwtRepo);

        Patient existingPatient = patientRepo.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        if (!existingPatient.getUserId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own profile");
        }

        existingPatient.setAge(updated.getAge());
        existingPatient.setGender(updated.getGender());
        existingPatient.setMobile(updated.getMobile());
        existingPatient.setFamilyId(updated.getFamilyId());
        existingPatient.setMedicalHistory(updated.getMedicalHistory());
        
        return patientRepo.save(existingPatient);
    }
}