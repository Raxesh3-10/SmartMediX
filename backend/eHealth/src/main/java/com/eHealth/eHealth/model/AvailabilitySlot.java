package com.eHealth.eHealth.model;
import java.time.LocalTime;
public class AvailabilitySlot {
    private String day;          // MONDAY, FRIDAY, etc.
    private LocalTime startTime; // 09:00
    private LocalTime endTime;   // 09:30
    private boolean booked;

    public String getDay() {
        return this.day;
    }

    public void setDay(String day) {
        this.day = day;
    }

    public LocalTime getStartTime() {
        return this.startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return this.endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public boolean isBooked() {
        return this.booked;
    }

    public boolean getBooked() {
        return this.booked;
    }

    public void setBooked(boolean booked) {
        this.booked = booked;
    }

}