package com.maverickbank.controller;

import com.maverickbank.dto.request.TransactionRequest;
import com.maverickbank.dto.response.ApiResponse;
import com.maverickbank.dto.response.TransactionResponse;
import com.maverickbank.dto.response.TransactionSummaryResponse;
import com.maverickbank.service.impl.TransactionServiceImpl;
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

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/customer/transactions")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Customer - Transactions", description = "Transaction operations for customers")
public class CustomerTransactionController {

    private final TransactionServiceImpl transactionService;
    private final UserServiceImpl userService;

    @PostMapping
    @Operation(summary = "Perform a transaction (deposit/withdrawal/transfer)")
    public ResponseEntity<ApiResponse<TransactionResponse>> performTransaction(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TransactionRequest request) {
        Long userId = userService.getUserIdByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(transactionService.performTransaction(userId, request), "Transaction successful"));
    }

    @GetMapping("/{accountNumber}/last10")
    @Operation(summary = "Get last 10 transactions")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getLast10(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String accountNumber) {
        Long userId = userService.getUserIdByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(transactionService.getLast10Transactions(userId, accountNumber)));
    }

    @GetMapping("/{accountNumber}/last-month")
    @Operation(summary = "Get last month transactions")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getLastMonth(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String accountNumber) {
        Long userId = userService.getUserIdByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(transactionService.getLastMonthTransactions(userId, accountNumber)));
    }

    @GetMapping("/{accountNumber}/by-date")
    @Operation(summary = "Get transactions between two dates")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getByDateRange(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String accountNumber,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        Long userId = userService.getUserIdByEmail(userDetails.getUsername());
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);
        return ResponseEntity.ok(ApiResponse.success(
                transactionService.getTransactionsBetweenDates(userId, accountNumber, start, end)));
    }

    @GetMapping("/{accountNumber}/summary")
    @Operation(summary = "Get transaction summary for an account")
    public ResponseEntity<ApiResponse<TransactionSummaryResponse>> getSummary(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String accountNumber) {
        Long userId = userService.getUserIdByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(transactionService.getAccountSummary(userId, accountNumber)));
    }
}
