package com.maverickbank.dto.response;

import com.maverickbank.enums.LoanType;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanProductResponse {
    private Long id;
    private String loanName;
    private LoanType loanType;
    private BigDecimal minimumAmount;
    private BigDecimal maximumAmount;
    private BigDecimal interestRate;
    private Integer minTenureMonths;
    private Integer maxTenureMonths;
    private String description;
}
