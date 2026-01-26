package com.eHealth.eHealth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eHealth.eHealth.model.OtpEntity;


public interface OtpRepository extends MongoRepository<OtpEntity, String> {
    Optional<OtpEntity> findByTarget(String target);
    List<OtpEntity> findByOtp(String otp);
}