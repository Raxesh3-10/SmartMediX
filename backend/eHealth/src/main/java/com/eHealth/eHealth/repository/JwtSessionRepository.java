package com.eHealth.eHealth.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eHealth.eHealth.model.JwtSession;

public interface JwtSessionRepository extends MongoRepository<JwtSession,String> {
}