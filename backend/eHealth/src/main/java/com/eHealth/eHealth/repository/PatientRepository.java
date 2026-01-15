package com.eHealth.eHealth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eHealth.eHealth.model.Patient;

public interface PatientRepository extends MongoRepository<Patient,String> {
    Optional<Patient> findByUserId(String userId);
    List<Patient> findByFamilyId(String familyId);
}