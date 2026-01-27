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

    public long getTotal() {
        return this.total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public long getYearly() {
        return this.yearly;
    }

    public void setYearly(long yearly) {
        this.yearly = yearly;
    }

    public long getMonthly() {
        return this.monthly;
    }

    public void setMonthly(long monthly) {
        this.monthly = monthly;
    }

    public long getWeekly() {
        return this.weekly;
    }

    public void setWeekly(long weekly) {
        this.weekly = weekly;
    }

    public long getDaily() {
        return this.daily;
    }

    public void setDaily(long daily) {
        this.daily = daily;
    }

    public double getAvgYearly() {
        return this.avgYearly;
    }

    public void setAvgYearly(double avgYearly) {
        this.avgYearly = avgYearly;
    }

    public double getAvgMonthly() {
        return this.avgMonthly;
    }

    public void setAvgMonthly(double avgMonthly) {
        this.avgMonthly = avgMonthly;
    }

    public double getAvgWeekly() {
        return this.avgWeekly;
    }

    public void setAvgWeekly(double avgWeekly) {
        this.avgWeekly = avgWeekly;
    }

    public double getAvgDaily() {
        return this.avgDaily;
    }

    public void setAvgDaily(double avgDaily) {
        this.avgDaily = avgDaily;
    }

}