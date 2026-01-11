package com.eHealth.eHealth.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eHealth.eHealth.model.Appointment;

public interface AppointmentRepository extends MongoRepository<Appointment,String>{

    int countByDoctorId(String doctorId);
    List<Appointment> findByDoctorId(String doctorId);
    List<Appointment> findByPatientId(String patientId);
    boolean existsByDoctorIdAndPatientId(String doctorId, String patientId);
}
