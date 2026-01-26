package com.eHealth.eHealth.transaction.controller;

import com.eHealth.eHealth.dto.TransactionHistoryResponse;
import com.eHealth.eHealth.model.Transaction;
import com.eHealth.eHealth.transaction.service.TransactionService;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
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
            @RequestHeader("JWT") String jwt,HttpServletRequest request) {

        return service.getMyTransactions(jwt,request);
    }
}