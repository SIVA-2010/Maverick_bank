package com.maverickbank.controller;

import com.maverickbank.dto.request.CreateEmployeeRequest;
import com.maverickbank.dto.request.UpdateUserStatusRequest;
import com.maverickbank.dto.response.ApiResponse;
import com.maverickbank.dto.response.UserResponse;
import com.maverickbank.service.impl.UserServiceImpl;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Admin", description = "Administrator operations")
public class AdminController {

    private final UserServiceImpl userService;

    @PostMapping("/employees")
    public ResponseEntity<ApiResponse<UserResponse>> createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.createEmployee(request), "Employee created"));
    }

    @GetMapping("/employees")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getEmployees() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllEmployees()));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getCustomers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllCustomers()));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateStatus(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateUserStatus(userId, request)));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable Long userId) {
        userService.deactivateUser(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "User deactivated"));
    }
}
