package com.eHealth.eHealth.patient.service.impl;

import java.util.*;

import org.springframework.stereotype.Service;

import com.eHealth.eHealth.model.*;
import com.eHealth.eHealth.patient.service.PatientBillingService;
import com.eHealth.eHealth.repository.*;
import com.eHealth.eHealth.utility.JwtUtil;

@Service
public class PatientBillingServiceImpl implements PatientBillingService {

    private final PatientRepository patientRepo;
    private final BillRepository billRepo;
    private final PaymentRepository paymentRepo;
    private final UserRepository userRepo;
    private final JwtSessionRepository jwtRepo;

    public PatientBillingServiceImpl(
            PatientRepository patientRepo,
            BillRepository billRepo,
            PaymentRepository paymentRepo,
            UserRepository userRepo,
            JwtSessionRepository jwtRepo) {

        this.patientRepo = patientRepo;
        this.billRepo = billRepo;
        this.paymentRepo = paymentRepo;
        this.userRepo = userRepo;
        this.jwtRepo = jwtRepo;
    }

    @Override
    public List<Map<String, Object>> getMyBillingHistory(String jwt) {

        if (!JwtUtil.isPatient(jwt, userRepo, jwtRepo)) {
            throw new RuntimeException("PATIENT access only");
        }

        String userId = JwtUtil.getUserId(jwt, userRepo, jwtRepo);

        Patient patient = patientRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

        List<Bill> bills = billRepo.findByPatientId(patient.getPatientId());

        List<Map<String, Object>> response = new ArrayList<>();

        for (Bill bill : bills) {
            Payment payment = paymentRepo
                    .findById(bill.getPaymentId())
                    .orElse(null);

            Map<String, Object> map = new HashMap<>();
            map.put("bill", bill);
            map.put("payment", payment);

            response.add(map);
        }

        return response;
    }
}