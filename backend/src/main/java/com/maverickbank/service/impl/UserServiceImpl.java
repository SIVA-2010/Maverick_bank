package com.maverickbank.service.impl;

import com.maverickbank.dto.request.CreateEmployeeRequest;
import com.maverickbank.dto.request.UpdateUserStatusRequest;
import com.maverickbank.dto.response.TransactionResponse;
import com.maverickbank.dto.response.UserResponse;
import com.maverickbank.entity.User;
import com.maverickbank.enums.UserRole;
import com.maverickbank.enums.UserStatus;
import com.maverickbank.exception.ConflictException;
import com.maverickbank.exception.NotFoundException;
import com.maverickbank.repository.TransactionRepository;
import com.maverickbank.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TransactionRepository transactionRepository;

    public Long getUserIdByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found: " + email))
                .getId();
    }

    @Transactional
    public UserResponse createEmployee(CreateEmployeeRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already exists");
        }
        User employee = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .role(UserRole.BANK_EMPLOYEE)
                .status(UserStatus.ACTIVE)
                .build();
        return mapToResponse(userRepository.save(employee));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllCustomers() {
        return userRepository.findByRole(UserRole.CUSTOMER)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllEmployees() {
        return userRepository.findByRole(UserRole.BANK_EMPLOYEE)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public UserResponse updateUserStatus(Long userId, UpdateUserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        user.setStatus(UserStatus.valueOf(request.getStatus()));
        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public void deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions(int page, int size) {
        return transactionRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .getContent()
                .stream()
                .map(tx -> TransactionResponse.builder()
                        .id(tx.getId())
                        .transactionId(tx.getTransactionId())
                        .type(tx.getType())
                        .amount(tx.getAmount())
                        .balanceAfter(tx.getBalanceAfter())
                        .description(tx.getDescription())
                        .destinationAccountNumber(tx.getDestinationAccountNumber())
                        .status(tx.getStatus())
                        .accountNumber(tx.getAccount().getAccountNumber())
                        .createdAt(tx.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public UserResponse mapToResponse(User user) {
        int age = user.getDateOfBirth() != null
                ? Period.between(user.getDateOfBirth(), LocalDate.now()).getYears()
                : 0;
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .gender(user.getGender())
                .dateOfBirth(user.getDateOfBirth())
                .age(age)
                .aadharNumber(user.getAadharNumber())
                .panNumber(user.getPanNumber())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
