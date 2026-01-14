package com.eHealth.eHealth.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eHealth.eHealth.model.Bill;

public interface BillRepository  extends MongoRepository<Bill,String>{
    List<Bill> findByPatientId(String patientId);
}
