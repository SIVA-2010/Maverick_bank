package com.maverickbank.repository;

import com.maverickbank.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByTransactionId(String transactionId);
    List<Transaction> findByAccountIdOrderByCreatedAtDesc(Long accountId);
    Page<Transaction> findByAccountId(Long accountId, Pageable pageable);

    List<Transaction> findTop10ByAccountIdOrderByCreatedAtDesc(Long accountId);

    List<Transaction> findByAccountIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long accountId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT t FROM Transaction t WHERE t.account.id = :accountId " +
           "AND t.createdAt >= :startOfMonth AND t.createdAt <= :endOfMonth ORDER BY t.createdAt DESC")
    List<Transaction> findLastMonthTransactions(
            @Param("accountId") Long accountId,
            @Param("startOfMonth") LocalDateTime startOfMonth,
            @Param("endOfMonth") LocalDateTime endOfMonth);

    Page<Transaction> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.account.id = :accountId AND t.type = 'DEPOSIT' AND t.status = 'SUCCESS'")
    BigDecimal getTotalInbound(@Param("accountId") Long accountId);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.account.id = :accountId AND t.type = 'WITHDRAWAL' AND t.status = 'SUCCESS'")
    BigDecimal getTotalOutbound(@Param("accountId") Long accountId);
}
