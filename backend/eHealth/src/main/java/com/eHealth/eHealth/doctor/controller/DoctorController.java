package com.eHealth.eHealth.doctor.controller;

import java.util.List;

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
    public Doctor createDoctor(@RequestBody Doctor doctor,
                               @RequestHeader("JWT") String jwt) {
        return doctorService.createDoctorProfile(doctor, jwt);
    }
    
    @GetMapping("/me")
    public Doctor getMyDoctorProfile(@RequestHeader("JWT") String jwt) {
        return doctorService.getDoctorByUser(jwt);
    }

    @PutMapping("/{id}")
    public Doctor updateDoctor(@PathVariable String id,
                               @RequestBody Doctor doctor) {
        return doctorService.updateDoctor(id, doctor);
    }
}