package com.volunteer.controller;

import com.volunteer.entity.User;
import com.volunteer.repository.UserRepository;
import com.volunteer.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // 🔍 All users
    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ⏳ Pending verification
    @GetMapping("/pending")
    public List<User> getPendingUsers() {
        return userRepository.findByVerificationStatus("PENDING");
    }

    // ✅ Verify user
    @PutMapping("/verify/{id}")
    public User verifyUser(@PathVariable Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setVerificationStatus("VERIFIED");
        user.setStatus("ACTIVE");

        User saved = userRepository.save(user);

        // 📧 Email
        emailService.sendVerificationApprovedEmail(saved.getEmail());

        return saved;
    }

    // ❌ Reject user
    @PutMapping("/reject/{id}")
    public User rejectUser(@PathVariable Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setVerificationStatus("REJECTED");
        user.setStatus("BLOCKED");

        return userRepository.save(user);
    }
}
