package com.eHealth.eHealth.auth.controller;

import org.springframework.web.bind.annotation.*;

import com.eHealth.eHealth.auth.dto.LoginRequest;
import com.eHealth.eHealth.auth.dto.SignupRequest;
import com.eHealth.eHealth.auth.enumRole.Role;
import com.eHealth.eHealth.auth.model.User;
import com.eHealth.eHealth.auth.repository.UserRepository;

@RestController
@RequestMapping("/v1/api")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ================= SIGNUP =================
    @PostMapping("/auth/signup")
    public String signup(@RequestBody SignupRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "User already exists";
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());

        userRepository.save(user);
        return "Signup successful";
    }

    // ================= LOGIN =================
    @PostMapping("/auth/login")
    public String login(@RequestBody LoginRequest request) {

        return userRepository.findByEmail(request.getEmail())
                .filter(u -> u.getPassword().equals(request.getPassword()))
                .map(u -> "Login successful : " + u.getRole())
                .orElse("Invalid credentials");
    }

    // ================= ADMIN CHECK =================
    private boolean isAdmin(String adminEmail) {
        return userRepository.findByEmail(adminEmail)
                .map(u -> u.getRole() == Role.ADMIN)
                .orElse(false);
    }

    // ================= ADMIN CRUD =================

    // READ ALL USERS
    @GetMapping("/admin/users")
    public Object getAllUsers(@RequestParam String adminEmail) {

        if (!isAdmin(adminEmail)) {
            return "Access denied : ADMIN only";
        }
        return userRepository.findAll();
    }

    // READ USER BY ID
    @GetMapping("/admin/users/{id}")
    public Object getUserById(
            @PathVariable String id,
            @RequestParam String adminEmail) {

        if (!isAdmin(adminEmail)) {
            return "Access denied : ADMIN only";
        }
        return userRepository.findById(id).orElse(null);
    }

    // UPDATE USER
    @PutMapping("/admin/users/{id}")
    public String updateUser(
            @PathVariable String id,
            @RequestBody User user,
            @RequestParam String adminEmail) {

        if (!isAdmin(adminEmail)) {
            return "Access denied : ADMIN only";
        }

        return userRepository.findById(id).map(existing -> {
            existing.setName(user.getName());
            existing.setEmail(user.getEmail());
            existing.setPassword(user.getPassword());
            existing.setRole(user.getRole());
            userRepository.save(existing);
            return "User updated successfully";
        }).orElse("User not found");
    }

    // DELETE USER
    @DeleteMapping("/admin/users/{id}")
    public String deleteUser(
            @PathVariable String id,
            @RequestParam String adminEmail) {

        if (!isAdmin(adminEmail)) {
            return "Access denied : ADMIN only";
        }

        userRepository.deleteById(id);
        return "User deleted successfully";
    }
}