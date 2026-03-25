package com.maverickbank.controller;

import com.maverickbank.dto.request.OpenAccountRequest;
import com.maverickbank.dto.response.AccountResponse;
import com.maverickbank.dto.response.ApiResponse;
import com.maverickbank.service.impl.AccountServiceImpl;
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
@RequestMapping("/api/v1/customer/accounts")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Customer - Accounts", description = "Account management for customers")
public class CustomerAccountController {

    private final AccountServiceImpl accountService;
    private final UserServiceImpl userService;

    @PostMapping("/open")
    @Operation(summary = "Open a new bank account")
    public ResponseEntity<ApiResponse<AccountResponse>> openAccount(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OpenAccountRequest request) {
        Long userId = userService.getUserIdByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(accountService.openAccount(userId, request), "Account opened successfully, pending approval"));
    }

    @GetMapping
    @Operation(summary = "Get all accounts for logged-in customer")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getMyAccounts(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userService.getUserIdByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(accountService.getCustomerAccounts(userId)));
    }

    @GetMapping("/{accountNumber}")
    @Operation(summary = "Get account details by account number")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccountDetails(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String accountNumber) {
        Long userId = userService.getUserIdByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(accountService.getAccountDetails(userId, accountNumber)));
    }

    @PostMapping("/{accountNumber}/close-request")
    @Operation(summary = "Request account closure")
    public ResponseEntity<ApiResponse<Void>> requestClosure(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String accountNumber) {
        Long userId = userService.getUserIdByEmail(userDetails.getUsername());
        accountService.requestAccountClosure(userId, accountNumber);
        return ResponseEntity.ok(ApiResponse.success(null, "Account closure request submitted"));
    }
}
