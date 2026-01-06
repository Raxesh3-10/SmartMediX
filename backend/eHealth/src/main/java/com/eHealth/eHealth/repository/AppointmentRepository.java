package com.eHealth.eHealth.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eHealth.eHealth.model.Appointment;

public interface AppointmentRepository extends MongoRepository<Appointment,String>{

    int countByDoctorId(String doctorId);
    
}
