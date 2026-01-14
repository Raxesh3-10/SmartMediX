package com.eHealth.eHealth.communication;

import com.eHealth.eHealth.dto.DoctorWithUserDTO;
import com.eHealth.eHealth.dto.PatientWithUserDTO;
import com.eHealth.eHealth.enumRole.Role;
import com.eHealth.eHealth.model.*;
import com.eHealth.eHealth.repository.*;
import com.eHealth.eHealth.utility.JwtUtil;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Service
public class CommunicationService {

    private final ChatRepository chatRepo;
    private final AppointmentRepository appointmentRepo;
    private final PatientRepository patientRepo;
    private final DoctorRepository doctorRepo;
    private final UserRepository userRepo;
    private final JwtSessionRepository jwtSessionRepo;

    public CommunicationService(
            ChatRepository chatRepo,
            AppointmentRepository appointmentRepo,
            PatientRepository patientRepo,
            DoctorRepository doctorRepo,
            UserRepository userRepo,
            JwtSessionRepository jwtSessionRepo) {

        this.chatRepo = chatRepo;
        this.appointmentRepo = appointmentRepo;
        this.patientRepo = patientRepo;
        this.doctorRepo = doctorRepo;
        this.userRepo = userRepo;
        this.jwtSessionRepo = jwtSessionRepo;
    }

    /* ================= INTERNAL AUTH ================= */

    private void validateToken(String token) {
        if (!JwtUtil.isTokenValid(token, jwtSessionRepo)) {
            throw new RuntimeException("Invalid or expired token");
        }
    }

    private Role getRole(String token) {
        return JwtUtil.getRole(token, userRepo, jwtSessionRepo);
    }

    private String getUserId(String token) {
        return JwtUtil.getUserId(token, userRepo, jwtSessionRepo);
    }

    /* ================= SEND MESSAGE ================= */
public ChatMessage sendMessage(
        String token,
        String doctorId,
        String patientId,
        String senderRole,
        String senderId,
        String message,
        List<String> fileUrls) {

    validateToken(token);

    Role role = getRole(token);
    String jwtUserId = getUserId(token);

    /* ================= SENDER VALIDATION ================= */

    if (role == Role.DOCTOR && "DOCTOR".equals(senderRole)) {

        if (!senderId.equals(doctorId)) {
            throw new RuntimeException("Invalid senderId for doctor");
        }

        Doctor doctor = doctorRepo.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (!doctor.getUserId().equals(jwtUserId)) {
            throw new RuntimeException("Doctor access only");
        }

    } else if (role == Role.PATIENT && "PATIENT".equals(senderRole)) {

        if (!senderId.equals(patientId)) {
            throw new RuntimeException("Invalid senderId for patient");
        }

        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        if (!patient.getUserId().equals(jwtUserId)) {
            throw new RuntimeException("Patient access only");
        }

    } else {
        throw new RuntimeException("Sender role mismatch");
    }

    /* ================= CHAT PERMISSION ================= */

    if (!appointmentRepo.existsByDoctorIdAndPatientId(doctorId, patientId)) {
        throw new RuntimeException("Chat not allowed without appointment");
    }

    if ((message == null || message.isBlank())
            && (fileUrls == null || fileUrls.isEmpty())) {
        throw new RuntimeException("Message or file is required");
    }

    /* ================= SAVE MESSAGE ================= */

    ChatMessage chat = new ChatMessage();
    chat.setDoctorId(doctorId);
    chat.setPatientId(patientId);
    chat.setSenderRole(senderRole);
    chat.setSenderId(senderId); // domain ID (doctorId or patientId)
    chat.setMessage(message);
    chat.setFileUrls(fileUrls);
    chat.setSentAt(Instant.now());

    return chatRepo.save(chat);
}

/* ================= DELETE MESSAGE ================= */

public void deleteMessage(String token, String messageId) {

    validateToken(token);

    Role role = getRole(token);
    String jwtUserId = getUserId(token);

    ChatMessage chat = chatRepo.findById(messageId)
            .orElseThrow(() -> new RuntimeException("Message not found"));

    /* ================= ROLE + OWNERSHIP VALIDATION ================= */

    if (role == Role.DOCTOR) {

        if (!"DOCTOR".equals(chat.getSenderRole())) {
            throw new RuntimeException("Doctor cannot delete patient message");
        }

        Doctor doctor = doctorRepo.findById(chat.getSenderId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (!doctor.getUserId().equals(jwtUserId)) {
            throw new RuntimeException("Unauthorized doctor");
        }

    } else if (role == Role.PATIENT) {

        if (!"PATIENT".equals(chat.getSenderRole())) {
            throw new RuntimeException("Patient cannot delete doctor message");
        }

        Patient patient = patientRepo.findById(chat.getSenderId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        if (!patient.getUserId().equals(jwtUserId)) {
            throw new RuntimeException("Unauthorized patient");
        }

    } else {
        throw new RuntimeException("Invalid role");
    }

    /* ================= DELETE ================= */

    chatRepo.deleteById(messageId);
}
    /* ================= CHAT HISTORY ================= */

    public List<ChatMessage> getChatHistory(
            String token,
            String doctorId,
            String patientId) {

        validateToken(token);

        Role r = getRole(token);
        String uid = getUserId(token);

        if (r == Role.DOCTOR) {
            Doctor doctor = doctorRepo.findById(doctorId)
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));

            if (!doctor.getUserId().equals(uid)) {
                throw new RuntimeException("Unauthorized doctor");
            }
        }

        if (r == Role.PATIENT) {
            Patient patient = patientRepo.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));

            if (!patient.getUserId().equals(uid)) {
                throw new RuntimeException("Unauthorized patient");
            }
        }

        return chatRepo
                .findByDoctorIdAndPatientIdOrderBySentAtAsc(doctorId, patientId);
    }

    /* ================= DOCTOR ROUTES ================= */

    public List<PatientWithUserDTO> getDoctorChatPatients(
            String token, String doctorId) {

        validateToken(token);

        if (getRole(token) != Role.DOCTOR) {
            throw new RuntimeException("Doctor access only");
        }

        Doctor doctor = doctorRepo.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (!doctor.getUserId().equals(getUserId(token))) {
            throw new RuntimeException("Doctor access only");
        }

 return chatRepo.findDistinctPatientsByDoctorId(doctorId)
        .stream()
        .map(ChatMessage::getPatientId)
        .distinct()
        .map(pid -> patientRepo.findById(pid).orElse(null))
        .filter(Objects::nonNull)
        .map(p -> new PatientWithUserDTO(
                p,
                userRepo.findById(p.getUserId()).orElse(null)))
        .toList();

    }

    public List<PatientWithUserDTO> getDoctorNewPatients(
            String token, String doctorId) {

        validateToken(token);

        if (getRole(token) != Role.DOCTOR) {
            throw new RuntimeException("Doctor access only");
        }

        Doctor doctor = doctorRepo.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (!doctor.getUserId().equals(getUserId(token))) {
            throw new RuntimeException("Doctor access only");
        }

        return appointmentRepo.findByDoctorId(doctorId)
                .stream()
                .map(Appointment::getPatientId)
                .distinct()
                .filter(pid ->
                        !chatRepo.existsByDoctorIdAndPatientId(doctorId, pid))
                .map(pid -> patientRepo.findById(pid).orElse(null))
                .filter(Objects::nonNull)
                .map(p -> new PatientWithUserDTO(
                        p,
                        userRepo.findById(p.getUserId()).orElse(null)))
                .toList();
    }

    /* ================= PATIENT ROUTES ================= */

    public List<DoctorWithUserDTO> getPatientChatDoctors(
            String token, String patientId) {

        validateToken(token);

        if (getRole(token) != Role.PATIENT) {
            throw new RuntimeException("Patient access only");
        }

        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        if (!patient.getUserId().equals(getUserId(token))) {
            throw new RuntimeException("Patient access only");
        }

return chatRepo.findDistinctDoctorsByPatientId(patientId)
        .stream()
        .map(ChatMessage::getDoctorId)
        .distinct()
        .map(did -> doctorRepo.findById(did).orElse(null))
        .filter(Objects::nonNull)
        .map(d -> new DoctorWithUserDTO(
                d,
                userRepo.findById(d.getUserId()).orElse(null)))
        .toList();

    }

    public List<DoctorWithUserDTO> getPatientNewDoctors(
            String token, String patientId) {

        validateToken(token);

        if (getRole(token) != Role.PATIENT) {
            throw new RuntimeException("Patient access only");
        }

        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        if (!patient.getUserId().equals(getUserId(token))) {
            throw new RuntimeException("Patient access only");
        }

        return appointmentRepo.findByPatientId(patientId)
                .stream()
                .map(Appointment::getDoctorId)
                .distinct()
                .filter(did ->
                        !chatRepo.existsByDoctorIdAndPatientId(did, patientId))
                .map(did -> doctorRepo.findById(did).orElse(null))
                .filter(Objects::nonNull)
                .map(d -> new DoctorWithUserDTO(
                        d,
                        userRepo.findById(d.getUserId()).orElse(null)))
                .toList();
    }
}