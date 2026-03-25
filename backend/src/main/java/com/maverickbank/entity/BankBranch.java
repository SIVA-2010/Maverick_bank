package com.maverickbank.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bank_branches")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BankBranch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String bankName;

    @Column(nullable = false)
    private String branchName;

    @Column(unique = true, nullable = false)
    private String ifscCode;

    private String address;
    private String city;
    private String state;
}
