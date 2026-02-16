package com.eHealth.eHealth.medical.controller;


import com.eHealth.eHealth.medical.MedicalRecordService;
import com.eHealth.eHealth.dto.MedicalRecordRequest;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {


    private final MedicalRecordService service;


    public MedicalRecordController(MedicalRecordService service) {
        this.service = service;
    }


    @PostMapping
    public String addRecord(@RequestBody MedicalRecordRequest request) {


        service.createMedicalRecord(
                request.getPatientId(),
                request.getAppointmentId(), // can be null (AI advice case)
                request.getDiagnosis(),
                request.getPrescription(),
                request.getFileUrls()
        );


        return "Medical record created successfully";
    }
}


