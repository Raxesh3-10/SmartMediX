package com.eHealth.eHealth.model;
import java.time.Instant;
import java.time.LocalTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
@Document(collection = "appointments")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Appointment {
    @Id
    private String appointmentId;
    private String doctorId;
    private String patientId;
    private String day; // MONDAY, TUESDAY, etc.
    private LocalTime startTime; //As Date in database
    private LocalTime endTime;
    private Instant appointmentDate; // specific date (this week only)
    private String status; 
    // CREATED, PAID, CONFIRMED, COMPLETED
    private String conferenceType; // Video always
    private String roomId;
    private Instant createdAt;
}