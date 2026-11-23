package com.intervai.service;

import com.intervai.dto.SendVerificationCodeResponse;
import com.intervai.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmailVerificationServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private EmailVerificationService emailVerificationService;

    @BeforeEach
    void setUp() {
        emailVerificationService.clearAllForTesting();
    }

    @Test
    @DisplayName("Should accept valid consumer email domains without blocking")
    void shouldAcceptTrustedDomains() {
        when(userRepository.existsByEmailIgnoreCase(anyString())).thenReturn(false);
        SendVerificationCodeResponse response = emailVerificationService.sendVerificationCode("candidate@gmail.com");
        assertNotNull(response);
        assertTrue(response.isSuccess());
    }
}
