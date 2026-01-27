package com.eHealth.eHealth.doctor.controller;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import com.eHealth.eHealth.doctor.service.DoctorService;
import com.eHealth.eHealth.dto.DoctorWithUserDTO;
import com.eHealth.eHealth.model.Doctor;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping
    public List<DoctorWithUserDTO> getAllDoctors() {
        return doctorService.getAllDoctors();
    }
    
    @PostMapping
    public Doctor createDoctor(@RequestBody Doctor doctor, HttpServletRequest request) {
        return doctorService.createDoctorProfile(doctor, request);
    }
    
    @GetMapping("/me")
    public Doctor getMyDoctorProfile(HttpServletRequest request) {
        return doctorService.getDoctorByUser(request);
    }

    @PutMapping("/{id}")
    public Doctor updateDoctor(@PathVariable String id, 
                               @RequestBody Doctor doctor, 
                               HttpServletRequest request) {
        return doctorService.updateDoctor(id, doctor, request);
    }
}