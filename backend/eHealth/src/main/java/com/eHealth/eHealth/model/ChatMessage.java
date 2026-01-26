package com.eHealth.eHealth.model;
import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Document(collection = "chats")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessage {
    @Id
    private String messageId;
    private String doctorId;
    private String patientId;
    private String senderRole; // "DOCTOR" or "PATIENT"
    private String senderId;
    private String message;
    private List<String> fileUrls;
    private boolean read = false; // ✅ read status
    private Instant sentAt;
}