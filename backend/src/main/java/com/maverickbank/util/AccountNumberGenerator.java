package com.maverickbank.util;

import com.maverickbank.repository.BankAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
@RequiredArgsConstructor
public class AccountNumberGenerator {

    private final BankAccountRepository accountRepository;
    private static final Random RANDOM = new Random();

    public String generate() {
        String accountNumber;
        do {
            accountNumber = String.format("%016d", (long)(RANDOM.nextDouble() * 9_999_999_999_999_999L));
        } while (accountRepository.existsByAccountNumber(accountNumber));
        return accountNumber;
    }
}
