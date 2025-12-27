package com.eHealth.eHealth.auth.repository;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.eHealth.eHealth.auth.model.User;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
}