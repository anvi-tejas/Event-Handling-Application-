package com.volunteer.controller;

import com.volunteer.entity.Notification;
import com.volunteer.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    // 🔔 Get all notifications for user
    @GetMapping("/{email}")
    public List<Notification> getUserNotifications(@PathVariable String email) {
        return notificationRepository.findByUserEmailOrderByIdDesc(email);
    }

    // 🔔 Get unread count
    @GetMapping("/count/{email}")
    public long getUnreadCount(@PathVariable String email) {
        return notificationRepository.countByUserEmailAndReadStatusFalse(email);
    }

    // ✅ Mark notification as read
    @PutMapping("/read/{id}")
    public void markAsRead(@PathVariable Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        n.setReadStatus(true);
        notificationRepository.save(n);
    }
}
