package com.volunteer.repository;

import com.volunteer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailAndPassword(String email, String password);

    Optional<User> findByEmail(String email);

    List<User> findByVerificationStatus(String verificationStatus);

    List<User> findByRoleAndVerificationStatus(String role, String verificationStatus);
}
