package com.eHealth.eHealth.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eHealth.eHealth.model.Bill;

public interface BillRepository  extends MongoRepository<Bill,String>{
    
}
