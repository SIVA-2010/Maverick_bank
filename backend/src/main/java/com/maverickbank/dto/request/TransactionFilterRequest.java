package com.maverickbank.dto.request;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionFilterRequest {

    private String filter; // LAST_10, LAST_MONTH, DATE_RANGE
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
