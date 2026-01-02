package com.eHealth.eHealth.admin.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.eHealth.eHealth.admin.service.AdminService;
import com.eHealth.eHealth.model.JwtSession;
import com.eHealth.eHealth.model.User;
import com.eHealth.eHealth.repository.JwtSessionRepository;
import com.eHealth.eHealth.repository.UserRepository;
import com.eHealth.eHealth.utility.JwtUtil;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepo;
    private final JwtSessionRepository jwtRepo;

    public AdminServiceImpl(UserRepository userRepo,
                            JwtSessionRepository jwtRepo) {
        this.userRepo = userRepo;
        this.jwtRepo = jwtRepo;
    }

    private void validateAdmin(String jwt) {
        if (!JwtUtil.isAdmin(jwt)) {
            throw new RuntimeException("ADMIN only");
        }
    }

    @Override
    public List<User> getAllUsers(String adminJwt) {
        validateAdmin(adminJwt);
        return userRepo.findAll();
    }


    @Override
    public String createAdminUser(User user, String adminJwt) {
        validateAdmin(adminJwt);
        if (user.getRole() != com.eHealth.eHealth.enumRole.Role.ADMIN) {
            return "Only ADMIN role can be created via this operation";
        }
        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
        return "Admin user already exists";
        }
        userRepo.save(user);
        return "ADMIN user created successfully";
    }

    @Override
    public User getUserById(String id, String adminJwt) {
        validateAdmin(adminJwt);
        return userRepo.findById(id).orElse(null);
    }

    @Override
    public String updateUser(String id, User user, String adminJwt) {
        validateAdmin(adminJwt);
        return userRepo.findById(id).map(u -> {
            u.setName(user.getName());
            u.setRole(user.getRole());
            userRepo.save(u);
            return "User updated";
        }).orElse("User not found");
    }

    @Override
    public String deleteUser(String id, String adminJwt) {
        validateAdmin(adminJwt);
        userRepo.deleteById(id);
        return "User deleted";
    }

    @Override
    public List<JwtSession> getActiveSessions(String adminJwt) {
        validateAdmin(adminJwt);
        return jwtRepo.findAll();
    }
}