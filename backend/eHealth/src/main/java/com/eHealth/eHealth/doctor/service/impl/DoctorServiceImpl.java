package com.eHealth.eHealth.doctor.service.impl;

import java.time.Instant;
import java.util.List;
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

    public DoctorServiceImpl(DoctorRepository doctorRepo,UserRepository userRepo,JwtSessionRepository JwtRepo) {
        this.doctorRepo = doctorRepo;
        this.userRepo=userRepo;
        this.jwtRepo=JwtRepo;
    }

    @Override
    @Transactional
    public List<DoctorWithUserDTO> getAllDoctors() {
        return doctorRepo.findAll()
                .stream()
                .map(Doctor -> {
                    User user = userRepo
                            .findById(Doctor.getUserId())
                            .orElse(null);

                    return new DoctorWithUserDTO(Doctor, user);
                })
                .toList();
    }
    @Override
    @Transactional
    public Doctor createDoctorProfile(Doctor doctor, String jwt) {
        String userId=JwtUtil.getUserId(jwt, userRepo, jwtRepo);
        if (doctorRepo.findByUserId(doctor.getUserId()).isPresent()) {
            throw new RuntimeException("Doctor profile already exists for this user");
        }
        doctor.setUserId(userId);
        doctor.setDoctorId(null);
        doctor.setCreatedAt(Instant.now());
        return doctorRepo.save(doctor);
    }

@Override
@Transactional
public Doctor getDoctorByUser(String jwt) {
    String id = JwtUtil.getUserId(jwt, userRepo, jwtRepo);
    return doctorRepo.findByUserId(id).orElseThrow(() ->new ResponseStatusException(HttpStatus.NOT_FOUND,"Doctor profile not created"));
}

    @Override
    @Transactional
    public Doctor updateDoctor(String doctorId, Doctor updated) {

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
}