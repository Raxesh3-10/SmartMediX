package com.eHealth.eHealth.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.eHealth.eHealth.model.ChatMessage;

public interface ChatRepository extends MongoRepository<ChatMessage, String> {

    List<ChatMessage> findByDoctorIdAndPatientIdOrderBySentAtAsc(
            String doctorId, String patientId
    );

    boolean existsByDoctorIdAndPatientId(String doctorId, String patientId);

    @Query(value = "{ 'doctorId': ?0 }", fields = "{ 'patientId': 1 }")
    List<ChatMessage> findDistinctPatientsByDoctorId(String doctorId);

    @Query(value = "{ 'patientId': ?0 }", fields = "{ 'doctorId': 1 }")
    List<ChatMessage> findDistinctDoctorsByPatientId(String patientId);

    boolean existsByMessageIdAndSenderId(String messageId, String senderId);

    List<ChatMessage> findByDoctorIdAndPatientIdAndReadFalseAndSenderRole(String doctorId, String patientId,
            String string);

        long count();

}