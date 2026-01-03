package com.eHealth.eHealth.model;

import java.time.Instant;

public class AvailabilitySlot {

    private Instant startTime;
    private Instant endTime;
    private boolean booked;

    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }

    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }

    public boolean isBooked() { return booked; }
    public void setBooked(boolean booked) { this.booked = booked; }
}