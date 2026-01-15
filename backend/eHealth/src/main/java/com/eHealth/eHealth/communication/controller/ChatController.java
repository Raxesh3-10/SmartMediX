package com.eHealth.eHealth.communication.controller;

import com.eHealth.eHealth.communication.CommunicationService;
import com.eHealth.eHealth.dto.DoctorWithUserDTO;
import com.eHealth.eHealth.dto.PatientWithUserDTO;
import com.eHealth.eHealth.model.ChatMessage;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final CommunicationService service;

    public ChatController(CommunicationService service) {
        this.service = service;
    }

    /* ================= SEND MESSAGE ================= */

    @PostMapping("/send")
    public ChatMessage sendMessage(
            @RequestHeader("JWT") String token,
            @RequestParam String doctorId,
            @RequestParam String patientId,
            @RequestParam String senderRole,
            @RequestParam String senderId,
            @RequestParam(required = false) String message,
            @RequestParam(required = false) List<String> fileUrls) {

        return service.sendMessage(
                token,
                doctorId,
                patientId,
                senderRole,
                senderId,
                message,
                fileUrls
        );
    }

    /* ================= MARK CHAT AS READ ================= */

@PatchMapping("/read/{doctorId}/{patientId}")
public void markChatAsRead(
        @RequestHeader("JWT") String token,
        @PathVariable String doctorId,
        @PathVariable String patientId) {

    service.markChatAsRead(token, doctorId, patientId);
}

    /* ================= DELETE MESSAGE ================= */

@DeleteMapping("/message/{messageId}")
public void deleteMessage(
        @RequestHeader("JWT") String token,
        @PathVariable String messageId) {

    service.deleteMessage(token, messageId);
}


    /* ================= CHAT HISTORY ================= */

    @GetMapping("/history/{doctorId}/{patientId}")
    public List<ChatMessage> history(
            @RequestHeader("JWT") String token,
            @PathVariable String doctorId,
            @PathVariable String patientId) {

        return service.getChatHistory(token, doctorId, patientId);
    }

    @GetMapping("/patient/history/{patientId}/{doctorId}")
    public List<ChatMessage> patientHistory(
            @RequestHeader("JWT") String token,
            @PathVariable String patientId,
            @PathVariable String doctorId) {

        return service.getChatHistory(token, doctorId,patientId);
    }

    /* ================= DOCTOR ROUTES ================= */

    @GetMapping("/doctor/{doctorId}/patients")
    public List<PatientWithUserDTO> doctorChatPatients(
            @RequestHeader("JWT") String token,
            @PathVariable String doctorId) {

        return service.getDoctorChatPatients(token, doctorId);
    }

    @GetMapping("/doctor/{doctorId}/new-patients")
    public List<PatientWithUserDTO> doctorNewPatients(
            @RequestHeader("JWT") String token,
            @PathVariable String doctorId) {

        return service.getDoctorNewPatients(token, doctorId);
    }

    /* ================= PATIENT ROUTES ================= */

    @GetMapping("/patient/{patientId}/doctors")
    public List<DoctorWithUserDTO> patientChatDoctors(
            @RequestHeader("JWT") String token,
            @PathVariable String patientId) {

        return service.getPatientChatDoctors(token, patientId);
    }

    @GetMapping("/patient/{patientId}/new-doctors")
    public List<DoctorWithUserDTO> patientNewDoctors(
            @RequestHeader("JWT") String token,
            @PathVariable String patientId) {

        return service.getPatientNewDoctors(token, patientId);
    }
}