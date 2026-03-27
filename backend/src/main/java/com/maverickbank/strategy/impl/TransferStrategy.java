package com.maverickbank.strategy.impl;

import com.maverickbank.dto.request.TransactionRequest;
import com.maverickbank.entity.BankAccount;
import com.maverickbank.entity.Beneficiary;
import com.maverickbank.entity.Transaction;
import com.maverickbank.entity.User;
import com.maverickbank.enums.TransactionStatus;
import com.maverickbank.enums.TransactionType;
import com.maverickbank.exception.BadRequestException;
import com.maverickbank.repository.BankAccountRepository;
import com.maverickbank.repository.BeneficiaryRepository;
import com.maverickbank.repository.TransactionRepository;
import com.maverickbank.strategy.TransactionStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class TransferStrategy implements TransactionStrategy {

    private final BankAccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final BeneficiaryRepository beneficiaryRepository;

    @Override
    public Transaction execute(BankAccount sourceAccount, TransactionRequest request, Long userId) {
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
            saveBeneficiaryIfNotExists(userId, sourceAccount, request);
        }

        return tx;
    }

    private void saveBeneficiaryIfNotExists(Long userId, BankAccount sourceAccount, TransactionRequest request) {
        if (!beneficiaryRepository.existsByUserIdAndAccountNumber(userId, request.getDestinationAccountNumber())) {
            User user = sourceAccount.getUser();
            if (user != null) {
                Beneficiary beneficiary = Beneficiary.builder()
                        .accountHolderName("Unknown (Auto-saved)")
                        .accountNumber(request.getDestinationAccountNumber())
                        .bankName(request.getDestinationBankName() != null ? request.getDestinationBankName() : "Unknown Bank")
                        .branchName("Unknown Branch")
                        .ifscCode("UNKNOWN")
                        .user(user)
                        .build();
                beneficiaryRepository.save(beneficiary);
            }
        }
    }

    private String generateTransactionId() {
        return "TXN" + System.currentTimeMillis() + (int)(Math.random() * 1000);
    }
}
