package com.eHealth.eHealth.patient.controller;

import java.util.List;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import com.eHealth.eHealth.dto.PatientWithUserDTO;
import com.eHealth.eHealth.model.Patient;
import com.eHealth.eHealth.patient.service.PatientService;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    public List<PatientWithUserDTO> getAllPatients() {
        return patientService.getAllPatients();
    }

    // ================= CREATE =================
    @PostMapping
    public Patient createPatient(@RequestBody Patient patient, HttpServletRequest request) {
        return patientService.createPatientProfile(patient, request);
    }

    // ================= READ =================
    @GetMapping("/me")
    public Patient getMyProfile(HttpServletRequest request) {
        return patientService.getMyPatientProfile(request);
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    public Patient updatePatient(@PathVariable String id, 
                                 @RequestBody Patient patient, 
                                 HttpServletRequest request) {
        return patientService.updatePatient(id, patient, request);
    }
}