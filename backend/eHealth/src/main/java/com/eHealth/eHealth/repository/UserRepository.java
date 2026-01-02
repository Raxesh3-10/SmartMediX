package com.eHealth.eHealth.repository;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.eHealth.eHealth.model.User;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
}