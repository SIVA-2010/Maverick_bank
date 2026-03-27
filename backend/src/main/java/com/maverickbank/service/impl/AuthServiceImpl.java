package com.maverickbank.service.impl;

import com.maverickbank.dto.request.LoginRequest;
import com.maverickbank.dto.request.RegisterRequest;
import com.maverickbank.dto.response.AuthResponse;
import com.maverickbank.dto.response.UserResponse;
import com.maverickbank.entity.User;
import com.maverickbank.enums.UserRole;
import com.maverickbank.enums.UserStatus;
import com.maverickbank.exception.ConflictException;
import com.maverickbank.exception.UnauthorizedException;
import com.maverickbank.repository.UserRepository;
import com.maverickbank.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .aadharNumber(request.getAadharNumber())
                .panNumber(request.getPanNumber())
                .role(UserRole.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);
        log.info("New customer registered: {}", user.getEmail());

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        return buildAuthResponse(user, token, refreshToken);
    }

    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UnauthorizedException("Account is " + user.getStatus().name().toLowerCase());
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        log.info("User logged in: {}", user.getEmail());
        return buildAuthResponse(user, token, refreshToken);
    }

    private AuthResponse buildAuthResponse(User user, String token, String refreshToken) {
        int age = user.getDateOfBirth() != null
                ? Period.between(user.getDateOfBirth(), LocalDate.now()).getYears()
                : 0;

        UserResponse userResponse = UserResponse.builder()
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

        return AuthResponse.builder()
                .accessToken(token)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .user(userResponse)
                .build();
    }
}
