package com.maverickbank.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanDecisionRequest {

    @NotNull
    private Long applicationId;

    @NotBlank
    private String decision; // APPROVED or REJECTED

    private String rejectionReason;
    private String disbursementAccountNumber;
}
