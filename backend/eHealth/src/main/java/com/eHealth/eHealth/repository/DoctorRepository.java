package com.eHealth.eHealth.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eHealth.eHealth.model.Doctor;

public interface DoctorRepository extends MongoRepository<Doctor,String>{
    
}
