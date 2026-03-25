package com.maverickbank.repository;

import com.maverickbank.entity.LoanApplication;
import com.maverickbank.enums.LoanApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {
    Optional<LoanApplication> findByApplicationNumber(String applicationNumber);
    List<LoanApplication> findByUserId(Long userId);
    List<LoanApplication> findByStatus(LoanApplicationStatus status);
    Page<LoanApplication> findAllByOrderByCreatedAtDesc(Pageable pageable);
    boolean existsByUserIdAndLoanProductIdAndStatusIn(Long userId, Long loanProductId, List<LoanApplicationStatus> statuses);
}
