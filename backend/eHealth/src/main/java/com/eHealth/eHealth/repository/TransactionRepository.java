package com.eHealth.eHealth.repository;

import com.eHealth.eHealth.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TransactionRepository extends MongoRepository<Transaction, String> {
    List<Transaction> findByPatientId(String patientId);
    List<Transaction> findByDoctorId(String doctorId);
}