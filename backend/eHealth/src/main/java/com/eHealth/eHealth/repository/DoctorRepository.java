package com.eHealth.eHealth.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eHealth.eHealth.model.Doctor;

public interface DoctorRepository extends MongoRepository<Doctor,String>{
    Optional<Doctor> findByUserId(String userId);
}
