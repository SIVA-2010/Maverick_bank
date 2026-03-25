package com.maverickbank.repository;

import com.maverickbank.entity.BankAccount;
import com.maverickbank.enums.AccountStatus;
import com.maverickbank.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
    Optional<BankAccount> findByAccountNumber(String accountNumber);
    List<BankAccount> findByUserId(Long userId);
    List<BankAccount> findByUserIdAndStatus(Long userId, AccountStatus status);
    boolean existsByAccountNumber(String accountNumber);
    List<BankAccount> findByStatus(AccountStatus status);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.account.id = :accountId AND t.type = 'DEPOSIT'")
    Long countInboundTransactions(@Param("accountId") Long accountId);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.account.id = :accountId AND t.type = :type AND t.status = 'SUCCESS'")
    BigDecimal sumByAccountIdAndType(@Param("accountId") Long accountId, @Param("type") TransactionType type);
}
