package com.volunteer.repository;

import com.volunteer.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserEmailOrderByIdDesc(String userEmail);

    long countByUserEmailAndReadStatusFalse(String userEmail);
}
