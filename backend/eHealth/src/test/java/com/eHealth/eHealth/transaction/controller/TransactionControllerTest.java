package com.eHealth.eHealth.transaction.controller;

import com.eHealth.eHealth.dto.TransactionHistoryResponse;
import com.eHealth.eHealth.model.Transaction;
import com.eHealth.eHealth.transaction.service.TransactionService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TransactionController.class)
public class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TransactionService transactionService;

    @MockBean
    private com.eHealth.eHealth.repository.JwtSessionRepository jwtSessionRepository;

    @MockBean
    private JavaMailSender javaMailSender;

    @Test
    @WithMockUser(roles = "DOCTOR")
    public void testMyTransactions() throws Exception {
        // Mock data
        Transaction transaction1 = new Transaction();
        transaction1.setTransactionId("1");
        transaction1.setTotalPaidByPatient(100.0);
        transaction1.setStatus("COMPLETED");

        Transaction transaction2 = new Transaction();
        transaction2.setTransactionId("2");
        transaction2.setTotalPaidByPatient(200.0);
        transaction2.setStatus("PENDING");

        com.eHealth.eHealth.model.User doctorUser = new com.eHealth.eHealth.model.User();
        doctorUser.setName("Dr. Who");
        doctorUser.setEmail("dr.who@example.com");

        com.eHealth.eHealth.model.User patientUser = new com.eHealth.eHealth.model.User();
        patientUser.setName("John Doe");
        patientUser.setEmail("john.doe@example.com");

        TransactionHistoryResponse response1 = new TransactionHistoryResponse(transaction1, doctorUser, patientUser);
        TransactionHistoryResponse response2 = new TransactionHistoryResponse(transaction2, doctorUser, patientUser);

        List<TransactionHistoryResponse> mockTransactions = Arrays.asList(response1, response2);

        when(transactionService.getMyTransactions(any(HttpServletRequest.class))).thenReturn(mockTransactions);

        // Perform GET request
        mockMvc.perform(get("/api/payments/history")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].transaction.transactionId").value("1"))
                .andExpect(jsonPath("$[0].transaction.totalPaidByPatient").value(100.0))
                .andExpect(jsonPath("$[0].transaction.status").value("COMPLETED"))
                .andExpect(jsonPath("$[1].transaction.transactionId").value("2"))
                .andExpect(jsonPath("$[1].transaction.totalPaidByPatient").value(200.0))
                .andExpect(jsonPath("$[1].transaction.status").value("PENDING"));
    }

    // Add more tests for other endpoints if needed
}