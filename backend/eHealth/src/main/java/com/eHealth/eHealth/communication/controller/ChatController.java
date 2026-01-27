package com.eHealth.eHealth.communication.controller;

import com.eHealth.eHealth.communication.CommunicationService;
import com.eHealth.eHealth.dto.DoctorWithUserDTO;
import com.eHealth.eHealth.dto.PatientWithUserDTO;
import com.eHealth.eHealth.model.ChatMessage;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
            HttpServletRequest request, 
            @RequestParam String doctorId,
            @RequestParam String patientId,
            @RequestParam String senderRole,
            @RequestParam String senderId,
            @RequestParam(required = false) String message,
            @RequestParam(required = false) List<String> fileUrls) {

        return service.sendMessage(
                request,
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
            HttpServletRequest request,
            @PathVariable String doctorId,
            @PathVariable String patientId) {

        service.markChatAsRead(request, doctorId, patientId);
    }

    /* ================= DELETE MESSAGE ================= */
    @DeleteMapping("/message/{messageId}")
    public void deleteMessage(
            HttpServletRequest request,
            @PathVariable String messageId) {

        service.deleteMessage(request, messageId);
    }


    /* ================= CHAT HISTORY ================= */
    @GetMapping("/history/{doctorId}/{patientId}")
    public List<ChatMessage> history(
            HttpServletRequest request,
            @PathVariable String doctorId,
            @PathVariable String patientId) {

        return service.getChatHistory(request, doctorId, patientId);
    }

    @GetMapping("/patient/history/{patientId}/{doctorId}")
    public List<ChatMessage> patientHistory(
            HttpServletRequest request,
            @PathVariable String patientId,
            @PathVariable String doctorId) {
        return service.getChatHistory(request, doctorId, patientId);
    }

    /* ================= DOCTOR ROUTES ================= */
    @GetMapping("/doctor/{doctorId}/patients")
    public List<PatientWithUserDTO> doctorChatPatients(
            HttpServletRequest request,
            @PathVariable String doctorId) {
        return service.getDoctorChatPatients(request, doctorId);
    }

    @GetMapping("/doctor/{doctorId}/new-patients")
    public List<PatientWithUserDTO> doctorNewPatients(
            HttpServletRequest request,
            @PathVariable String doctorId) {

        return service.getDoctorNewPatients(request, doctorId);
    }

    /* ================= PATIENT ROUTES ================= */
    @GetMapping("/patient/{patientId}/doctors")
    public List<DoctorWithUserDTO> patientChatDoctors(
            HttpServletRequest request,
            @PathVariable String patientId) {

        return service.getPatientChatDoctors(request, patientId);
    }

    @GetMapping("/patient/{patientId}/new-doctors")
    public List<DoctorWithUserDTO> patientNewDoctors(
            HttpServletRequest request,
            @PathVariable String patientId) {

        return service.getPatientNewDoctors(request, patientId);
    }
}