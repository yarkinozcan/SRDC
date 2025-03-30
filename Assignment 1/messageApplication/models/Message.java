package com.srdc.messageApplication.models;

import java.sql.Timestamp;

public class Message {

    //Member private variables
    String sender;
    String receiver;
    String messageBody;
    String title;
    Timestamp timestamp;

    public Message(String sender, String receiver, String messageBody, String title, Timestamp timestamp) {
        this.sender = sender;
        this.receiver = receiver;
        this.messageBody = messageBody;
        this.title = title;
        this.timestamp = timestamp;
    }
    
    //Getter
    public String getSender() { return sender; }
    public String getReceiver() { return receiver; }
    public String getTitle() { return title; }
    public String getMessageBody() { return messageBody; }
    public Timestamp getTimestamp() { return timestamp; }
}