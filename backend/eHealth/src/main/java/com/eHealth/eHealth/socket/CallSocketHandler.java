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
                System.out.println("Connected: " + client.getSessionId())
        );

        server.addDisconnectListener(client -> {
            client.getAllRooms().forEach(room -> {
                server.getRoomOperations(room)
                        .getClients()
                        .forEach(c -> {
                            if (!c.getSessionId().equals(client.getSessionId())) {
                                c.sendEvent(
                                        "user-left",
                                        client.getSessionId().toString()
                                );
                            }
                        });
                client.leaveRoom(room);
            });
        });

        server.addEventListener(
                "join-room",
                String.class,
                (client, roomId, ack) -> {

                    client.joinRoom(roomId);

                    server.getRoomOperations(roomId)
                            .getClients()
                            .forEach(c -> {
                                if (!c.getSessionId().equals(client.getSessionId())) {
                                    c.sendEvent(
                                            "user-joined",
                                            client.getSessionId().toString()
                                    );
                                }
                            });
                }
        );

        server.addEventListener(
                "leave-room",
                String.class,
                (client, roomId, ack) -> client.leaveRoom(roomId)
        );

        relay("offer");
        relay("answer");
        relay("ice-candidate");
    }

    private void relay(String event) {
        server.addEventListener(
                event,
                JsonNode.class,
                (client, data, ack) -> {

                    if (!data.has("roomId") || !data.has("target")) return;

                    String roomId = data.get("roomId").asText();
                    String target = data.get("target").asText();

                    server.getRoomOperations(roomId)
                            .getClients()
                            .forEach(c -> {
                                if (
                                    !c.getSessionId().equals(client.getSessionId()) &&
                                    c.getSessionId().toString().equals(target)
                                ) {
                                    c.sendEvent(event, data);
                                }
                            });
                }
        );
    }
}