package com.maverickbank.strategy;

import com.maverickbank.entity.BankAccount;
import com.maverickbank.dto.request.TransactionRequest;
import com.maverickbank.entity.Transaction;

public interface TransactionStrategy {
    Transaction execute(BankAccount account, TransactionRequest request, Long userId);
}
