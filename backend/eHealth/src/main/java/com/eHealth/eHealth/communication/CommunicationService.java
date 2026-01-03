package com.eHealth.eHealth.communication;

import com.eHealth.eHealth.model.ChatMessage;
import com.eHealth.eHealth.repository.ChatRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class CommunicationService {

    private final ChatRepository chatRepository;

    public CommunicationService(ChatRepository chatRepository) {
        this.chatRepository = chatRepository;
    }

    /* ================= CHAT ================= */

    public ChatMessage sendMessage(String appointmentId,
                                   String senderId,
                                   String receiverId,
                                   String message) {

        ChatMessage chat = new ChatMessage();
        chat.setAppointmentId(appointmentId);
        chat.setSenderId(senderId);
        chat.setReceiverId(receiverId);
        chat.setMessage(message);
        chat.setSentAt(Instant.now());

        return chatRepository.save(chat);
    }

    /* ================= VOICE CALL (WebRTC) ================= */

    public String initiateVoiceCall(String appointmentId,
                                    String callerId,
                                    String receiverId) {

        // backend creates logical room
        return "VOICE_ROOM_" + appointmentId;
    }

    public void endVoiceCall(String roomId) {
        // cleanup logic if needed
        System.out.println("Voice call ended for room: " + roomId);
    }

    /* ================= VIDEO CALL (WebRTC) ================= */

    public String initiateVideoCall(String appointmentId,
                                    String callerId,
                                    String receiverId) {

        return "VIDEO_ROOM_" + appointmentId;
    }

    public void endVideoCall(String roomId) {
        System.out.println("Video call ended for room: " + roomId);
    }
}
