package com.volunteer.controller;

import com.volunteer.entity.Event;
import com.volunteer.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
@CrossOrigin(origins = "http://localhost:5173")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    // ================= CREATE EVENT =================
    @PostMapping("/create")
    public Event createEvent(@RequestBody Event event) {
        return eventRepository.save(event);
    }

    // ================= GET EVENTS BY ORGANIZER =================
    @GetMapping("/organizer/{email}")
    public List<Event> getEventsByOrganizer(@PathVariable String email) {
        return eventRepository.findByOrganizerEmail(email);
    }

    // ================= GET ALL EVENTS =================
    @GetMapping("/all")
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    // ================= UPDATE EVENT =================
    @PutMapping("/update/{id}")
    public Event updateEvent(@PathVariable Long id, @RequestBody Event updatedEvent) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // ✅ BASIC
        event.setTitle(updatedEvent.getTitle());
        event.setCategory(updatedEvent.getCategory());
        event.setDescription(updatedEvent.getDescription());

        // ✅ DATE/TIME
        event.setStartDate(updatedEvent.getStartDate());
        event.setEndDate(updatedEvent.getEndDate());
        event.setStartTime(updatedEvent.getStartTime());
        event.setEndTime(updatedEvent.getEndTime());

        // ✅ NEW: Registration Deadline
        event.setRegistrationDeadline(updatedEvent.getRegistrationDeadline());

        // ✅ LOCATION
        event.setLocationName(updatedEvent.getLocationName());
        event.setAddress(updatedEvent.getAddress());
        event.setCity(updatedEvent.getCity());
        event.setArea(updatedEvent.getArea());
        event.setMapLink(updatedEvent.getMapLink());

        // ✅ REQUIREMENTS
        event.setRequiredVolunteers(updatedEvent.getRequiredVolunteers());
        event.setSkills(updatedEvent.getSkills());
        event.setMinAge(updatedEvent.getMinAge());
        event.setGenderPreference(updatedEvent.getGenderPreference());

        return eventRepository.save(event);
    }

    // ================= DELETE EVENT =================
    @DeleteMapping("/delete/{id}")
    public void deleteEvent(@PathVariable Long id) {
        eventRepository.deleteById(id);
    }
}
