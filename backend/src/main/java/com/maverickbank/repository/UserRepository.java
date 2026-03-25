package com.maverickbank.repository;

import com.maverickbank.entity.User;
import com.maverickbank.enums.UserRole;
import com.maverickbank.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(UserRole role);
    Page<User> findByRoleAndStatus(UserRole role, UserStatus status, Pageable pageable);
}
