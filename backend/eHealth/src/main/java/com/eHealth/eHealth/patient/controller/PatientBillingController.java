package com.eHealth.eHealth.patient.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.eHealth.eHealth.patient.service.PatientBillingService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/patients/billing")
public class PatientBillingController {

    private final PatientBillingService billingService;

    public PatientBillingController(PatientBillingService billingService) {
        this.billingService = billingService;
    }

    /**
     * Fetch bills + payment history for logged-in patient
     */
    @GetMapping("/history")
    public List<Map<String, Object>> getBillingHistory(
            @RequestHeader("JWT") String jwt) {

        return billingService.getMyBillingHistory(jwt);
    }
}