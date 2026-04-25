package com.volunteer.controller;

import com.volunteer.dto.AttendanceSummaryResponse;
import com.volunteer.dto.ParticipationResponse;
import com.volunteer.entity.Attendance;
import com.volunteer.entity.Event;
import com.volunteer.entity.Participation;
import com.volunteer.entity.User;
import com.volunteer.repository.*;
import com.volunteer.service.EmailService;
import com.volunteer.service.ParticipationService;
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

    @Autowired
    private ParticipationService participationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // ================= JOIN EVENT (VOLUNTEER) =================
    @PostMapping("/join")
    public Participation joinEvent(@RequestBody Participation p) {

        User volunteer = userRepository.findByEmail(p.getVolunteerEmail())
                .orElseThrow(() -> new RuntimeException("Volunteer not found"));

        // 🔒 Block unverified volunteer
        if (!"VERIFIED".equals(volunteer.getVerificationStatus())) {
            throw new RuntimeException("Volunteer account is not verified");
        }

        Event event = eventRepository.findById(p.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        p.setStatus("PENDING");
        Participation saved = participationRepository.save(p);

        // 📧 Email confirmation
        emailService.sendJoinConfirmationEmail(volunteer.getEmail(), event);

        return saved;
    }

    // ================= APPROVE / REJECT =================
    @PutMapping("/update-status/{id}")
    public Participation updateStatus(@PathVariable Long id,
                                      @RequestParam String status) {

        Participation p = participationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Participation not found"));

        Event event = eventRepository.findById(p.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if ("APPROVED".equalsIgnoreCase(status)) {

            long approvedCount =
                    participationRepository.countByEventIdAndStatus(
                            event.getId(), "APPROVED");

            if (approvedCount >= event.getRequiredVolunteers()) {
                throw new RuntimeException("Volunteer limit reached");
            }

            // 📧 Notify volunteer approval
            emailService.sendParticipationApprovedEmail(
                    p.getVolunteerEmail(), event);
        }

        p.setStatus(status);
        return participationRepository.save(p);
    }

    // ================= VOLUNTEER PARTICIPATIONS =================
    @GetMapping("/volunteer/{email}")
    public List<Participation> getVolunteerParticipations(@PathVariable String email) {
        return participationRepository.findByVolunteerEmail(email);
    }

    // ================= EVENT REQUESTS =================
    @GetMapping("/event/{eventId}")
    public List<Participation> getRequestsByEvent(@PathVariable Long eventId) {
        return participationRepository.findByEventId(eventId);
    }

    // ================= VOLUNTEER HISTORY =================
    @GetMapping("/volunteer/history/{email}")
    public List<ParticipationResponse> getVolunteerHistory(@PathVariable String email) {
        return participationService.getVolunteerHistory(email);
    }

    // ================= FEEDBACK =================
    @PutMapping("/feedback/{id}")
    public Participation addFeedback(@PathVariable Long id,
                                     @RequestBody Participation updated) {

        Participation p = participationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Participation not found"));

        p.setFeedback(updated.getFeedback());
        p.setRating(updated.getRating());

        return participationRepository.save(p);
    }

    // ================= CANCEL REQUEST =================
    @DeleteMapping("/cancel/{eventId}/{email}")
    public String cancelRequest(@PathVariable Long eventId,
                                @PathVariable String email) {

        Participation p =
                participationRepository.findByEventIdAndVolunteerEmail(eventId, email);

        if (p == null) return "Request not found";

        if (!"PENDING".equalsIgnoreCase(p.getStatus())) {
            return "Only PENDING requests can be cancelled";
        }

        participationRepository.delete(p);
        return "Request cancelled successfully ✅";
    }

    // ================= ATTENDANCE =================
    @GetMapping("/attendance/list")
    public List<Attendance> getAttendanceForDate(@RequestParam Long eventId,
                                                 @RequestParam String date) {
        return attendanceRepository.findByEventIdAndDate(eventId, LocalDate.parse(date));
    }

    @PutMapping("/attendance/mark")
    public Attendance markAttendance(@RequestParam Long eventId,
                                     @RequestParam String volunteerEmail,
                                     @RequestParam String date,
                                     @RequestParam Boolean attended) {

        Participation p =
                participationRepository.findByEventIdAndVolunteerEmail(eventId, volunteerEmail);

        if (p == null || !"APPROVED".equalsIgnoreCase(p.getStatus())) {
            throw new RuntimeException("Attendance allowed only for APPROVED volunteers");
        }

        LocalDate d = LocalDate.parse(date);

        Attendance a =
                attendanceRepository.findByEventIdAndVolunteerEmailAndDate(
                        eventId, volunteerEmail, d);

        if (a == null) {
            a = new Attendance();
            a.setEventId(eventId);
            a.setVolunteerEmail(volunteerEmail);
            a.setDate(d);
        }

        a.setAttended(attended);
        return attendanceRepository.save(a);
    }
    @GetMapping("/attendance/summary")
    public AttendanceSummaryResponse getAttendanceSummary(
            @RequestParam Long eventId,
            @RequestParam String volunteerEmail) {

        List<Attendance> list =
                attendanceRepository.findByEventIdAndVolunteerEmail(
                        eventId, volunteerEmail);

        int totalDays = list.size();
        int presentDays = (int) list.stream()
                .filter(a -> Boolean.TRUE.equals(a.getAttended()))
                .count();

        int absentDays = totalDays - presentDays;

        double percentage = totalDays == 0
                ? 0
                : (presentDays * 100.0) / totalDays;

        return new AttendanceSummaryResponse(
                totalDays,
                presentDays,
                absentDays,
                Math.round(percentage * 100.0) / 100.0,
                list
        );
    }

}
