package com.maverickbank.dto.request;

import com.maverickbank.enums.TransactionType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionRequest {

    @NotNull(message = "Transaction type is required")
    private TransactionType type;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.00", message = "Minimum transaction amount is 1")
    @DecimalMax(value = "1000000.00", message = "Maximum transaction amount is 10,00,000")
    private BigDecimal amount;

    @NotBlank(message = "Account number is required")
    private String accountNumber;

    // For transfers
    private String destinationAccountNumber;
    private String destinationBankName;
    private String description;
    private Boolean saveBeneficiary;
}
