package com.eHealth.eHealth.dto;
import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AdminDashboardStats {
    private long totalChatMessages;
    private UserActivityStats userActivity;
    private EarningsStats earnings;
    private TimeStats familyStats;
}
