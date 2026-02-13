package com.eHealth.eHealth.medical.controller;
import com.eHealth.eHealth.medical.MedicalRecordService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    private final MedicalRecordService service;

    public MedicalRecordController(MedicalRecordService service) {
        this.service = service;
    }

    @PostMapping
    public String addRecord(
            @RequestBody String patientId,
            @RequestBody(required = false) String appointmentId,
            @RequestBody String diagnosis,
            @RequestBody String prescription,
            @RequestBody(required = false) List<String> fileUrls
    ) {
        service.createMedicalRecord(
                patientId,
                appointmentId,
                diagnosis,
                prescription,
                fileUrls
        );

        return "Medical record created successfully";
    }
}