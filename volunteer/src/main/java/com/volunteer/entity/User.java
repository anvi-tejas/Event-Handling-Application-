package com.volunteer.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ================= BASIC =================
    private String name;
    private String email;
    private String password;

    // ADMIN / ORGANIZER / VOLUNTEER
    private String role;

    // ACTIVE / BLOCKED
    private String status = "ACTIVE";

    // ================= PROFILE =================
    private String contact;
    private String gender;
    private String city;
    private String occupation;
    private Integer age;

    @Column(length = 2000)
    private String skills;

    @Column(length = 3000)
    private String bio;

    private String availability;

    // ================= MEDIA =================
    @Column(length = 100000)
    private String profilePicture;   // base64 image

    @Column(length = 100000)
    private String documentUrl;       // base64 pdf/image

    private String documentName;

    // ================= VERIFICATION =================
    private boolean verified = false;     // frontend flag

    // PENDING / VERIFIED / REJECTED
    private String verificationStatus = "PENDING";

    // ================= GETTERS & SETTERS =================

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }

    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public String getDocumentUrl() { return documentUrl; }
    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }
}
