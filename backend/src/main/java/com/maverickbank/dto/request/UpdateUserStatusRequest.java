package com.maverickbank.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserStatusRequest {

    @NotBlank
    private String status; // ACTIVE, INACTIVE, SUSPENDED
}
