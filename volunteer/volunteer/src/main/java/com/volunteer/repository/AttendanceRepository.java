package com.volunteer.repository;

import com.volunteer.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Attendance findByEventIdAndVolunteerEmailAndDate(
            Long eventId,
            String volunteerEmail,
            LocalDate date
    );

    List<Attendance> findByEventIdAndDate(
            Long eventId,
            LocalDate date
    );

    // 🔹 NEW METHOD (REQUIRED for certificate logic)
    List<Attendance> findByEventIdAndVolunteerEmail(
            Long eventId,
            String volunteerEmail
    );

    List<Attendance> findByEventId(Long eventId);
}
