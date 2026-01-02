package com.eHealth.eHealth.admin.service;

import java.util.List;
import com.eHealth.eHealth.model.User;
import com.eHealth.eHealth.model.JwtSession;

public interface AdminService {

    List<User> getAllUsers(String adminJwt);

    String createAdminUser(User user, String adminJwt);

    User getUserById(String id, String adminJwt);

    String updateUser(String id, User user, String adminJwt);

    String deleteUser(String id, String adminJwt);

    List<JwtSession> getActiveSessions(String adminJwt);
}