package com.maverickbank.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDashboardResponse {
    private UserResponse user;
    private List<AccountResponse> accounts;
    private Long totalAccounts;
    private BigDecimal totalBalance;
    private List<TransactionResponse> recentTransactions;
    private List<LoanApplicationResponse> activeLoans;
}
