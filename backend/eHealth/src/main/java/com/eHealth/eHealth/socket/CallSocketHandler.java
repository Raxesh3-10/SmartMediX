package com.eHealth.eHealth.socket;

import com.corundumstudio.socketio.SocketIOServer;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

@Component
public class CallSocketHandler {

    private final SocketIOServer server;

    public CallSocketHandler(SocketIOServer server) {
        this.server = server;
    }

    @PostConstruct
    public void init() {

        server.addConnectListener(client ->
            System.out.println("Socket connected: " + client.getSessionId())
        );

        server.addDisconnectListener(client ->
            System.out.println("Socket disconnected: " + client.getSessionId())
        );

        server.addEventListener("join-room", String.class,
            (client, roomId, ack) -> {
                client.joinRoom(roomId);
                System.out.println("Joined room: " + roomId);
            }
        );

        server.addEventListener("offer", JsonNode.class,
            (client, data, ack) -> {
                String roomId = data.get("roomId").asText();
                server.getRoomOperations(roomId)
                      .sendEvent("offer", data);
            }
        );

        server.addEventListener("answer", JsonNode.class,
            (client, data, ack) -> {
                String roomId = data.get("roomId").asText();
                server.getRoomOperations(roomId)
                      .sendEvent("answer", data);
            }
        );

        server.addEventListener("ice-candidate", JsonNode.class,
            (client, data, ack) -> {
                String roomId = data.get("roomId").asText();
                server.getRoomOperations(roomId)
                      .sendEvent("ice-candidate", data);
            }
        );

        server.start();
    }
}