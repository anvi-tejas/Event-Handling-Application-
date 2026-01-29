package com.volunteer.repository;

import com.volunteer.entity.Participation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParticipationRepository extends JpaRepository<Participation, Long> {

    boolean existsByEventIdAndVolunteerEmail(Long eventId, String volunteerEmail);

    List<Participation> findByVolunteerEmail(String volunteerEmail);

    List<Participation> findByEventId(Long eventId);

    Participation findByEventIdAndVolunteerEmail(Long eventId, String volunteerEmail);

    long countByEventIdAndStatus(Long eventId, String status);
}
