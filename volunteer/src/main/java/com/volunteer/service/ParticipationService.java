package com.volunteer.service;

import com.volunteer.dto.ParticipationResponse;
import com.volunteer.entity.Attendance;
import com.volunteer.entity.Event;
import com.volunteer.entity.Participation;
import com.volunteer.repository.AttendanceRepository;
import com.volunteer.repository.EventRepository;
import com.volunteer.repository.ParticipationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class ParticipationService {

    @Autowired
    private ParticipationRepository participationRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EventRepository eventRepository;

    /**
     * Volunteer History with Attendance % and Certificate Eligibility
     */
    public List<ParticipationResponse> getVolunteerHistory(String volunteerEmail) {

        List<Participation> participations =
                participationRepository.findByVolunteerEmail(volunteerEmail);

        List<ParticipationResponse> responseList = new ArrayList<>();

        for (Participation p : participations) {

            Event event = eventRepository.findById(p.getEventId())
                    .orElse(null);

            if (event == null) continue;

            // Only calculate when event is COMPLETED
            if (!"COMPLETED".equalsIgnoreCase(event.getStatus())) {
                continue;
            }

            // ✅ CORRECT: LocalDate works directly
            long totalDays = ChronoUnit.DAYS.between(
                    event.getStartDate(),
                    event.getEndDate()
            ) + 1;

            List<Attendance> attendances =
                    attendanceRepository.findByEventIdAndVolunteerEmail(
                            p.getEventId(),
                            p.getVolunteerEmail()
                    );

            long presentDays = attendances.stream()
                    .filter(Attendance::getAttended)
                    .count();

            double percentage = (presentDays * 100.0) / totalDays;
            boolean eligible = percentage >= 75;

            // Update Participation entity
            p.setAttendancePercentage(percentage);
            p.setCertificateEligible(eligible);
            participationRepository.save(p);

            // Build Response DTO
            ParticipationResponse resp = new ParticipationResponse();
            resp.setParticipationId(p.getId());
            resp.setEventId(p.getEventId());
            resp.setStatus(p.getStatus());
            resp.setAttendancePercentage(percentage);
            resp.setCertificateEligible(eligible);
            resp.setFeedback(p.getFeedback());
            resp.setRating(p.getRating());

            responseList.add(resp);
        }

        return responseList;
    }
}
