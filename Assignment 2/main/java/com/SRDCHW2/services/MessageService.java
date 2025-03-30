package com.SRDCHW2.services;

import com.SRDCHW2.models.Message;
import com.SRDCHW2.models.User;
import com.SRDCHW2.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class MessageService {

    @Autowired
    MessageRepository messageRepository;

    public Page<Message> getInbox(String username, int page, int size, String field, String value) {
        Pageable pageable = PageRequest.of(page, size);
        if (field != null && value != null) {
            return messageRepository.findInboxByField(username, field, value, pageable);
        } else {
            return messageRepository.findInbox(username, pageable);
        }
    }

    public Page<Message> getOutbox(String username, int page, int size, String field, String value) {
        Pageable pageable = PageRequest.of(page, size);
        if (field != null && value != null) {
            return messageRepository.findOutboxByField(username, field, value, pageable);
        } else {
            return messageRepository.findOutbox(username, pageable);
        }
    }


}
