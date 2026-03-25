package com.maverickbank.dto.response;

import com.maverickbank.enums.LoanApplicationStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanApplicationResponse {
    private Long id;
    private String applicationNumber;
    private BigDecimal requestedAmount;
    private Integer tenureMonths;
    private String purpose;
    private LoanApplicationStatus status;
    private String rejectionReason;
    private LocalDate approvedDate;
    private LocalDate disbursedDate;
    private LoanProductResponse loanProduct;
    private String applicantName;
    private String disbursementAccountNumber;
    private LocalDateTime createdAt;
}
