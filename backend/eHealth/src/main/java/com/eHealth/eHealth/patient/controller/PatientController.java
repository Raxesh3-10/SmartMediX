package com.eHealth.eHealth.patient.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.eHealth.eHealth.dto.PatientWithUserDTO;
import com.eHealth.eHealth.model.Patient;
import com.eHealth.eHealth.patient.service.PatientService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    public List<PatientWithUserDTO> getAllPatients(@RequestHeader("JWT") String jwt) {
        return patientService.getAllPatients(jwt);
    }

    // ================= CREATE =================
    @PostMapping
    public Patient createPatient(@RequestBody Patient patient,
                                 @RequestHeader("JWT") String jwt) {
        return patientService.createPatientProfile(patient, jwt);
    }

    // ================= READ =================
    @GetMapping("/me")
    public Patient getMyProfile(@RequestHeader("JWT") String jwt) {
        return patientService.getMyPatientProfile(jwt);
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    public Patient updatePatient(@PathVariable String id,
                                 @RequestBody Patient patient,
                                 @RequestHeader("JWT") String jwt) {
        return patientService.updatePatient(id, patient, jwt);
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    public String deletePatient(@PathVariable String id,
                                @RequestHeader("JWT") String jwt) {
        return patientService.deletePatient(id, jwt);
    }
}