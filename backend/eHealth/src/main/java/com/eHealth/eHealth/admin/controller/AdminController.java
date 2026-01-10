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
import com.eHealth.eHealth.model.JwtSession;
import com.eHealth.eHealth.model.User;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ================= READ ALL USERS =================
    @GetMapping("/users")
    public List<User> getAllUsers(@RequestHeader("JWT") String jwt) {
        return adminService.getAllUsers(jwt);
    }

    // ================= READ USER BY ID =================
    @GetMapping("/users/{id}")
    public User getUserById(@PathVariable String id,
                            @RequestHeader("JWT") String jwt) {
        return adminService.getUserById(id, jwt);
    }

    // ================= CREATE USER =================
    @PostMapping("/users")
    public String createUser(@RequestBody User user,
                             @RequestHeader("JWT") String jwt) {
        return adminService.createAdminUser(user, jwt);
    }

    // ================= UPDATE USER =================
    @PutMapping("/users/{id}")
    public String updateUser(@PathVariable String id,
                             @RequestBody User user,
                             @RequestHeader("JWT") String jwt) {
        return adminService.updateUser(id, user, jwt);
    }

    // ================= DELETE USER =================
    @DeleteMapping("/users/{id}")
    public String deleteUser(@PathVariable String id,
                             @RequestHeader("JWT") String jwt) {
        return adminService.deleteUser(id, jwt);
    }

    // ================= ACTIVE SESSIONS =================
    @GetMapping("/sessions")
    public List<JwtSession> getActiveSessions(@RequestHeader("JWT") String jwt) {
        return adminService.getActiveSessions(jwt);
    }
}