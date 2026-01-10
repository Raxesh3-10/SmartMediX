package com.eHealth.eHealth.doctor.service.impl;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.eHealth.eHealth.doctor.service.DoctorService;
import com.eHealth.eHealth.model.Doctor;
import com.eHealth.eHealth.repository.DoctorRepository;
import com.eHealth.eHealth.repository.JwtSessionRepository;
import com.eHealth.eHealth.repository.UserRepository;
import com.eHealth.eHealth.utility.JwtUtil;

@Service
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepo;
    private final UserRepository userRepo;
    private final JwtSessionRepository jwtRepo;

    public DoctorServiceImpl(DoctorRepository doctorRepo,UserRepository userRepo,JwtSessionRepository JwtRepo) {
        this.doctorRepo = doctorRepo;
        this.userRepo=userRepo;
        this.jwtRepo=JwtRepo;
    }

    // ================= VALIDATION =================
    private String validateDoctorJwt(String jwt) {
        if (!JwtUtil.isDoctor(jwt,userRepo,jwtRepo)) {
            throw new RuntimeException("DOCTOR access only");
        }
        return JwtUtil.getEmail(jwt,jwtRepo); // used as unique identity
    }

    // ================= CREATE =================
    @Override
    public Doctor createDoctorProfile(Doctor doctor, String jwt) {

        validateDoctorJwt(jwt);
        String userId=JwtUtil.getUserId(jwt, userRepo, jwtRepo);
        // Enforce ONE doctor profile per user
        if (doctorRepo.findByUserId(doctor.getUserId()).isPresent()) {
            throw new RuntimeException("Doctor profile already exists for this user");
        }
        doctor.setUserId(userId);
        doctor.setDoctorId(null);
        doctor.setCreatedAt(Instant.now());
        return doctorRepo.save(doctor);
    }

@Override
public Doctor getDoctorByUser(String jwt) {
    validateDoctorJwt(jwt);
    String id = JwtUtil.getUserId(jwt, userRepo, jwtRepo);

    return doctorRepo.findByUserId(id)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Doctor profile not created"
                )
            );
}


    // ================= UPDATE =================
    @Override
    public Doctor updateDoctor(String doctorId, Doctor updated, String jwt) {

        validateDoctorJwt(jwt);

        return doctorRepo.findById(doctorId).map(d -> {
            d.setSpecialization(updated.getSpecialization());
            d.setExperienceYears(updated.getExperienceYears());
            d.setConsultationFee(updated.getConsultationFee());
            d.setPremium(updated.isPremium());
            d.setUpi(updated.getUpi());
            d.setSlots(updated.getSlots());
            return doctorRepo.save(d);
        }).orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    // ================= DELETE =================
    @Override
    public String deleteDoctor(String doctorId, String jwt) {

        if (!JwtUtil.isAdmin(jwt,userRepo,jwtRepo)) {
            throw new RuntimeException("ADMIN only operation");
        }

        doctorRepo.deleteById(doctorId);
        return "Doctor profile deleted";
    }
}
