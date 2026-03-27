package com.maverickbank.config;

import com.maverickbank.entity.BankBranch;
import com.maverickbank.entity.LoanProduct;
import com.maverickbank.entity.User;
import com.maverickbank.enums.LoanType;
import com.maverickbank.enums.UserRole;
import com.maverickbank.enums.UserStatus;
import com.maverickbank.repository.BankBranchRepository;
import com.maverickbank.repository.LoanProductRepository;
import com.maverickbank.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

        private final BankBranchRepository branchRepository;
        private final UserRepository userRepository;
        private final LoanProductRepository loanProductRepository;
        private final PasswordEncoder passwordEncoder;

        @Override
        @Transactional
        public void run(String... args) {
                // Seed Banks
                if (branchRepository.count() == 0) {
                        log.info("Seeding initial Bank Branches...");
                        branchRepository.saveAll(List.of(
                                        BankBranch.builder().bankName("Maverick Bank").branchName("Main Branch")
                                                        .ifscCode("MAVK0000001").address("123 Maverick St")
                                                        .city("New York").state("NY").build(),
                                        BankBranch.builder().bankName("Maverick Bank").branchName("Downtown")
                                                        .ifscCode("MAVK0000002").address("456 Downtown Ave")
                                                        .city("New York").state("NY").build(),
                                        BankBranch.builder().bankName("State Bank of India").branchName("Mumbai Main")
                                                        .ifscCode("SBIN0000001").address("Nariman Point").city("Mumbai")
                                                        .state("MH").build(),
                                        BankBranch.builder().bankName("HDFC Bank").branchName("Delhi Connaught Place")
                                                        .ifscCode("HDFC0000001").address("CP").city("Delhi").state("DL")
                                                        .build()));
                        log.info("Bank Branches seeded successfully.");
                }

                // Seed Admin and Employee
                if (!userRepository.existsByEmail("admin@maverickbank.com")) {
                        log.info("Seeding Admin user...");
                        userRepository.save(User.builder()
                                        .firstName("System").lastName("Admin").email("admin@maverickbank.com")
                                        .password(passwordEncoder.encode("admin123")).phoneNumber("0000000000")
                                        .address("HQ").gender("Other").dateOfBirth(LocalDate.of(1990, 1, 1))
                                        .aadharNumber("000000000000").panNumber("ADMIN0000X")
                                        .role(UserRole.ADMIN).status(UserStatus.ACTIVE)
                                        .build());
                }

                if (!userRepository.existsByEmail("employee@maverickbank.com")) {
                        log.info("Seeding Employee user...");
                        userRepository.save(User.builder()
                                        .firstName("Bank").lastName("Employee").email("employee@maverickbank.com")
                                        .password(passwordEncoder.encode("employee123")).phoneNumber("1111111111")
                                        .address("Branch").gender("Other").dateOfBirth(LocalDate.of(1995, 1, 1))
                                        .aadharNumber("111111111111").panNumber("EMPLY1111X")
                                        .role(UserRole.BANK_EMPLOYEE).status(UserStatus.ACTIVE)
                                        .build());
                }

                // Seed Loan Products
                if (loanProductRepository.count() == 0) {
                        log.info("Seeding initial Loan Products...");
                        loanProductRepository.saveAll(List.of(
                                        LoanProduct.builder().loanName("Standard Personal Loan")
                                                        .loanType(LoanType.PERSONAL)
                                                        .minimumAmount(new BigDecimal("10000"))
                                                        .maximumAmount(new BigDecimal("500000"))
                                                        .interestRate(new BigDecimal("12.5"))
                                                        .minTenureMonths(6).maxTenureMonths(60)
                                                        .description("Flexible personal loan for all your needs")
                                                        .isActive(true).build(),
                                        LoanProduct.builder().loanName("Dream Home Loan").loanType(LoanType.HOME)
                                                        .minimumAmount(new BigDecimal("500000"))
                                                        .maximumAmount(new BigDecimal("20000000"))
                                                        .interestRate(new BigDecimal("8.5"))
                                                        .minTenureMonths(60).maxTenureMonths(360)
                                                        .description("Affordable home loans with long tenures")
                                                        .isActive(true).build(),
                                        LoanProduct.builder().loanName("Drive Away Car Loan").loanType(LoanType.VEHICLE)
                                                        .minimumAmount(new BigDecimal("100000"))
                                                        .maximumAmount(new BigDecimal("3000000"))
                                                        .interestRate(new BigDecimal("9.5"))
                                                        .minTenureMonths(12).maxTenureMonths(84)
                                                        .description("Quick vehicle financing").isActive(true).build(),
                                        LoanProduct.builder().loanName("Startup Business Loan")
                                                        .loanType(LoanType.BUSINESS)
                                                        .minimumAmount(new BigDecimal("50000"))
                                                        .maximumAmount(new BigDecimal("10000000"))
                                                        .interestRate(new BigDecimal("14.0"))
                                                        .minTenureMonths(12).maxTenureMonths(120)
                                                        .description("Empower your business growth").isActive(true)
                                                        .build()));
                        log.info("Loan Products seeded successfully.");
                }
        }
}
