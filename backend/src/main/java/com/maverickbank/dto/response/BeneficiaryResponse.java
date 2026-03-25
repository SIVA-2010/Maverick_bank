package com.maverickbank.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BeneficiaryResponse {
    private Long id;
    private String accountHolderName;
    private String accountNumber;
    private String bankName;
    private String branchName;
    private String ifscCode;
    private LocalDateTime createdAt;
}
