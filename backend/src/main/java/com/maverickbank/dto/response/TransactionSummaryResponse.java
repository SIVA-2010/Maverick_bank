package com.maverickbank.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionSummaryResponse {
    private List<TransactionResponse> transactions;
    private BigDecimal totalInbound;
    private BigDecimal totalOutbound;
    private Long totalCount;
}
