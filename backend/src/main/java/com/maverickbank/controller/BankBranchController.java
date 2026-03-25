package com.maverickbank.controller;

import com.maverickbank.dto.response.ApiResponse;
import com.maverickbank.dto.response.BankBranchResponse;
import com.maverickbank.service.impl.BankBranchServiceImpl;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/banks")
@RequiredArgsConstructor
@Tag(name = "Bank Branches", description = "Bank and branch information (public)")
public class BankBranchController {

    private final BankBranchServiceImpl branchService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<String>>> getBankNames() {
        return ResponseEntity.ok(ApiResponse.success(branchService.getAllBankNames()));
    }

    @GetMapping("/{bankName}/branches")
    public ResponseEntity<ApiResponse<List<BankBranchResponse>>> getBranches(
            @PathVariable String bankName) {
        return ResponseEntity.ok(ApiResponse.success(branchService.getBranchesByBank(bankName)));
    }

    @GetMapping("/ifsc/{ifscCode}")
    public ResponseEntity<ApiResponse<BankBranchResponse>> getByIfsc(@PathVariable String ifscCode) {
        return ResponseEntity.ok(ApiResponse.success(branchService.getByIfscCode(ifscCode)));
    }
}
