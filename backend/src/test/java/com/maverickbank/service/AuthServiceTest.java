package com.maverickbank.service;

import com.maverickbank.dto.request.LoginRequest;
import com.maverickbank.dto.request.RegisterRequest;
import com.maverickbank.dto.response.AuthResponse;
import com.maverickbank.entity.User;
import com.maverickbank.enums.UserRole;
import com.maverickbank.enums.UserStatus;
import com.maverickbank.exception.ConflictException;
import com.maverickbank.exception.UnauthorizedException;
import com.maverickbank.repository.UserRepository;
import com.maverickbank.security.JwtTokenProvider;
import com.maverickbank.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks private AuthServiceImpl authService;

    private RegisterRequest validRegisterRequest;
    private User mockUser;

    @BeforeEach
    void setUp() {
        validRegisterRequest = RegisterRequest.builder()
                .firstName("John").lastName("Doe")
                .email("john.doe@example.com").password("Test@1234")
                .phoneNumber("9876543210").dateOfBirth(LocalDate.of(1990, 1, 1))
                .aadharNumber("123456789012").panNumber("ABCDE1234F")
                .build();

        mockUser = User.builder()
                .id(1L).firstName("John").lastName("Doe")
                .email("john.doe@example.com").password("encodedPassword")
                .role(UserRole.CUSTOMER).status(UserStatus.ACTIVE)
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .build();
    }

    @Test
    void register_Success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(jwtTokenProvider.generateToken(anyString(), anyString(), anyLong())).thenReturn("access_token");
        when(jwtTokenProvider.generateRefreshToken(anyString())).thenReturn("refresh_token");

        AuthResponse response = authService.register(validRegisterRequest);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("access_token");
        assertThat(response.getUser().getEmail()).isEqualTo("john.doe@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_DuplicateEmail_ThrowsConflictException() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(validRegisterRequest))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Email already registered");
    }

    @Test
    void login_Success() {
        when(authenticationManager.authenticate(any())).thenReturn(mock(org.springframework.security.core.Authentication.class));
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
        when(jwtTokenProvider.generateToken(anyString(), anyString(), anyLong())).thenReturn("access_token");
        when(jwtTokenProvider.generateRefreshToken(anyString())).thenReturn("refresh_token");

        AuthResponse response = authService.login(new LoginRequest("john.doe@example.com", "Test@1234"));

        assertThat(response.getAccessToken()).isEqualTo("access_token");
        assertThat(response.getUser().getRole()).isEqualTo(UserRole.CUSTOMER);
    }

    @Test
    void login_BadCredentials_ThrowsUnauthorizedException() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("bad@email.com", "wrong")))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void login_InactiveUser_ThrowsUnauthorizedException() {
        mockUser.setStatus(UserStatus.INACTIVE);
        when(authenticationManager.authenticate(any())).thenReturn(mock(org.springframework.security.core.Authentication.class));
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));

        assertThatThrownBy(() -> authService.login(new LoginRequest("john.doe@example.com", "Test@1234")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("inactive");
    }
}
