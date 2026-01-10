package com.eHealth.eHealth.payment.controller;

import com.eHealth.eHealth.model.Payment;
import com.eHealth.eHealth.payment.UpiPaymentService;

import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final UpiPaymentService service;

    public PaymentController(UpiPaymentService service) {
        this.service = service;
    }

    @PostMapping("/upi")
    public Payment pay(@RequestParam String appointmentId,
                       @RequestParam String patientId,
                       @RequestParam double amount) {

        return service.processUpiPayment(appointmentId, patientId, amount);
    }
}
