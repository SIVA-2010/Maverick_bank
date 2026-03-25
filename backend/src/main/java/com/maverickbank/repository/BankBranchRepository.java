package com.maverickbank.repository;

import com.maverickbank.entity.BankBranch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankBranchRepository extends JpaRepository<BankBranch, Long> {
    List<BankBranch> findByBankNameIgnoreCase(String bankName);
    Optional<BankBranch> findByIfscCode(String ifscCode);

    @Query("SELECT DISTINCT b.bankName FROM BankBranch b ORDER BY b.bankName")
    List<String> findAllDistinctBankNames();
}
