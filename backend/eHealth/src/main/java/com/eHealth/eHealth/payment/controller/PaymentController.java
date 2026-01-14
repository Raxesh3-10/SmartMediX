package com.eHealth.eHealth.payment.controller;

import com.eHealth.eHealth.model.Payment;
import com.eHealth.eHealth.payment.service.PaymentService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    /**
     * One-click payment (test mode)
     */
    @PostMapping("/pay")
    public Payment pay(@RequestParam String appointmentId) {
        return service.processPayment(appointmentId);
    }
}