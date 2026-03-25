package com.maverickbank.service.impl;

import com.maverickbank.dto.request.TransactionRequest;
import com.maverickbank.dto.response.TransactionResponse;
import com.maverickbank.dto.response.TransactionSummaryResponse;
import com.maverickbank.entity.*;
import com.maverickbank.enums.*;
import com.maverickbank.exception.BadRequestException;
import com.maverickbank.exception.NotFoundException;
import com.maverickbank.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionServiceImpl {

    private final TransactionRepository transactionRepository;
    private final BankAccountRepository accountRepository;
    private final BeneficiaryRepository beneficiaryRepository;

    @Transactional
    public TransactionResponse performTransaction(Long userId, TransactionRequest request) {
        BankAccount account = accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new NotFoundException("Account not found"));

        validateAccountOwnership(account, userId);
        validateAccountActive(account);

        Transaction transaction;

        switch (request.getType()) {
            case DEPOSIT -> transaction = processDeposit(account, request);
            case WITHDRAWAL -> transaction = processWithdrawal(account, request);
            case TRANSFER -> transaction = processTransfer(account, request, userId);
            default -> throw new BadRequestException("Invalid transaction type");
        }

        return mapToResponse(transaction);
    }

    private Transaction processDeposit(BankAccount account, TransactionRequest request) {
        account.setBalance(account.getBalance().add(request.getAmount()));
        accountRepository.save(account);

        Transaction tx = Transaction.builder()
                .transactionId(generateTransactionId())
                .type(TransactionType.DEPOSIT)
                .amount(request.getAmount())
                .balanceAfter(account.getBalance())
                .description(request.getDescription() != null ? request.getDescription() : "Deposit")
                .status(TransactionStatus.SUCCESS)
                .account(account)
                .build();
        return transactionRepository.save(tx);
    }

    private Transaction processWithdrawal(BankAccount account, TransactionRequest request) {
        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BadRequestException("Insufficient balance");
        }
        account.setBalance(account.getBalance().subtract(request.getAmount()));
        accountRepository.save(account);

        Transaction tx = Transaction.builder()
                .transactionId(generateTransactionId())
                .type(TransactionType.WITHDRAWAL)
                .amount(request.getAmount())
                .balanceAfter(account.getBalance())
                .description(request.getDescription() != null ? request.getDescription() : "Withdrawal")
                .status(TransactionStatus.SUCCESS)
                .account(account)
                .build();
        return transactionRepository.save(tx);
    }

    private Transaction processTransfer(BankAccount sourceAccount, TransactionRequest request, Long userId) {
        if (request.getDestinationAccountNumber() == null) {
            throw new BadRequestException("Destination account is required for transfers");
        }
        if (sourceAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BadRequestException("Insufficient balance");
        }

        // Debit source
        sourceAccount.setBalance(sourceAccount.getBalance().subtract(request.getAmount()));
        accountRepository.save(sourceAccount);

        Transaction tx = Transaction.builder()
                .transactionId(generateTransactionId())
                .type(TransactionType.TRANSFER)
                .amount(request.getAmount())
                .balanceAfter(sourceAccount.getBalance())
                .description(request.getDescription() != null ? request.getDescription() : "Fund Transfer")
                .destinationAccountNumber(request.getDestinationAccountNumber())
                .destinationBankName(request.getDestinationBankName())
                .status(TransactionStatus.SUCCESS)
                .account(sourceAccount)
                .build();
        tx = transactionRepository.save(tx);

        // Credit destination (if same bank)
        Optional<BankAccount> destOpt = accountRepository.findByAccountNumber(request.getDestinationAccountNumber());
        destOpt.ifPresent(destAccount -> {
            destAccount.setBalance(destAccount.getBalance().add(request.getAmount()));
            accountRepository.save(destAccount);

            Transaction creditTx = Transaction.builder()
                    .transactionId(generateTransactionId())
                    .type(TransactionType.DEPOSIT)
                    .amount(request.getAmount())
                    .balanceAfter(destAccount.getBalance())
                    .description("Transfer received from " + sourceAccount.getAccountNumber())
                    .status(TransactionStatus.SUCCESS)
                    .account(destAccount)
                    .build();
            transactionRepository.save(creditTx);
        });

        // Auto-save beneficiary
        if (Boolean.TRUE.equals(request.getSaveBeneficiary())) {
            saveBeneficiaryIfNotExists(userId, request);
        }

        return tx;
    }

    private void saveBeneficiaryIfNotExists(Long userId, TransactionRequest request) {
        if (!beneficiaryRepository.existsByUserIdAndAccountNumber(userId, request.getDestinationAccountNumber())) {
            User user = accountRepository.findByAccountNumber(request.getAccountNumber())
                    .map(BankAccount::getUser)
                    .orElse(null);
            if (user != null) {
                Beneficiary beneficiary = Beneficiary.builder()
                        .accountHolderName("Unknown (Auto-saved)") // Defaulting as we only have account number
                        .accountNumber(request.getDestinationAccountNumber())
                        .bankName(request.getDestinationBankName() != null ? request.getDestinationBankName() : "Unknown Bank")
                        .branchName("Unknown Branch") // We don't get branch name in transfer request natively.
                        .ifscCode("UNKNOWN")
                        .user(user)
                        .build();
                beneficiaryRepository.save(beneficiary);
            }
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

    private void validateAccountActive(BankAccount account) {
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BadRequestException("Account is not active");
        }
    }

    private String generateTransactionId() {
        return "TXN" + System.currentTimeMillis() + (int)(Math.random() * 1000);
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
