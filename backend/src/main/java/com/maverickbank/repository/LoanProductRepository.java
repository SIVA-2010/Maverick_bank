package com.maverickbank.repository;

import com.maverickbank.entity.LoanProduct;
import com.maverickbank.enums.LoanType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanProductRepository extends JpaRepository<LoanProduct, Long> {
    List<LoanProduct> findByIsActiveTrue();
    List<LoanProduct> findByLoanType(LoanType type);
}
