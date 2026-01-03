package com.eHealth.eHealth.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eHealth.eHealth.model.Family;
public interface FamilyRepository extends MongoRepository<Family,String>{
    
}
