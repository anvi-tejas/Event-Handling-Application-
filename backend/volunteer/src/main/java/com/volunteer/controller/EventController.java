package com.volunteer.controller;

import com.volunteer.entity.Event;
import com.volunteer.entity.User;
import com.volunteer.repository.EventRepository;
import com.volunteer.repository.UserRepository;
import com.volunteer.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
@CrossOrigin(origins = "http://localhost:5173")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // ================= CREATE EVENT (ORGANIZER) =================
    @PostMapping("/create")
    public Event createEvent(@RequestBody Event event) {

        User organizer = userRepository.findByEmail(event.getOrganizerEmail())
                .orElseThrow(() -> new RuntimeException("Organizer not found"));

        // 🔒 Block unverified organizer
        if (!"VERIFIED".equalsIgnoreCase(organizer.getVerificationStatus())) {
            throw new RuntimeException("Organizer account is not verified");
        }

        // ✅ Default status (admin can approve later if needed)
        event.setStatus("PENDING");

        Event savedEvent = eventRepository.save(event);

        // 📧 Notify all VERIFIED volunteers
        List<User> volunteers =
                userRepository.findByRoleAndVerificationStatus("VOLUNTEER", "VERIFIED");

        for (User v : volunteers) {
            try {
                emailService.sendNewEventEmail(v.getEmail(), savedEvent);
            } catch (Exception e) {
                System.out.println("Failed to email volunteer: " + v.getEmail());
            }
        }

        // 📧 Notify organizer
        try {
            emailService.sendEventCreatedEmail(
                    organizer.getEmail(),
                    savedEvent
            );
        } catch (Exception e) {
            System.out.println("Failed to email organizer");
        }

        return savedEvent;
    }

    // ================= GET EVENTS =================
    @GetMapping("/organizer/{email}")
    public List<Event> getEventsByOrganizer(@PathVariable String email) {
        return eventRepository.findByOrganizerEmail(email);
    }

    @GetMapping("/all")
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    // ================= UPDATE EVENT =================
    @PutMapping("/update/{id}")
    public Event updateEvent(@PathVariable Long id,
                             @RequestBody Event updated) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        event.setTitle(updated.getTitle());
        event.setCategory(updated.getCategory());
        event.setDescription(updated.getDescription());
        event.setStartDate(updated.getStartDate());
        event.setEndDate(updated.getEndDate());
        event.setStartTime(updated.getStartTime());
        event.setEndTime(updated.getEndTime());
        event.setRegistrationDeadline(updated.getRegistrationDeadline());
        event.setLocationName(updated.getLocationName());
        event.setAddress(updated.getAddress());
        event.setCity(updated.getCity());
        event.setArea(updated.getArea());
        event.setMapLink(updated.getMapLink());
        event.setRequiredVolunteers(updated.getRequiredVolunteers());
        event.setSkills(updated.getSkills());
        event.setMinAge(updated.getMinAge());
        event.setGenderPreference(updated.getGenderPreference());

        return eventRepository.save(event);
    }

    // ================= DELETE EVENT =================
    @DeleteMapping("/delete/{id}")
    public void deleteEvent(@PathVariable Long id) {
        eventRepository.deleteById(id);
    }
    // ================= ADMIN APPROVE / REJECT EVENT =================
    @PutMapping("/admin/update-status/{id}")
    public Event updateEventStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // allow only APPROVED or REJECTED
        if (!status.equalsIgnoreCase("APPROVED") &&
                !status.equalsIgnoreCase("REJECTED")) {
            throw new RuntimeException("Invalid status");
        }

        event.setStatus(status.toUpperCase());

        Event savedEvent = eventRepository.save(event);

        // 📧 notify organizer
        try {
            emailService.sendEventStatusUpdateEmail(
                    event.getOrganizerEmail(),
                    savedEvent
            );
        } catch (Exception e) {
            System.out.println("Email failed");
        }

        return savedEvent;
    }

}
