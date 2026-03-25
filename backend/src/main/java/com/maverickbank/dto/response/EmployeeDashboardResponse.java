package com.maverickbank.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDashboardResponse {
    private Long pendingAccountApprovals;
    private Long pendingLoanApplications;
    private Long totalCustomers;
    private Long totalTransactionsToday;
    private BigDecimal totalTransactionVolumeToday;
}
