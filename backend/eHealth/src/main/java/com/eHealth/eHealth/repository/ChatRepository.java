package com.eHealth.eHealth.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eHealth.eHealth.model.ChatMessage;

public interface ChatRepository extends MongoRepository<ChatMessage,String> {

    
}