package com.volunteer.controller;

import com.volunteer.entity.Attendance;
import com.volunteer.entity.Event;
import com.volunteer.entity.Participation;
import com.volunteer.repository.AttendanceRepository;
import com.volunteer.repository.EventRepository;
import com.volunteer.repository.ParticipationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/participations")
@CrossOrigin(origins = "http://localhost:5173")
public class ParticipationController {

    @Autowired
    private ParticipationRepository participationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    // ✅ Join Event (Volunteer)
    @PostMapping("/join")
    public String joinEvent(@RequestBody Participation participation) {

        boolean alreadyJoined = participationRepository.existsByEventIdAndVolunteerEmail(
                participation.getEventId(),
                participation.getVolunteerEmail()
        );

        if (alreadyJoined) return "You already applied for this event";

        participation.setStatus("PENDING");
        participationRepository.save(participation);

        return "Request Sent (Pending Approval)";
    }

    // ✅ Approve / Reject (Organizer)
    @PutMapping("/update-status/{id}")
    public Participation updateStatus(@PathVariable Long id, @RequestParam String status) {

        Participation p = participationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Participation not found"));

        if ("APPROVED".equalsIgnoreCase(status)) {

            Long eventId = p.getEventId();

            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new RuntimeException("Event not found"));

            long approvedCount = participationRepository.countByEventIdAndStatus(eventId, "APPROVED");

            if (approvedCount >= event.getRequiredVolunteers()) {
                throw new RuntimeException("Volunteer limit reached for this event");
            }
        }

        p.setStatus(status);
        return participationRepository.save(p);
    }

    // ✅ Get participations by volunteer email
    @GetMapping("/volunteer/{email}")
    public List<Participation> getVolunteerParticipations(@PathVariable String email) {
        return participationRepository.findByVolunteerEmail(email);
    }

    // ✅ Organizer gets requests for event
    @GetMapping("/event/{eventId}")
    public List<Participation> getRequestsByEvent(@PathVariable Long eventId) {
        return participationRepository.findByEventId(eventId);
    }

    // ✅ Volunteer submits feedback + rating
    @PutMapping("/feedback/{id}")
    public Participation addFeedback(@PathVariable Long id, @RequestBody Participation updated) {

        Participation p = participationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Participation not found"));

        p.setFeedback(updated.getFeedback());
        p.setRating(updated.getRating());

        return participationRepository.save(p);
    }

    // ✅ Cancel request (only PENDING)
    @DeleteMapping("/cancel/{eventId}/{email}")
    public String cancelRequest(@PathVariable Long eventId, @PathVariable String email) {

        Participation p = participationRepository.findByEventIdAndVolunteerEmail(eventId, email);

        if (p == null) return "Request not found";

        if (!"PENDING".equalsIgnoreCase(p.getStatus())) {
            return "You can cancel only PENDING requests";
        }

        participationRepository.delete(p);
        return "Request cancelled successfully ✅";
    }

    // ===================== ✅ DAILY ATTENDANCE =====================

    @GetMapping("/attendance/list")
    public List<Attendance> getAttendanceForDate(
            @RequestParam Long eventId,
            @RequestParam String date
    ) {
        LocalDate d = LocalDate.parse(date);
        return attendanceRepository.findByEventIdAndDate(eventId, d);
    }

    @PutMapping("/attendance/mark")
    public Attendance markDailyAttendance(
            @RequestParam Long eventId,
            @RequestParam String volunteerEmail,
            @RequestParam String date,
            @RequestParam Boolean attended
    ) {
        LocalDate d = LocalDate.parse(date);

        Participation p = participationRepository.findByEventIdAndVolunteerEmail(eventId, volunteerEmail);

        if (p == null || !"APPROVED".equalsIgnoreCase(p.getStatus())) {
            throw new RuntimeException("Attendance can only be marked for APPROVED volunteers");
        }

        Attendance existing = attendanceRepository
                .findByEventIdAndVolunteerEmailAndDate(eventId, volunteerEmail, d);

        if (existing == null) {
            Attendance a = new Attendance();
            a.setEventId(eventId);
            a.setVolunteerEmail(volunteerEmail);
            a.setDate(d);
            a.setAttended(attended);
            return attendanceRepository.save(a);
        }

        existing.setAttended(attended);
        return attendanceRepository.save(existing);
    }
}
