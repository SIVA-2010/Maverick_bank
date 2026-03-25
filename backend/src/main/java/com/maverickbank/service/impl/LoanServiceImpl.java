package com.maverickbank.service.impl;

import com.maverickbank.dto.request.LoanApplicationRequest;
import com.maverickbank.dto.request.LoanDecisionRequest;
import com.maverickbank.dto.response.*;
import com.maverickbank.entity.*;
import com.maverickbank.enums.*;
import com.maverickbank.exception.*;
import com.maverickbank.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoanServiceImpl {

    private final LoanApplicationRepository loanApplicationRepository;
    private final LoanProductRepository loanProductRepository;
    private final BankAccountRepository accountRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public List<LoanProductResponse> getAllLoanProducts() {
        return loanProductRepository.findByIsActiveTrue()
                .stream().map(this::mapProductToResponse).collect(Collectors.toList());
    }

    @Transactional
    public LoanApplicationResponse applyForLoan(Long userId, LoanApplicationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        LoanProduct product = loanProductRepository.findById(request.getLoanProductId())
                .orElseThrow(() -> new NotFoundException("Loan product not found"));

        // Validate amount range
        if (request.getRequestedAmount().compareTo(product.getMinimumAmount()) < 0 ||
                request.getRequestedAmount().compareTo(product.getMaximumAmount()) > 0) {
            throw new BadRequestException(String.format("Amount must be between %s and %s",
                    product.getMinimumAmount(), product.getMaximumAmount()));
        }

        // Validate tenure range
        if (request.getTenureMonths() < product.getMinTenureMonths() ||
                request.getTenureMonths() > product.getMaxTenureMonths()) {
            throw new BadRequestException(String.format("Tenure must be between %d and %d months",
                    product.getMinTenureMonths(), product.getMaxTenureMonths()));
        }

        // Check existing pending application
        if (loanApplicationRepository.existsByUserIdAndLoanProductIdAndStatusIn(
                userId, product.getId(),
                List.of(LoanApplicationStatus.PENDING, LoanApplicationStatus.UNDER_REVIEW, LoanApplicationStatus.APPROVED))) {
            throw new ConflictException("You already have an active application for this loan product");
        }

        BankAccount disbursementAccount = accountRepository.findByAccountNumber(request.getDisbursementAccountNumber())
                .orElseThrow(() -> new NotFoundException("Disbursement account not found"));

        if (!disbursementAccount.getUser().getId().equals(userId)) {
            throw new BadRequestException("Disbursement account does not belong to this user");
        }

        LoanApplication application = LoanApplication.builder()
                .applicationNumber("LOAN" + System.currentTimeMillis())
                .requestedAmount(request.getRequestedAmount())
                .tenureMonths(request.getTenureMonths())
                .purpose(request.getPurpose())
                .status(LoanApplicationStatus.PENDING)
                .user(user)
                .loanProduct(product)
                .disbursementAccount(disbursementAccount)
                .build();

        application = loanApplicationRepository.save(application);
        log.info("Loan application submitted: {}", application.getApplicationNumber());
        return mapApplicationToResponse(application);
    }

    @Transactional(readOnly = true)
    public List<LoanApplicationResponse> getCustomerLoans(Long userId) {
        return loanApplicationRepository.findByUserId(userId)
                .stream().map(this::mapApplicationToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LoanApplicationResponse> getPendingApplications() {
        return loanApplicationRepository.findByStatus(LoanApplicationStatus.PENDING)
                .stream().map(this::mapApplicationToResponse).collect(Collectors.toList());
    }

    @Transactional
    public LoanApplicationResponse processLoanDecision(Long employeeId, LoanDecisionRequest request) {
        LoanApplication application = loanApplicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new NotFoundException("Loan application not found"));

        if (application.getStatus() != LoanApplicationStatus.PENDING &&
                application.getStatus() != LoanApplicationStatus.UNDER_REVIEW) {
            throw new BadRequestException("Application is not in a reviewable state");
        }

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new NotFoundException("Employee not found"));

        application.setReviewedBy(employee);

        if ("APPROVED".equalsIgnoreCase(request.getDecision())) {
            application.setStatus(LoanApplicationStatus.APPROVED);
            application.setApprovedDate(LocalDate.now());
        } else if ("REJECTED".equalsIgnoreCase(request.getDecision())) {
            application.setStatus(LoanApplicationStatus.REJECTED);
            application.setRejectionReason(request.getRejectionReason());
        } else {
            throw new BadRequestException("Decision must be APPROVED or REJECTED");
        }

        return mapApplicationToResponse(loanApplicationRepository.save(application));
    }

    @Transactional
    public LoanApplicationResponse disburseLoan(Long employeeId, Long applicationId) {
        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("Loan application not found"));

        if (application.getStatus() != LoanApplicationStatus.APPROVED) {
            throw new BadRequestException("Only approved loans can be disbursed");
        }

        BankAccount account = application.getDisbursementAccount();
        account.setBalance(account.getBalance().add(application.getRequestedAmount()));
        accountRepository.save(account);

        Transaction tx = Transaction.builder()
                .transactionId("LOAN_DISB_" + System.currentTimeMillis())
                .type(TransactionType.LOAN_DISBURSEMENT)
                .amount(application.getRequestedAmount())
                .balanceAfter(account.getBalance())
                .description("Loan disbursement - " + application.getApplicationNumber())
                .status(TransactionStatus.SUCCESS)
                .account(account)
                .build();
        transactionRepository.save(tx);

        application.setStatus(LoanApplicationStatus.DISBURSED);
        application.setDisbursedDate(LocalDate.now());

        log.info("Loan disbursed: {} - Amount: {}", application.getApplicationNumber(), application.getRequestedAmount());
        return mapApplicationToResponse(loanApplicationRepository.save(application));
    }

    private LoanProductResponse mapProductToResponse(LoanProduct p) {
        return LoanProductResponse.builder()
                .id(p.getId()).loanName(p.getLoanName()).loanType(p.getLoanType())
                .minimumAmount(p.getMinimumAmount()).maximumAmount(p.getMaximumAmount())
                .interestRate(p.getInterestRate()).minTenureMonths(p.getMinTenureMonths())
                .maxTenureMonths(p.getMaxTenureMonths()).description(p.getDescription())
                .build();
    }

    private LoanApplicationResponse mapApplicationToResponse(LoanApplication a) {
        return LoanApplicationResponse.builder()
                .id(a.getId()).applicationNumber(a.getApplicationNumber())
                .requestedAmount(a.getRequestedAmount()).tenureMonths(a.getTenureMonths())
                .purpose(a.getPurpose()).status(a.getStatus())
                .rejectionReason(a.getRejectionReason()).approvedDate(a.getApprovedDate())
                .disbursedDate(a.getDisbursedDate()).loanProduct(mapProductToResponse(a.getLoanProduct()))
                .applicantName(a.getUser().getFirstName() + " " + a.getUser().getLastName())
                .disbursementAccountNumber(a.getDisbursementAccount() != null ?
                        a.getDisbursementAccount().getAccountNumber() : null)
                .createdAt(a.getCreatedAt())
                .build();
    }
}
