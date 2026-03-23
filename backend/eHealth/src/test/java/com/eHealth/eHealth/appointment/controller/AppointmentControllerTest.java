package com.eHealth.eHealth.appointment.controller;

import com.eHealth.eHealth.appointment.service.AppointmentService;
import com.eHealth.eHealth.model.Appointment;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AppointmentController.class)
public class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AppointmentService appointmentService;

    @MockBean
    private com.eHealth.eHealth.repository.JwtSessionRepository jwtSessionRepository;

    @MockBean
    private JavaMailSender javaMailSender;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "DOCTOR")
    public void testGetDoctorAppointments() throws Exception {
        // Mock data
        Map<String, Object> appointment1 = new HashMap<>();
        appointment1.put("id", "1");
        appointment1.put("patientName", "John Doe");
        appointment1.put("date", "2023-10-01");

        Map<String, Object> appointment2 = new HashMap<>();
        appointment2.put("id", "2");
        appointment2.put("patientName", "Jane Smith");
        appointment2.put("date", "2023-10-02");

        List<Map<String, Object>> mockAppointments = Arrays.asList(appointment1, appointment2);

        when(appointmentService.getDoctorAppointments(anyString())).thenReturn(mockAppointments);

        // Perform GET request
        mockMvc.perform(get("/api/appointments/doctor/{doctorId}", "doc123")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value("1"))
                .andExpect(jsonPath("$[0].patientName").value("John Doe"))
                .andExpect(jsonPath("$[1].id").value("2"))
                .andExpect(jsonPath("$[1].patientName").value("Jane Smith"));
    }

    // Add more tests for other endpoints if needed
}