package com.maverickbank.controller;

import com.maverickbank.dto.request.BeneficiaryRequest;
import com.maverickbank.dto.response.ApiResponse;
import com.maverickbank.dto.response.BeneficiaryResponse;
import com.maverickbank.service.impl.BeneficiaryServiceImpl;
import com.maverickbank.service.impl.UserServiceImpl;
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
@RequestMapping("/api/v1/customer/beneficiaries")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Customer - Beneficiaries", description = "Beneficiary management")
public class CustomerBeneficiaryController {

    private final BeneficiaryServiceImpl beneficiaryService;
    private final UserServiceImpl userService;

    @PostMapping
    public ResponseEntity<ApiResponse<BeneficiaryResponse>> add(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BeneficiaryRequest request) {
        Long userId = userService.getUserIdByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(beneficiaryService.addBeneficiary(userId, request), "Beneficiary added"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BeneficiaryResponse>>> getAll(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userService.getUserIdByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(beneficiaryService.getBeneficiaries(userId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        Long userId = userService.getUserIdByEmail(userDetails.getUsername());
        beneficiaryService.deleteBeneficiary(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null, "Beneficiary removed"));
    }
}
