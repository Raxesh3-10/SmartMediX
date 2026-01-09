package com.eHealth.eHealth.doctor.controller;

import org.springframework.web.bind.annotation.*;

import com.eHealth.eHealth.doctor.service.DoctorService;
import com.eHealth.eHealth.model.Doctor;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    // ================= CREATE =================
    @PostMapping("/")
    public Doctor createDoctor(@RequestBody Doctor doctor,
                               @RequestHeader("JWT") String jwt) {
        return doctorService.createDoctorProfile(doctor, jwt);
    }
    @GetMapping("/about/me")
    public Doctor getMyDoctorProfile(@RequestHeader("JWT") String jwt) {
        return doctorService.getDoctorByUser(jwt);
    }
    // ================= READ =================
    @GetMapping("/{id}")
    public Doctor getDoctor(@PathVariable String id,
                            @RequestHeader("JWT") String jwt) {
        return doctorService.getDoctorById(id, jwt);
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    public Doctor updateDoctor(@PathVariable String id,
                               @RequestBody Doctor doctor,
                               @RequestHeader("JWT") String jwt) {
        return doctorService.updateDoctor(id, doctor, jwt);
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    public String deleteDoctor(@PathVariable String id,
                               @RequestHeader("JWT") String jwt) {
        return doctorService.deleteDoctor(id, jwt);
    }
}