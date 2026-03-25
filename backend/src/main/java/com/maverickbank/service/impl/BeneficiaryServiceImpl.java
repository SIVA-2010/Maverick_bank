package com.maverickbank.service.impl;

import com.maverickbank.dto.request.BeneficiaryRequest;
import com.maverickbank.dto.response.BeneficiaryResponse;
import com.maverickbank.entity.Beneficiary;
import com.maverickbank.entity.User;
import com.maverickbank.exception.BadRequestException;
import com.maverickbank.exception.ConflictException;
import com.maverickbank.exception.NotFoundException;
import com.maverickbank.repository.BeneficiaryRepository;
import com.maverickbank.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BeneficiaryServiceImpl {

    private final BeneficiaryRepository beneficiaryRepository;
    private final UserRepository userRepository;

    @Transactional
    public BeneficiaryResponse addBeneficiary(Long userId, BeneficiaryRequest request) {
        if (beneficiaryRepository.existsByUserIdAndAccountNumber(userId, request.getAccountNumber())) {
            throw new ConflictException("Beneficiary with this account number already exists");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Beneficiary beneficiary = Beneficiary.builder()
                .accountHolderName(request.getAccountHolderName())
                .accountNumber(request.getAccountNumber())
                .bankName(request.getBankName())
                .branchName(request.getBranchName())
                .ifscCode(request.getIfscCode())
                .isActive(true)
                .user(user)
                .build();

        return mapToResponse(beneficiaryRepository.save(beneficiary));
    }

    @Transactional(readOnly = true)
    public List<BeneficiaryResponse> getBeneficiaries(Long userId) {
        return beneficiaryRepository.findByUserIdAndIsActiveTrue(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteBeneficiary(Long userId, Long beneficiaryId) {
        Beneficiary b = beneficiaryRepository.findById(beneficiaryId)
                .orElseThrow(() -> new NotFoundException("Beneficiary not found"));
        if (!b.getUser().getId().equals(userId)) {
            throw new BadRequestException("Beneficiary does not belong to this user");
        }
        b.setIsActive(false);
        beneficiaryRepository.save(b);
    }

    private BeneficiaryResponse mapToResponse(Beneficiary b) {
        return BeneficiaryResponse.builder()
                .id(b.getId())
                .accountHolderName(b.getAccountHolderName())
                .accountNumber(b.getAccountNumber())
                .bankName(b.getBankName())
                .branchName(b.getBranchName())
                .ifscCode(b.getIfscCode())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
