package com.volunteer.repository;

import com.volunteer.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByOrganizerEmail(String organizerEmail);
}
