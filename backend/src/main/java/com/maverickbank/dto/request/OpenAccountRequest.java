package com.maverickbank.dto.request;

import com.maverickbank.enums.AccountType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpenAccountRequest {

    @NotNull(message = "Account type is required")
    private AccountType accountType;

    @NotBlank(message = "Branch name is required")
    private String branchName;

    @NotBlank(message = "IFSC code is required")
    private String ifscCode;

    @DecimalMin(value = "500.00", message = "Minimum initial deposit is 500")
    private BigDecimal initialDeposit;
}
