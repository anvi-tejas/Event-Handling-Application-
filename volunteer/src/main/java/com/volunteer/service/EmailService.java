package com.volunteer.service;

import com.volunteer.entity.Event;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // ================= GENERIC SEND =================
    private void send(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    // ================= REGISTRATION =================
    public void sendRegistrationPendingEmail(String email, String role) {
        send(
                email,
                "Registration Successful – Verification Pending",
                "Hello,\n\nYour " + role + " account has been registered successfully.\n" +
                        "Your profile is currently under admin verification.\n\n" +
                        "You will be notified once verified.\n\nThank you."
        );
    }

    // ================= DOCUMENT VERIFICATION =================
    public void sendVerificationApprovedEmail(String email) {
        send(
                email,
                "Account Verified Successfully ✅",
                "Congratulations!\n\nYour documents have been verified by admin.\n" +
                        "You can now access full platform features.\n\nRegards,\nVolunteer Platform"
        );
    }

    public void sendNewEventEmail(String email, Event event) {
        send(
                email,
                "📢 New Volunteer Event Available!",
                "Hello,\n\nA new volunteer event has been posted!\n\n" +
                        "📌 Title: " + event.getTitle() + "\n" +
                        "📍 Location: " + event.getCity() + "\n" +
                        "🗓 Dates: " + event.getStartDate() + " to " + event.getEndDate() + "\n\n" +
                        "Log in to VolunteerHub to view and join the event.\n\n" +
                        "Thank you!\nVolunteerHub Team"
        );
    }


    // ================= EVENT EMAILS =================
    public void sendEventCreatedEmail(String email, Event event) {
        send(
                email,
                "New Volunteer Event Available 📢",
                "A new event has been posted:\n\n" +
                        "Title: " + event.getTitle() + "\n" +
                        "Category: " + event.getCategory() + "\n" +
                        "City: " + event.getCity() + "\n" +
                        "Start Date: " + event.getStartDate() + "\n\n" +
                        "Login to apply now!"
        );
    }

    public void sendEventApprovedEmail(String organizerEmail, Event event) {
        send(
                organizerEmail,
                "Event Approved ✅",
                "Your event has been approved by admin.\n\n" +
                        "Event: " + event.getTitle() + "\n\n" +
                        "You can now manage volunteers."
        );
    }

    // ================= PARTICIPATION =================
    public void sendJoinConfirmationEmail(String email, Event event) {
        send(
                email,
                "Event Join Request Submitted",
                "You have successfully applied for the event:\n\n" +
                        event.getTitle() + "\n\n" +
                        "Your request is pending organizer approval."
        );
    }

    public void sendParticipationApprovedEmail(String email, Event event) {
        send(
                email,
                "Participation Approved 🎉",
                "Good news!\n\nYou have been approved for the event:\n" +
                        event.getTitle() + "\n\n" +
                        "Please attend as scheduled."
        );
    }

    // ================= CERTIFICATE =================
    public void sendCertificateAvailableEmail(String email, String eventTitle) {
        send(
                email,
                "Certificate Available 🏆",
                "Congratulations!\n\nYour certificate for the event:\n" +
                        eventTitle + "\n\nis now available for download."
        );
    }

    // ================= COMPLAINTS =================
    public void sendComplaintResolvedEmail(String email) {
        send(
                email,
                "Complaint Resolved ✅",
                "Hello,\n\nYour complaint has been resolved by admin.\n" +
                        "Thank you for your patience."
        );
    }
}
