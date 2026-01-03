package com.eHealth.eHealth.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eHealth.eHealth.model.Payment;

public interface PaymentRepository extends MongoRepository<Payment,String> {
    
}
