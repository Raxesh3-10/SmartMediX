package com.eHealth.eHealth.model;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "otp_store")
public class OtpEntity {

    @Id
    private String id;

    private String target; // email or mobile
    private String otp;
    
    @Indexed(expireAfter = "0")
    private Instant expiryTime;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public Instant getExpiryTime() { return expiryTime; }
    public void setExpiryTime(Instant expiryTime) { this.expiryTime = expiryTime; }
}