package com.intervai.service;

import com.intervai.dto.InterviewResultDto;
import com.intervai.dto.ShareInterviewResponse;
import com.intervai.entity.Interview;
import com.intervai.entity.User;
import com.intervai.exception.BadRequestException;
import com.intervai.exception.ResourceNotFoundException;
import com.intervai.repository.InterviewRepository;
import com.intervai.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
public class ShareInterviewIntegrationTest {

    @Autowired
    private InterviewService interviewService;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private Interview completedInterview;
    private Interview createdInterview;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(User.builder()
                .name("Test Candidate")
                .email("candidate_share_test@example.com")
                .password("encoded_pass")
                .targetRole("Frontend Developer")
                .experience("Mid-level")
                .build());

        completedInterview = interviewRepository.save(Interview.builder()
                .user(testUser)
                .jobRole("Frontend Developer")
                .experience("Mid-level")
                .interviewType("Technical")
                .difficulty("Medium")
                .numberOfQuestions(3)
                .interviewMode("Text")
                .status("COMPLETED")
                .overallScore(85)
                .technicalKnowledgeScore(88)
                .communicationScore(82)
                .relevanceScore(85)
                .clarityScore(84)
                .confidenceScore(86)
                .summaryFeedback("Solid grasp of frontend concepts.")
                .isPubliclyShared(false)
                .build());

        createdInterview = interviewRepository.save(Interview.builder()
                .user(testUser)
                .jobRole("Frontend Developer")
                .experience("Mid-level")
                .interviewType("Technical")
                .difficulty("Medium")
                .numberOfQuestions(3)
                .interviewMode("Text")
                .status("CREATED")
                .isPubliclyShared(false)
                .build());
    }

    @Test
    void toggleShare_enablesPublicSharing_andGeneratesToken() {
        ShareInterviewResponse response = interviewService.togglePublicSharing(testUser.getId(), completedInterview.getId());

        assertTrue(response.getIsPubliclyShared());
        assertNotNull(response.getShareToken());
        assertTrue(response.getShareUrl().contains("/report/"));

        // Verify retrieval via share token
        InterviewResultDto publicResult = interviewService.getPublicInterviewResult(response.getShareToken());
        assertNotNull(publicResult);
        assertEquals("Frontend Developer", publicResult.getJobRole());
        assertEquals("Test Candidate", publicResult.getCandidateName());
        assertEquals(85, publicResult.getOverallScore());
        assertTrue(publicResult.getIsPubliclyShared());
    }

    @Test
    void toggleShare_disablesSharing_whenAlreadyShared() {
        // First enable
        ShareInterviewResponse res1 = interviewService.togglePublicSharing(testUser.getId(), completedInterview.getId());
        String token = res1.getShareToken();

        // Second toggle should disable
        ShareInterviewResponse res2 = interviewService.togglePublicSharing(testUser.getId(), completedInterview.getId());
        assertFalse(res2.getIsPubliclyShared());
        assertNull(res2.getShareToken());

        // Accessing public report should throw ResourceNotFoundException
        assertThrows(ResourceNotFoundException.class, () -> interviewService.getPublicInterviewResult(token));
    }

    @Test
    void toggleShare_rejectsIncompleteInterview() {
        assertThrows(BadRequestException.class, () -> interviewService.togglePublicSharing(testUser.getId(), createdInterview.getId()));
    }

    @Test
    void getShareStatus_returnsCorrectStatus() {
        ShareInterviewResponse status1 = interviewService.getShareStatus(testUser.getId(), completedInterview.getId());
        assertFalse(status1.getIsPubliclyShared());

        interviewService.togglePublicSharing(testUser.getId(), completedInterview.getId());

        ShareInterviewResponse status2 = interviewService.getShareStatus(testUser.getId(), completedInterview.getId());
        assertTrue(status2.getIsPubliclyShared());
        assertNotNull(status2.getShareToken());
    }
}

