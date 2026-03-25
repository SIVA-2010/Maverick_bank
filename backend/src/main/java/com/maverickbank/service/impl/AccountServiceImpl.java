package com.maverickbank.service.impl;

import com.maverickbank.dto.request.OpenAccountRequest;
import com.maverickbank.dto.response.AccountResponse;
import com.maverickbank.entity.BankAccount;
import com.maverickbank.entity.Transaction;
import com.maverickbank.entity.User;
import com.maverickbank.enums.AccountStatus;
import com.maverickbank.enums.TransactionStatus;
import com.maverickbank.enums.TransactionType;
import com.maverickbank.exception.BadRequestException;
import com.maverickbank.exception.NotFoundException;
import com.maverickbank.repository.BankAccountRepository;
import com.maverickbank.repository.TransactionRepository;
import com.maverickbank.repository.UserRepository;
import com.maverickbank.util.AccountNumberGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountServiceImpl {

    private final BankAccountRepository accountRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final AccountNumberGenerator accountNumberGenerator;

    @Transactional
    public AccountResponse openAccount(Long userId, OpenAccountRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        String accountNumber = accountNumberGenerator.generate();

        BankAccount account = BankAccount.builder()
                .accountNumber(accountNumber)
                .accountType(request.getAccountType())
                .balance(request.getInitialDeposit() != null ? request.getInitialDeposit() : BigDecimal.ZERO)
                .ifscCode(request.getIfscCode())
                .branchName(request.getBranchName())
                .branchAddress("")
                .status(AccountStatus.PENDING)
                .user(user)
                .build();

        account = accountRepository.save(account);

        // Record initial deposit if any
        if (request.getInitialDeposit() != null && request.getInitialDeposit().compareTo(BigDecimal.ZERO) > 0) {
            Transaction tx = Transaction.builder()
                    .transactionId("TXN" + System.currentTimeMillis())
                    .type(TransactionType.DEPOSIT)
                    .amount(request.getInitialDeposit())
                    .balanceAfter(request.getInitialDeposit())
                    .description("Initial deposit on account opening")
                    .status(TransactionStatus.SUCCESS)
                    .account(account)
                    .build();
            transactionRepository.save(tx);
        }

        log.info("Account opened for user {}: {}", userId, accountNumber);
        return mapToResponse(account);
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getCustomerAccounts(Long userId) {
        return accountRepository.findByUserId(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AccountResponse getAccountDetails(Long userId, String accountNumber) {
        BankAccount account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new NotFoundException("Account not found: " + accountNumber));

        if (!account.getUser().getId().equals(userId)) {
            throw new BadRequestException("Account does not belong to this user");
        }
        return mapToResponse(account);
    }

    @Transactional
    public void requestAccountClosure(Long userId, String accountNumber) {
        BankAccount account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new NotFoundException("Account not found"));

        if (!account.getUser().getId().equals(userId)) {
            throw new BadRequestException("Account does not belong to this user");
        }
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BadRequestException("Only active accounts can be closed");
        }

        account.setStatus(AccountStatus.CLOSE_REQUESTED);
        accountRepository.save(account);
        log.info("Account closure requested: {}", accountNumber);
    }

    // ---- Employee Methods ----
    @Transactional
    public AccountResponse approveAccount(Long accountId) {
        BankAccount account = accountRepository.findById(accountId)
                .orElseThrow(() -> new NotFoundException("Account not found"));

        if (account.getStatus() != AccountStatus.PENDING) {
            throw new BadRequestException("Account is not in pending state");
        }
        account.setStatus(AccountStatus.ACTIVE);
        return mapToResponse(accountRepository.save(account));
    }

    @Transactional
    public AccountResponse closeAccount(Long accountId) {
        BankAccount account = accountRepository.findById(accountId)
                .orElseThrow(() -> new NotFoundException("Account not found"));

        if (account.getStatus() != AccountStatus.CLOSE_REQUESTED) {
            throw new BadRequestException("No closure request found for this account");
        }
        account.setStatus(AccountStatus.CLOSED);
        return mapToResponse(accountRepository.save(account));
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getPendingAccounts() {
        return accountRepository.findByStatus(AccountStatus.PENDING)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getCloseRequestedAccounts() {
        return accountRepository.findByStatus(AccountStatus.CLOSE_REQUESTED)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private AccountResponse mapToResponse(BankAccount account) {
        return AccountResponse.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .accountType(account.getAccountType())
                .balance(account.getBalance())
                .ifscCode(account.getIfscCode())
                .branchName(account.getBranchName())
                .branchAddress(account.getBranchAddress())
                .status(account.getStatus())
                .holderName(account.getUser().getFirstName() + " " + account.getUser().getLastName())
                .createdAt(account.getCreatedAt())
                .build();
    }
}
