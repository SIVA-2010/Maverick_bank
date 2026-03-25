package com.maverickbank.service.impl;

import com.maverickbank.dto.response.BankBranchResponse;
import com.maverickbank.entity.BankBranch;
import com.maverickbank.exception.NotFoundException;
import com.maverickbank.repository.BankBranchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BankBranchServiceImpl {

    private final BankBranchRepository branchRepository;

    public List<String> getAllBankNames() {
        return branchRepository.findAllDistinctBankNames();
    }

    public List<BankBranchResponse> getBranchesByBank(String bankName) {
        return branchRepository.findByBankNameIgnoreCase(bankName)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public BankBranchResponse getByIfscCode(String ifscCode) {
        return branchRepository.findByIfscCode(ifscCode)
                .map(this::mapToResponse)
                .orElseThrow(() -> new NotFoundException("Branch not found for IFSC: " + ifscCode));
    }

    private BankBranchResponse mapToResponse(BankBranch b) {
        return BankBranchResponse.builder()
                .id(b.getId()).bankName(b.getBankName()).branchName(b.getBranchName())
                .ifscCode(b.getIfscCode()).address(b.getAddress())
                .city(b.getCity()).state(b.getState())
                .build();
    }
}
