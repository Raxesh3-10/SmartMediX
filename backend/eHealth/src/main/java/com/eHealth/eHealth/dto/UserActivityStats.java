package com.eHealth.eHealth.dto;

public class UserActivityStats {

    private long activeDoctors;
    private long inactiveDoctors;

    private long activePatients;
    private long inactivePatients;
    // getters & setters
    public long getActiveDoctors() {
        return activeDoctors;
    }
    public void setActiveDoctors(long activeDoctors) {
        this.activeDoctors = activeDoctors;
    }
    public long getInactiveDoctors() {
        return inactiveDoctors;
    }
    public void setInactiveDoctors(long inactiveDoctors) {
        this.inactiveDoctors = inactiveDoctors;
    }
    public long getActivePatients() {
        return activePatients;
    }
    public void setActivePatients(long activePatients) {
        this.activePatients = activePatients;
    }
    public long getInactivePatients() {
        return inactivePatients;
    }
    public void setInactivePatients(long inactivePatients) {
        this.inactivePatients = inactivePatients;
    }
}