package com.maverickbank.strategy.impl;

import com.maverickbank.dto.request.TransactionRequest;
import com.maverickbank.entity.BankAccount;
import com.maverickbank.entity.Transaction;
import com.maverickbank.enums.TransactionStatus;
import com.maverickbank.enums.TransactionType;
import com.maverickbank.exception.BadRequestException;
import com.maverickbank.repository.BankAccountRepository;
import com.maverickbank.repository.TransactionRepository;
import com.maverickbank.strategy.TransactionStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WithdrawalStrategy implements TransactionStrategy {

    private final BankAccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public Transaction execute(BankAccount account, TransactionRequest request, Long userId) {
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

    private String generateTransactionId() {
        return "TXN" + System.currentTimeMillis() + (int)(Math.random() * 1000);
    }
}
