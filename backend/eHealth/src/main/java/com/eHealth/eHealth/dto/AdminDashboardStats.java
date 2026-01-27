package com.eHealth.eHealth.dto;
public class AdminDashboardStats {
    private long totalChatMessages;
    private UserActivityStats userActivity;
    private EarningsStats earnings;
    private TimeStats familyStats;

    public long getTotalChatMessages() {
        return this.totalChatMessages;
    }

    public void setTotalChatMessages(long totalChatMessages) {
        this.totalChatMessages = totalChatMessages;
    }

    public UserActivityStats getUserActivity() {
        return this.userActivity;
    }

    public void setUserActivity(UserActivityStats userActivity) {
        this.userActivity = userActivity;
    }

    public EarningsStats getEarnings() {
        return this.earnings;
    }

    public void setEarnings(EarningsStats earnings) {
        this.earnings = earnings;
    }

    public TimeStats getFamilyStats() {
        return this.familyStats;
    }

    public void setFamilyStats(TimeStats familyStats) {
        this.familyStats = familyStats;
    }

}
