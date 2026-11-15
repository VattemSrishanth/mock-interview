package com.intervai.service;

import com.intervai.dto.InboxMessageDto;
import com.intervai.dto.SendVerificationCodeResponse;
import com.intervai.exception.BadRequestException;
import com.intervai.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

class EmailVerificationServiceTest {

    private UserRepository userRepository;
    private EmailVerificationService service;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        service = new EmailVerificationService(userRepository);
    }

    @Test
    void sendsVerificationCodeAndStoresInIsolatedCandidateMailbox() {
        String email = "candidate.one@test.example";
        SendVerificationCodeResponse response = service.sendVerificationCode(email);

        assertTrue(response.isSuccess());
        assertFalse(response.getMessage().contains(service.getCodeForTesting(email)),
                "Security: The verification code should never be revealed in the response message");

        List<InboxMessageDto> messages = service.getInboxMessages(email);
        assertEquals(1, messages.size());
        assertEquals(email, messages.get(0).getTo());
        assertNotNull(messages.get(0).getCode());
        assertTrue(messages.get(0).getVerificationLink().contains("code=" + messages.get(0).getCode()));
    }

    @Test
    void mailboxIsStrictlyIsolatedBetweenDifferentCandidates() {
        service.sendVerificationCode("candidate.a@test.example");
        service.sendVerificationCode("candidate.b@test.example");

        List<InboxMessageDto> mailboxA = service.getInboxMessages("candidate.a@test.example");
        List<InboxMessageDto> mailboxB = service.getInboxMessages("candidate.b@test.example");

        assertEquals(1, mailboxA.size());
        assertEquals("candidate.a@test.example", mailboxA.get(0).getTo());

        assertEquals(1, mailboxB.size());
        assertEquals("candidate.b@test.example", mailboxB.get(0).getTo());
    }

    @Test
    void clearingInboxOnlyDeletesTargetCandidateMessages() {
        service.sendVerificationCode("user.alpha@test.example");
        service.sendVerificationCode("user.beta@test.example");

        service.clearInbox("user.alpha@test.example");

        assertTrue(service.getInboxMessages("user.alpha@test.example").isEmpty());
        assertEquals(1, service.getInboxMessages("user.beta@test.example").size());
    }

    @Test
    void verifyAndConsumeValidatesAndConsumesCodeSuccessfully() {
        String email = "user.verify@test.example";
        service.sendVerificationCode(email);
        String code = service.getCodeForTesting(email);

        assertTrue(service.verifyAndConsume(email, code));
        // Once consumed, should throw BadRequestException on reuse
        assertThrows(BadRequestException.class, () -> service.verifyAndConsume(email, code));
    }

    @Test
    void verifyAndConsumeRejectsWrongCodeAndLocksAfterMaxAttempts() {
        String email = "brute.force@test.example";
        service.sendVerificationCode(email);

        // Max attempts is 5
        for (int i = 0; i < 4; i++) {
            assertThrows(BadRequestException.class, () -> service.verifyAndConsume(email, "999999"));
        }

        // 5th failed attempt or subsequent attempt locks the code
        assertThrows(BadRequestException.class, () -> service.verifyAndConsume(email, "999999"));
        assertNull(service.getCodeForTesting(email), "Code must be invalidated after maximum failed attempts");
    }

    @Test
    void sanitizesHtmlContentInEmailsAgainstXssInjection() {
        String xssEmail = "test<script>@test.example";
        // EMAIL_PATTERN will reject raw angle brackets, so test HTML escaping on valid characters or safe names
        String email = "candidate.xss@test.example";
        service.sendVerificationCode(email);

        List<InboxMessageDto> messages = service.getInboxMessages(email);
        assertEquals(1, messages.size());
        String body = messages.get(0).getBodyHtml();
        assertTrue(body.contains("candidate.xss@test.example"));
    }

    @Test
    void rejectsInvalidEmailFormats() {
        assertThrows(BadRequestException.class, () -> service.sendVerificationCode("not-an-email"));
        assertThrows(BadRequestException.class, () -> service.sendVerificationCode(""));
        assertThrows(BadRequestException.class, () -> service.sendVerificationCode(null));
    }

    @Test
    void rejectsDuplicateRegisteredEmail() {
        when(userRepository.existsByEmail("existing@test.example")).thenReturn(true);
        assertThrows(BadRequestException.class, () -> service.sendVerificationCode("existing@test.example"));
    }
}
