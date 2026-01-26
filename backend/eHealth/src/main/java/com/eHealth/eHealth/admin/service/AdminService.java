package com.eHealth.eHealth.admin.service;

import java.util.List;

import com.eHealth.eHealth.dto.AdminDashboardStats;
import com.eHealth.eHealth.dto.AdminUserFullView;
import com.eHealth.eHealth.model.User;

public interface AdminService {

List<AdminUserFullView> getAllUsersFull();
    String deleteUserFull(String userId);
    AdminDashboardStats getDashboardStats();
    String createAdminUser(User user);
    String updateUser(String id, User user);
}