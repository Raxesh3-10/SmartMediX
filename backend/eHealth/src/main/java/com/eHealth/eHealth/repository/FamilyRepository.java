package com.eHealth.eHealth.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eHealth.eHealth.model.Family;
public interface FamilyRepository extends MongoRepository<Family,String>{
       Optional<Family> findByOwnerPatientId(String ownerPatientId);
}
