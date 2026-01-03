package com.eHealth.eHealth.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eHealth.eHealth.model.Patient;

public interface PatientRepository extends MongoRepository<Patient,String> {
    
}