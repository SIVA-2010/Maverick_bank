package com.maverickbank.dto.response;

import com.maverickbank.enums.TransactionStatus;
import com.maverickbank.enums.TransactionType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponse {
    private Long id;
    private String transactionId;
    private TransactionType type;
    private BigDecimal amount;
    private BigDecimal balanceAfter;
    private String description;
    private String destinationAccountNumber;
    private String destinationBankName;
    private TransactionStatus status;
    private String accountNumber;
    private LocalDateTime createdAt;
}
