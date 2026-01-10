package com.eHealth.eHealth.medical.contoller;

import com.eHealth.eHealth.medical.MedicalRecordService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    private final MedicalRecordService service;

    public MedicalRecordController(MedicalRecordService service) {
        this.service = service;
    }

    @PostMapping(consumes = "multipart/form-data")
    public String addRecord(
            @RequestParam String patientId,
            @RequestParam String doctorId,
            @RequestParam String appointmentId,
            @RequestParam String diagnosis,
            @RequestParam String prescription,
            @RequestPart(required = false) MultipartFile[] images,
            @RequestPart(required = false) MultipartFile[] documents
    ) throws Exception {

        service.createMedicalRecord(
                patientId,
                doctorId,
                appointmentId,
                diagnosis,
                prescription,
                images,
                documents
        );

        return "Medical record created successfully";
    }
}