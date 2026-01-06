package com.eHealth.eHealth.communication.controller;

import com.eHealth.eHealth.communication.CommunicationService;
import com.eHealth.eHealth.model.ChatMessage;
import com.eHealth.eHealth.repository.ChatRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final CommunicationService service;
    private final ChatRepository chatRepo;

    public ChatController(CommunicationService service,
                          ChatRepository chatRepo) {
        this.service = service;
        this.chatRepo = chatRepo;
    }

    @PostMapping
    public ChatMessage send(@RequestParam String appointmentId,
                            @RequestParam String senderId,
                            @RequestParam String receiverId,
                            @RequestParam String message) {

        return service.sendMessage(appointmentId, senderId, receiverId, message);
    }

    @GetMapping("/{appointmentId}")
    public List<ChatMessage> history(@PathVariable String appointmentId) {
        return chatRepo.findByAppointmentIdOrderBySentAtAsc(appointmentId);
    }
}
