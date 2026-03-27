package com.maverickbank.service.impl;

import com.maverickbank.dto.request.TransactionRequest;
import com.maverickbank.dto.response.TransactionResponse;
import com.maverickbank.dto.response.TransactionSummaryResponse;
import com.maverickbank.entity.*;
import com.maverickbank.enums.*;
import com.maverickbank.exception.BadRequestException;
import com.maverickbank.exception.NotFoundException;
import com.maverickbank.repository.*;
import com.maverickbank.strategy.TransactionStrategy;
import com.maverickbank.strategy.TransactionStrategyFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl {

    private final TransactionRepository transactionRepository;
    private final BankAccountRepository accountRepository;
    private final TransactionStrategyFactory strategyFactory;

    @Transactional
    public TransactionResponse performTransaction(Long userId, TransactionRequest request) {
        BankAccount account = accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new NotFoundException("Account not found"));

        validateAccountOwnership(account, userId);
        validateAccountActive(account);

        TransactionStrategy strategy = strategyFactory.getStrategy(request.getType());
        Transaction transaction = strategy.execute(account, request, userId);

        return mapToResponse(transaction);
    }

    private void validateAccountActive(BankAccount account) {
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BadRequestException("Account is not active");
        }
    }

    // ---- Query Methods ----
    @Transactional(readOnly = true)
    public List<TransactionResponse> getLast10Transactions(Long userId, String accountNumber) {
        BankAccount account = validateAndGetAccount(userId, accountNumber);
        return transactionRepository.findTop10ByAccountIdOrderByCreatedAtDesc(account.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getLastMonthTransactions(Long userId, String accountNumber) {
        BankAccount account = validateAndGetAccount(userId, accountNumber);
        LocalDateTime start = LocalDateTime.now().minusMonths(1).withDayOfMonth(1).toLocalDate().atStartOfDay();
        LocalDateTime end = LocalDateTime.now().minusMonths(1).with(
                java.time.temporal.TemporalAdjusters.lastDayOfMonth()).toLocalDate().atTime(23, 59, 59);
        return transactionRepository.findLastMonthTransactions(account.getId(), start, end)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsBetweenDates(
            Long userId, String accountNumber, LocalDateTime start, LocalDateTime end) {
        BankAccount account = validateAndGetAccount(userId, accountNumber);
        return transactionRepository.findByAccountIdAndCreatedAtBetweenOrderByCreatedAtDesc(
                account.getId(), start, end)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TransactionSummaryResponse getAccountSummary(Long userId, String accountNumber) {
        BankAccount account = validateAndGetAccount(userId, accountNumber);
        BigDecimal totalInbound = transactionRepository.getTotalInbound(account.getId());
        BigDecimal totalOutbound = transactionRepository.getTotalOutbound(account.getId());
        List<TransactionResponse> recent = transactionRepository
                .findTop10ByAccountIdOrderByCreatedAtDesc(account.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());

        return TransactionSummaryResponse.builder()
                .transactions(recent)
                .totalInbound(totalInbound != null ? totalInbound : BigDecimal.ZERO)
                .totalOutbound(totalOutbound != null ? totalOutbound : BigDecimal.ZERO)
                .totalCount((long) recent.size())
                .build();
    }

    private BankAccount validateAndGetAccount(Long userId, String accountNumber) {
        BankAccount account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new NotFoundException("Account not found"));
        validateAccountOwnership(account, userId);
        return account;
    }

    private void validateAccountOwnership(BankAccount account, Long userId) {
        if (!account.getUser().getId().equals(userId)) {
            throw new BadRequestException("Account does not belong to this user");
        }
    }

    private TransactionResponse mapToResponse(Transaction tx) {
        return TransactionResponse.builder()
                .id(tx.getId())
                .transactionId(tx.getTransactionId())
                .type(tx.getType())
                .amount(tx.getAmount())
                .balanceAfter(tx.getBalanceAfter())
                .description(tx.getDescription())
                .destinationAccountNumber(tx.getDestinationAccountNumber())
                .destinationBankName(tx.getDestinationBankName())
                .status(tx.getStatus())
                .accountNumber(tx.getAccount().getAccountNumber())
                .createdAt(tx.getCreatedAt())
                .build();
    }
}
