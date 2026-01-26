package com.eHealth.eHealth.admin.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eHealth.eHealth.admin.service.AdminService;
import com.eHealth.eHealth.dto.AdminDashboardStats;
import com.eHealth.eHealth.dto.AdminUserFullView;
import com.eHealth.eHealth.model.User;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public AdminDashboardStats getDashboard() {
        return adminService.getDashboardStats();
    }

    @GetMapping("/users/full")
    public List<AdminUserFullView> getAllUsersFull() {
        return adminService.getAllUsersFull();
    }

    @DeleteMapping("/users/{id}/full")
    public String deleteUserFull(@PathVariable String id) {
        return adminService.deleteUserFull(id);
    }

    @PostMapping("/users")
    public String createAdminUser(
            @RequestBody User user) {
        return adminService.createAdminUser(user);
    }

    @PutMapping("/users/{id}")
    public String updateUser(
            @PathVariable String id,
            @RequestBody User user) {
        return adminService.updateUser(id, user);
    }
}