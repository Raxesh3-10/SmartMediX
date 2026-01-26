package com.eHealth.eHealth.model;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AvailabilitySlot {
    private String day;          // MONDAY, FRIDAY, etc.
    private LocalTime startTime; // 09:00
    private LocalTime endTime;   // 09:30
    private boolean booked;
}