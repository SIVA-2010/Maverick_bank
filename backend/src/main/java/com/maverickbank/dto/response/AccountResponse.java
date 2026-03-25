package com.maverickbank.dto.response;

import com.maverickbank.enums.AccountStatus;
import com.maverickbank.enums.AccountType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountResponse {
    private Long id;
    private String accountNumber;
    private AccountType accountType;
    private BigDecimal balance;
    private String ifscCode;
    private String branchName;
    private String branchAddress;
    private AccountStatus status;
    private String holderName;
    private LocalDateTime createdAt;
}
