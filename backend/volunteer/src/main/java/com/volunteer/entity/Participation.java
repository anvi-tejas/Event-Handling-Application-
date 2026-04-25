package com.volunteer.entity;

import jakarta.persistence.*;

@Entity
public class Participation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long eventId;

    private String volunteerEmail;

    // PENDING / APPROVED / REJECTED / COMPLETED
    private String status = "PENDING";

    @Column(length = 1000)
    private String feedback;

    private Integer rating;

    // 🔹 NEW FIELDS FOR CERTIFICATE LOGIC
    private Double attendancePercentage;

    private Boolean certificateEligible = false;

    public Participation() {}

    // ---------- Getters & Setters ----------

    public Long getId() {
        return id;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public String getVolunteerEmail() {
        return volunteerEmail;
    }

    public void setVolunteerEmail(String volunteerEmail) {
        this.volunteerEmail = volunteerEmail;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    // 🔹 Certificate related getters/setters

    public Double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(Double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }

    public Boolean getCertificateEligible() {
        return certificateEligible;
    }

    public void setCertificateEligible(Boolean certificateEligible) {
        this.certificateEligible = certificateEligible;
    }
}
