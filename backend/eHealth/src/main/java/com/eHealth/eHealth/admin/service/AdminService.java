package com.eHealth.eHealth.admin.service;

import java.util.List;
import com.eHealth.eHealth.dto.AdminDashboardStats;
import com.eHealth.eHealth.dto.AdminUserFullView;
import com.eHealth.eHealth.model.User;

public interface AdminService {

List<AdminUserFullView> getAllUsersFull(String adminJwt);
    String deleteUserFull(String userId, String adminJwt);
    AdminDashboardStats getDashboardStats(String adminJwt);
    String createAdminUser(User user, String adminJwt);
    String updateUser(String id, User user, String adminJwt);
}