package com.SRDCHW2.repository;

import com.SRDCHW2.models.Message;
import com.SRDCHW2.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Integer> {

    List<Message> findBySender(String sender);

    List<Message> findByReceiver(String receiver);

    @Query(value = "SELECT * FROM messages m WHERE m.sender = :username AND " +
            "(:field = 'receiver' AND LOWER(m.receiver) LIKE LOWER(CONCAT('%', :value, '%')) OR :value IS NULL OR :value = '') OR " +
            "(:field = 'title' AND LOWER(m.title) LIKE LOWER(CONCAT('%', :value, '%'))) OR " +
            "(:field = 'body' AND LOWER(m.body) LIKE LOWER(CONCAT('%', :value, '%'))) OR " +
            "(:field = 'timestamp' AND CAST(m.timestamp AS CHAR) LIKE CONCAT('%', :value, '%'))",
            countQuery = "SELECT count(*) FROM messages m WHERE " +
                    "(:field = 'receiver' AND LOWER(m.receiver) LIKE LOWER(CONCAT('%', :value, '%')) OR :value IS NULL OR :value = '') OR " +
                    "(:field = 'title' AND LOWER(m.title) LIKE LOWER(CONCAT('%', :value, '%'))) OR " +
                    "(:field = 'body' AND LOWER(m.body) LIKE LOWER(CONCAT('%', :value, '%'))) OR " +
                    "(:field = 'timestamp' AND CAST(m.timestamp AS CHAR) LIKE CONCAT('%', :value, '%'))",
            nativeQuery = true)
    Page<Message> findOutboxByField(
            @Param("username") String username,
            @Param("field") String field,
            @Param("value") String value,
            Pageable pageable
    );


    @Query(value = "SELECT * FROM messages m WHERE m.receiver = :username AND " +
            "((:field = 'sender' AND LOWER(m.sender) LIKE LOWER(CONCAT('%', :value, '%')) OR :value IS NULL OR :value = '') OR " +
            "(:field = 'title' AND LOWER(m.title) LIKE LOWER(CONCAT('%', :value, '%'))) OR " +
            "(:field = 'body' AND LOWER(m.body) LIKE LOWER(CONCAT('%', :value, '%'))) OR " +
            "(:field = 'timestamp' AND CAST(m.timestamp AS CHAR) LIKE CONCAT('%', :value, '%')))",
            countQuery = "SELECT count(*) FROM messages m WHERE m.receiver = :username AND " +
                    "((:field = 'sender' AND LOWER(m.sender) LIKE LOWER(CONCAT('%', :value, '%')) OR :value IS NULL OR :value = '') OR " +
                    "(:field = 'title' AND LOWER(m.title) LIKE LOWER(CONCAT('%', :value, '%'))) OR " +
                    "(:field = 'body' AND LOWER(m.body) LIKE LOWER(CONCAT('%', :value, '%'))) OR " +
                    "(:field = 'timestamp' AND CAST(m.timestamp AS CHAR) LIKE CONCAT('%', :value, '%')))",
            nativeQuery = true)
    Page<Message> findInboxByField(
            @Param("username") String username,
            @Param("field") String field,
            @Param("value") String value,
            Pageable pageable
    );

    @Query(value = "SELECT * FROM messages m WHERE m.receiver = :username",
    countQuery = "SELECT count(*) FROM messages m WHERE m.receiver = :username",
    nativeQuery = true)
    Page<Message> findInbox(@Param("username") String username, Pageable pageable);


    @Query(value = "SELECT * FROM messages m WHERE m.sender = :username",
            countQuery = "SELECT count(*) FROM messages m WHERE m.sender = :username",
            nativeQuery = true)
    Page<Message> findOutbox(@Param("username") String username, Pageable pageable);

}
