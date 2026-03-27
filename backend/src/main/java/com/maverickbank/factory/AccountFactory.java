package com.maverickbank.factory;

import com.maverickbank.entity.BankAccount;
import com.maverickbank.entity.User;
import com.maverickbank.enums.AccountStatus;
import com.maverickbank.enums.AccountType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Factory Pattern implementation for creating different types of Bank Accounts.
 */
@Component
public class AccountFactory {

    public BankAccount createAccount(AccountType type, User user, String accountNumber) {
        BankAccount account = new BankAccount();
        account.setUser(user);
        account.setAccountNumber(accountNumber);
        account.setAccountType(type);
        account.setStatus(AccountStatus.PENDING);

        switch (type) {
            case SAVINGS:
                account.setBalance(BigDecimal.valueOf(500.00)); // Initial minimum balance for savings
                break;
            case CHECKING:
                account.setBalance(BigDecimal.valueOf(1000.00)); // Initial minimum balance for checking
                break;
            default:
                account.setBalance(BigDecimal.ZERO);
        }

        return account;
    }
}
