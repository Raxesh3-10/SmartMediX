package com.eHealth.eHealth.repository;

import java.time.Instant;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eHealth.eHealth.model.Appointment;

public interface AppointmentRepository extends MongoRepository<Appointment,String>{

    int countByDoctorId(String doctorId);
    List<Appointment> findByPatientIdIn(List<String> patientIds);
    long countByDoctorIdAndAppointmentDate(String doctorId, Instant date);
    List<Appointment> findByDoctorId(String doctorId);
    List<Appointment> findByPatientId(String patientId);
    boolean existsByDoctorIdAndPatientId(String doctorId, String patientId);
    boolean existsByDoctorIdAndDayAndStartTimeAndEndTimeAndStatusNot(String doctorId, String day, LocalTime startTime,
            LocalTime endTime, String string);
    void deleteByPatientId(String patientId);
    void deleteByDoctorId(String doctorId);
}
