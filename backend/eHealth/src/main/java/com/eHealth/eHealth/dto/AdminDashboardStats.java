package com.eHealth.eHealth.dto;

public class AdminDashboardStats {

    private long totalChatMessages;

    private UserActivityStats userActivity;

    private EarningsStats earnings;

    private TimeStats familyStats;
    // getters & setters
    public long getTotalChatMessages() {
        return totalChatMessages;
    }
    public void setTotalChatMessages(long totalChatMessages) {
        this.totalChatMessages = totalChatMessages;
    }
    public UserActivityStats getUserActivity() {
        return userActivity;
    }
    public void setUserActivity(UserActivityStats userActivity) {
        this.userActivity = userActivity;
    }
    public EarningsStats getEarnings() {
        return earnings;
    }
    public void setEarnings(EarningsStats earnings) {
        this.earnings = earnings;
    }
    public TimeStats getFamilyStats() {
        return familyStats;
    }
    public void setFamilyStats(TimeStats familyStats) {
        this.familyStats = familyStats;
    }
}
