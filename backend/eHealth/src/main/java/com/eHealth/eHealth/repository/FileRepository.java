package com.eHealth.eHealth.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eHealth.eHealth.model.FileEntity;

public interface FileRepository extends MongoRepository<FileEntity,String>{
    
}
