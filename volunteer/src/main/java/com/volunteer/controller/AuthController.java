package com.volunteer.controller;

import com.volunteer.entity.User;
import com.volunteer.repository.UserRepository;
import com.volunteer.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // ================= REGISTER =================
    @PostMapping("/register")
    public User register(@RequestBody User user) {

        // 🔒 Prevent duplicate email
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        // ✅ Default statuses
        user.setStatus("ACTIVE");              // system status
        user.setVerificationStatus("PENDING"); // admin verification

        User savedUser = userRepository.save(user);

        // 📧 Registration confirmation email (safe)
        // 📧 Registration email (safe – won’t break registration)
        try {
            emailService.sendRegistrationPendingEmail(
                    savedUser.getEmail(),
                    savedUser.getRole()
            );
        } catch (Exception e) {
            System.out.println("Email failed: " + e.getMessage());
        }


        return savedUser;
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public User login(@RequestBody User loginData) {

        return userRepository
                .findByEmailAndPassword(
                        loginData.getEmail(),
                        loginData.getPassword()
                )
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password"));
    }
}
