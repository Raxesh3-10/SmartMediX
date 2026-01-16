package com.eHealth.eHealth.transaction.controller;

import com.eHealth.eHealth.dto.TransactionHistoryResponse;
import com.eHealth.eHealth.model.Transaction;
import com.eHealth.eHealth.transaction.service.TransactionService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }

    @PostMapping("/pay")
    public Transaction pay(@RequestParam String appointmentId) {
        return service.processTransaction(appointmentId);
    }

    @GetMapping("/history")
    public List<TransactionHistoryResponse> myTransactions(
            @RequestHeader("JWT") String jwt) {

        return service.getMyTransactions(jwt);
    }
}