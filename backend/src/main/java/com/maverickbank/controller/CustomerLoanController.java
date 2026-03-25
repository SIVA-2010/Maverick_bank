package com.maverickbank.controller;

import com.maverickbank.dto.request.LoanApplicationRequest;
import com.maverickbank.dto.response.ApiResponse;
import com.maverickbank.dto.response.LoanApplicationResponse;
import com.maverickbank.dto.response.LoanProductResponse;
import com.maverickbank.service.impl.LoanServiceImpl;
import com.maverickbank.service.impl.UserServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customer/loans")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Customer - Loans", description = "Loan operations for customers")
public class CustomerLoanController {

    private final LoanServiceImpl loanService;
    private final UserServiceImpl userService;

    @GetMapping("/products")
    @Operation(summary = "Get all available loan products")
    public ResponseEntity<ApiResponse<List<LoanProductResponse>>> getProducts() {
        return ResponseEntity.ok(ApiResponse.success(loanService.getAllLoanProducts()));
    }

    @PostMapping("/apply")
    @Operation(summary = "Apply for a loan")
    public ResponseEntity<ApiResponse<LoanApplicationResponse>> apply(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody LoanApplicationRequest request) {
        Long userId = userService.getUserIdByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(loanService.applyForLoan(userId, request), "Loan application submitted"));
    }

    @GetMapping("/my-loans")
    @Operation(summary = "Get all loan applications for logged-in customer")
    public ResponseEntity<ApiResponse<List<LoanApplicationResponse>>> getMyLoans(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userService.getUserIdByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(loanService.getCustomerLoans(userId)));
    }
}
