package com.eHealth.eHealth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eHealth.eHealth.model.JwtSession;

public interface JwtSessionRepository extends MongoRepository<JwtSession,String> {
    void deleteByJwt(String jwt);
    Optional<JwtSession> findByJwt(String jwt);
    long countByEmailIn(List<String> emails);
    void deleteByEmail(String email);
}