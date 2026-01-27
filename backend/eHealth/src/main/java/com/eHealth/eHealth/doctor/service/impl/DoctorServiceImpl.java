package com.eHealth.eHealth.doctor.service.impl;

import java.time.Instant;
import java.util.List;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.eHealth.eHealth.doctor.service.DoctorService;
import com.eHealth.eHealth.dto.DoctorWithUserDTO;
import com.eHealth.eHealth.model.Doctor;
import com.eHealth.eHealth.model.User;
import com.eHealth.eHealth.repository.DoctorRepository;
import com.eHealth.eHealth.repository.JwtSessionRepository;
import com.eHealth.eHealth.repository.UserRepository;
import com.eHealth.eHealth.utility.JwtUtil;

@Service
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepo;
    private final UserRepository userRepo;
    private final JwtSessionRepository jwtRepo;

    public DoctorServiceImpl(DoctorRepository doctorRepo, UserRepository userRepo, JwtSessionRepository JwtRepo) {
        this.doctorRepo = doctorRepo;
        this.userRepo = userRepo;
        this.jwtRepo = JwtRepo;
    }

    @Override
    @Transactional
    public List<DoctorWithUserDTO> getAllDoctors() {
        return doctorRepo.findAll()
                .stream()
                .map(doctor -> {
                    User user = userRepo
                            .findById(doctor.getUserId())
                            .orElse(null);

                    return new DoctorWithUserDTO(doctor, user);
                })
                .toList();
    }

    @Override
    @Transactional
    public Doctor createDoctorProfile(Doctor doctor, HttpServletRequest request) {
        String token = JwtUtil.extractToken(request);
        String userId = JwtUtil.getUserId(token, userRepo, jwtRepo);
        
        if (doctorRepo.findByUserId(userId).isPresent()) {
            throw new RuntimeException("Doctor profile already exists for this user");
        }
        
        // Ensure the profile is linked to the logged-in user
        doctor.setUserId(userId);
        doctor.setDoctorId(null);
        doctor.setCreatedAt(Instant.now());
        return doctorRepo.save(doctor);
    }

    @Override
    @Transactional
    public Doctor getDoctorByUser(HttpServletRequest request) {
        String token = JwtUtil.extractToken(request);
        String id = JwtUtil.getUserId(token, userRepo, jwtRepo);
        
        return doctorRepo.findByUserId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor profile not created"));
    }

    @Override
    @Transactional
    public Doctor updateDoctor(String doctorId, Doctor updated, HttpServletRequest request) {
        String token = JwtUtil.extractToken(request);
        String currentUserId = JwtUtil.getUserId(token, userRepo, jwtRepo);

        Doctor existingDoctor = doctorRepo.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (!existingDoctor.getUserId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own profile");
        }

        existingDoctor.setSpecialization(updated.getSpecialization());
        existingDoctor.setExperienceYears(updated.getExperienceYears());
        existingDoctor.setConsultationFee(updated.getConsultationFee());
        existingDoctor.setPremium(updated.isPremium());
        existingDoctor.setUpi(updated.getUpi());
        existingDoctor.setSlots(updated.getSlots());

        return doctorRepo.save(existingDoctor);
    }
}