package com.eHealth.eHealth.admin.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eHealth.eHealth.admin.service.AdminService;
import com.eHealth.eHealth.dto.AdminDashboardStats;
import com.eHealth.eHealth.dto.AdminUserFullView;
import com.eHealth.eHealth.model.User;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public AdminDashboardStats getDashboard(@RequestHeader("JWT") String jwt) {
        return adminService.getDashboardStats(jwt);
    }
// ================= FULL USER DATA =================
@GetMapping("/users/full")
public List<AdminUserFullView> getAllUsersFull(
        @RequestHeader("JWT") String jwt) {
    return adminService.getAllUsersFull(jwt);
}

// ================= FULL DELETE =================
@DeleteMapping("/users/{id}/full")
public String deleteUserFull(@PathVariable String id,
                             @RequestHeader("JWT") String jwt) {
    return adminService.deleteUserFull(id, jwt);
}
    /* ================= CREATE ADMIN USER ================= */
    @PostMapping("/users")
    public String createAdminUser(
            @RequestBody User user,
            @RequestHeader("JWT") String jwt) {
        return adminService.createAdminUser(user, jwt);
    }

    /* ================= UPDATE USER (NAME + ROLE ONLY) ================= */
    @PutMapping("/users/{id}")
    public String updateUser(
            @PathVariable String id,
            @RequestBody User user,
            @RequestHeader("JWT") String jwt) {
        return adminService.updateUser(id, user, jwt);
    }
}