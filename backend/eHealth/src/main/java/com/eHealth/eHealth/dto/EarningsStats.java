package com.eHealth.eHealth.dto;
import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EarningsStats {
    private double total;
    private double yearly;
    private double monthly;
    private double weekly;
    private double daily;
    private double avgYearly;
    private double avgMonthly;
    private double avgWeekly;
    private double avgDaily;
}