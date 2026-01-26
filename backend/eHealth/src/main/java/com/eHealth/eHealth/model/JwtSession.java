package com.eHealth.eHealth.model;
import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Document(collection = "jwt_sessions")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class JwtSession {
    @Id
    private String id;
    private String email;
    private String jwt;
    private Instant loginTime;
    @Indexed(expireAfter = "0")
    private Instant expiryTime;
}