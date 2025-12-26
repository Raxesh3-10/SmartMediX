package com.eHealth.eHealth.auth.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.eHealth.eHealth.auth.model.User;

public interface UserRepository extends MongoRepository<User, String> {

    User createUser(User user);
    User findByEmail(String email);
    void deleteUser(User user);
    User updateUser(User user);

}
