package com.eHealth.eHealth.dto;
import java.util.List;
import com.eHealth.eHealth.model.*;
import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AdminUserFullView {
    private User user;
    private Patient patient;
    private Doctor doctor;
    private Family family;
    private List<Appointment> appointments;
    private List<Transaction> transactions;
}
