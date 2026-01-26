package com.eHealth.eHealth.dto;
import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
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
}