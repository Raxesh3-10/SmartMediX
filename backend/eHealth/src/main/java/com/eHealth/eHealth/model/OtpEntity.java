package com.eHealth.eHealth.model;
import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Document(collection = "otp_store")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OtpEntity {
    @Id
    private String id;
    private String target; // email or mobile ,but mobile not implemented yet
    private String otp;
    @Indexed(expireAfter = "0")
    private Instant expiryTime;
}