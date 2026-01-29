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

    // ✅ REGISTER
    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    // ✅ LOGIN
    @PostMapping("/login")
    public User login(@RequestBody User user) {
        return userRepository
                .findByEmailAndPassword(user.getEmail(), user.getPassword())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
    }

    // ✅ GET USER PROFILE BY EMAIL
    @GetMapping("/email/{email}")
    public User getUserByEmail(@PathVariable String email) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        return user;
    }

    // ✅ UPDATE PROFILE
    @PutMapping("/update/{email}")
    public User updateProfile(@PathVariable String email, @RequestBody User updatedUser) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // ✅ Update Allowed Fields (Volunteer Profile)
        user.setContact(updatedUser.getContact());
        user.setGender(updatedUser.getGender());
        user.setSkills(updatedUser.getSkills());
        user.setProfilePicture(updatedUser.getProfilePicture());

        // ✅ NEW Profile fields
        user.setOccupation(updatedUser.getOccupation());
        user.setCity(updatedUser.getCity());
        user.setAge(updatedUser.getAge());
        user.setBio(updatedUser.getBio());
        user.setAvailability(updatedUser.getAvailability());

        return userRepository.save(user);
    }
}
