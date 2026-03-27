package com.maverickbank.strategy;

import com.maverickbank.enums.TransactionType;
import com.maverickbank.exception.BadRequestException;
import com.maverickbank.strategy.impl.DepositStrategy;
import com.maverickbank.strategy.impl.TransferStrategy;
import com.maverickbank.strategy.impl.WithdrawalStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TransactionStrategyFactory {

    private final DepositStrategy depositStrategy;
    private final WithdrawalStrategy withdrawalStrategy;
    private final TransferStrategy transferStrategy;

    public TransactionStrategy getStrategy(TransactionType type) {
        return switch (type) {
            case DEPOSIT -> depositStrategy;
            case WITHDRAWAL -> withdrawalStrategy;
            case TRANSFER -> transferStrategy;
            default -> throw new BadRequestException("Invalid transaction type: " + type);
        };
    }
}
