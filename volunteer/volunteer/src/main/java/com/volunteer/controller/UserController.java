package com.volunteer.controller;

import com.volunteer.entity.User;
import com.volunteer.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // 🔍 Get user by email
    @GetMapping("/email/{email}")
    public User getUserByEmail(@PathVariable String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ✏️ Update profile + document upload
    @PutMapping("/update/{email}")
    public User updateUser(@PathVariable String email, @RequestBody User updated) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updated.getContact() != null) user.setContact(updated.getContact());
        if (updated.getGender() != null) user.setGender(updated.getGender());
        if (updated.getCity() != null) user.setCity(updated.getCity());
        if (updated.getOccupation() != null) user.setOccupation(updated.getOccupation());
        if (updated.getAge() != null) user.setAge(updated.getAge());
        if (updated.getSkills() != null) user.setSkills(updated.getSkills());
        if (updated.getBio() != null) user.setBio(updated.getBio());
        if (updated.getAvailability() != null) user.setAvailability(updated.getAvailability());

        // 📄 Document upload
        if (updated.getDocumentUrl() != null) {
            user.setDocumentUrl(updated.getDocumentUrl());
            user.setVerificationStatus("PENDING");
            user.setVerified(false);
        }

        if (updated.getDocumentName() != null) {
            user.setDocumentName(updated.getDocumentName());
        }

        // 🖼 Profile pic
        if (updated.getProfilePicture() != null) {
            user.setProfilePicture(updated.getProfilePicture());
        }

        // ✅ ADD THIS (VERY IMPORTANT)
        if (updated.getVerificationStatus() != null) {
            user.setVerificationStatus(updated.getVerificationStatus());
        }
        user.setVerified(updated.isVerified());

        return userRepository.save(user);
    }

    @PutMapping("/upload-document/{email}")
    public User uploadDocument(
            @PathVariable String email,
            @RequestBody User updated) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // save document
        user.setDocumentUrl(updated.getDocumentUrl());
        user.setDocumentName(updated.getDocumentName());


        // whenever user uploads/reuploads document
        // reset verification status
        user.setVerificationStatus("PENDING");

        return userRepository.save(user);
    }

}
