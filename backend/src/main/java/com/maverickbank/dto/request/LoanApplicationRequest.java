package com.maverickbank.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanApplicationRequest {

    @NotNull(message = "Loan product ID is required")
    private Long loanProductId;

    @NotNull(message = "Requested amount is required")
    @DecimalMin(value = "1000.00", message = "Minimum loan amount is 1000")
    private BigDecimal requestedAmount;

    @NotNull(message = "Tenure is required")
    @Min(value = 1, message = "Minimum tenure is 1 month")
    private Integer tenureMonths;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    @NotBlank(message = "Disbursement account number is required")
    private String disbursementAccountNumber;
}
