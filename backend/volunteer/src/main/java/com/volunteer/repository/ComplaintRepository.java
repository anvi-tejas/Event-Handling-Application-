package com.volunteer.repository;

import com.volunteer.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByStatus(String status);

    List<Complaint> findByUserEmail(String userEmail);
}
