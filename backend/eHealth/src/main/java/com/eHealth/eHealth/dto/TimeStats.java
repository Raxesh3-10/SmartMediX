package com.eHealth.eHealth.dto;

public class TimeStats {

    private long total;

    private long yearly;
    private long monthly;
    private long weekly;
    private long daily;

    private double avgYearly;
    private double avgMonthly;
    private double avgWeekly;
    private double avgDaily;

    // getters & setters
    public long getTotal() {
        return total;
    }
    public void setTotal(long total) {
        this.total = total;
    }
    public long getYearly() {
        return yearly;
    }
    public void setYearly(long yearly) {
        this.yearly = yearly;
    }
    public long getMonthly() {
        return monthly;
    }
    public void setMonthly(long monthly) {
        this.monthly = monthly;
    }
    public long getWeekly() {
        return weekly;
    }
    public void setWeekly(long weekly) {
        this.weekly = weekly;
    }
    public long getDaily() {
        return daily;
    }
    public void setDaily(long daily) {
        this.daily = daily;
    }
    public double getAvgYearly() {
        return avgYearly;
    }
    public void setAvgYearly(double avgYearly) {
        this.avgYearly = avgYearly;
    }
    public double getAvgMonthly() {
        return avgMonthly;
    }
    public void setAvgMonthly(double avgMonthly) {
        this.avgMonthly = avgMonthly;
    }
    public double getAvgWeekly() {
        return avgWeekly;
    }
    public void setAvgWeekly(double avgWeekly) {
        this.avgWeekly = avgWeekly;
    }
    public double getAvgDaily() {
        return avgDaily;
    }
    public void setAvgDaily(double avgDaily) {
        this.avgDaily = avgDaily;
    }
}