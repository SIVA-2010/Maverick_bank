package com.maverickbank.controller;

import com.maverickbank.dto.request.LoanDecisionRequest;
import com.maverickbank.dto.response.AccountResponse;
import com.maverickbank.dto.response.ApiResponse;
import com.maverickbank.dto.response.LoanApplicationResponse;
import com.maverickbank.dto.response.TransactionResponse;
import com.maverickbank.dto.response.UserResponse;
import com.maverickbank.service.impl.AccountServiceImpl;
import com.maverickbank.service.impl.LoanServiceImpl;
import com.maverickbank.service.impl.UserServiceImpl;
import com.maverickbank.service.impl.TransactionServiceImpl;
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
@RequestMapping("/api/v1/employee")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Bank Employee", description = "Employee operations")
public class EmployeeController {

    private final AccountServiceImpl accountService;
    private final LoanServiceImpl loanService;
    private final UserServiceImpl userService;
    private final TransactionServiceImpl transactionService;

    @GetMapping("/accounts/pending")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getPendingAccounts() {
        return ResponseEntity.ok(ApiResponse.success(accountService.getPendingAccounts()));
    }

    @GetMapping("/accounts/close-requests")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getCloseRequests() {
        return ResponseEntity.ok(ApiResponse.success(accountService.getCloseRequestedAccounts()));
    }

    @PutMapping("/accounts/{accountId}/approve")
    public ResponseEntity<ApiResponse<AccountResponse>> approveAccount(@PathVariable Long accountId) {
        return ResponseEntity.ok(ApiResponse.success(accountService.approveAccount(accountId), "Account approved"));
    }

    @PutMapping("/accounts/{accountId}/close")
    public ResponseEntity<ApiResponse<AccountResponse>> closeAccount(@PathVariable Long accountId) {
        return ResponseEntity.ok(ApiResponse.success(accountService.closeAccount(accountId), "Account closed"));
    }

    @GetMapping("/loans/pending")
    public ResponseEntity<ApiResponse<List<LoanApplicationResponse>>> getPendingLoans() {
        return ResponseEntity.ok(ApiResponse.success(loanService.getPendingApplications()));
    }

    @PostMapping("/loans/decision")
    public ResponseEntity<ApiResponse<LoanApplicationResponse>> loanDecision(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody LoanDecisionRequest request) {
        Long employeeId = userService.getUserIdByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(loanService.processLoanDecision(employeeId, request)));
    }

    @PostMapping("/loans/{applicationId}/disburse")
    public ResponseEntity<ApiResponse<LoanApplicationResponse>> disburse(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long applicationId) {
        Long employeeId = userService.getUserIdByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(loanService.disburseLoan(employeeId, applicationId), "Loan disbursed"));
    }

    @GetMapping("/reports/transactions")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllTransactions(page, size)));
    }

    @GetMapping("/reports/customers")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllCustomers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllCustomers()));
    }
}
