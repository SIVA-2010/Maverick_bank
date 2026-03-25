package com.maverickbank.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankBranchResponse {
    private Long id;
    private String bankName;
    private String branchName;
    private String ifscCode;
    private String address;
    private String city;
    private String state;
}
