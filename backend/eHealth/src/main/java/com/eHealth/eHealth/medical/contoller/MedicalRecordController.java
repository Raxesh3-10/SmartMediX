package com.eHealth.eHealth.medical.contoller;

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
    public String addRecord(@RequestParam String patientId,
                            @RequestParam String doctorId,
                            @RequestParam String appointmentId,
                            @RequestParam String diagnosis,
                            @RequestParam String prescription,
                            @RequestParam List<String> fileIds) {

        service.createMedicalRecord(patientId, doctorId, appointmentId,
                diagnosis, prescription, fileIds);

        return "Medical record added";
    }
}
