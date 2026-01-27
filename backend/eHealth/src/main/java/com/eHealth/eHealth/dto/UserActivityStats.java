package com.eHealth.eHealth.dto;

public class UserActivityStats {
    private long activeDoctors;
    private long inactiveDoctors;
    private long activePatients;
    private long inactivePatients;

    public long getActiveDoctors() {
        return this.activeDoctors;
    }

    public void setActiveDoctors(long activeDoctors) {
        this.activeDoctors = activeDoctors;
    }

    public long getInactiveDoctors() {
        return this.inactiveDoctors;
    }

    public void setInactiveDoctors(long inactiveDoctors) {
        this.inactiveDoctors = inactiveDoctors;
    }

    public long getActivePatients() {
        return this.activePatients;
    }

    public void setActivePatients(long activePatients) {
        this.activePatients = activePatients;
    }

    public long getInactivePatients() {
        return this.inactivePatients;
    }

    public void setInactivePatients(long inactivePatients) {
        this.inactivePatients = inactivePatients;
    }

}