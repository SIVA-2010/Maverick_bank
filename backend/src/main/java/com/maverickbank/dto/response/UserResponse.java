package com.maverickbank.dto.response;

import com.maverickbank.enums.UserRole;
import com.maverickbank.enums.UserStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String address;
    private String gender;
    private LocalDate dateOfBirth;
    private Integer age;
    private String aadharNumber;
    private String panNumber;
    private UserRole role;
    private UserStatus status;
    private LocalDateTime createdAt;
}
