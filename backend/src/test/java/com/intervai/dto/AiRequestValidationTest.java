package com.intervai.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.*;

class AiRequestValidationTest {
    private static Validator validator;
    private static jakarta.validation.ValidatorFactory factory;

    @BeforeAll
    static void setUp() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        factory.close();
    }

    @Test
    void coachRequiresNonblankMessageAndEnforcesMessageAndTopicLimits() {
        assertTrue(validator.validate(new AiCoachRequest("A useful request", "Java")).isEmpty());
        assertFalse(validator.validate(new AiCoachRequest(" ", null)).isEmpty());
        assertFalse(validator.validate(new AiCoachRequest("x".repeat(2001), null)).isEmpty());
        assertFalse(validator.validate(new AiCoachRequest("request", "x".repeat(201))).isEmpty());
    }

    @Test
    void answerMustHaveTextUnlessSkippedAndEnforcesFieldLimits() {
        SubmitAnswerRequest valid = new SubmitAnswerRequest(1L, "An answer", null, 5, false);
        SubmitAnswerRequest skipped = new SubmitAnswerRequest(1L, "", null, 0, true);
        SubmitAnswerRequest empty = new SubmitAnswerRequest(1L, " ", null, 0, false);
        SubmitAnswerRequest negativeTime = new SubmitAnswerRequest(1L, "answer", null, -1, false);
        SubmitAnswerRequest oversized = new SubmitAnswerRequest(1L, "x".repeat(10001), null, 0, false);
        SubmitAnswerRequest oversizedUrl = new SubmitAnswerRequest(1L, "answer", "x".repeat(2049), 0, false);

        assertTrue(validator.validate(valid).isEmpty());
        assertTrue(validator.validate(skipped).isEmpty());
        assertFalse(validator.validate(empty).isEmpty());
        assertFalse(validator.validate(negativeTime).isEmpty());
        assertFalse(validator.validate(oversized).isEmpty());
        assertFalse(validator.validate(oversizedUrl).isEmpty());
    }

    @Test
    void followUpAndTtsEnforceTextAndNumericBounds() {
        SubmitFollowUpRequest validFollowUp = SubmitFollowUpRequest.builder()
                .questionId(10L)
                .followUpAnswerText("Redis handles atomic increments safely.")
                .timeSpentSeconds(12)
                .build();
        SubmitFollowUpRequest negativeFollowUpTime = SubmitFollowUpRequest.builder()
                .questionId(10L)
                .followUpAnswerText("Valid answer")
                .timeSpentSeconds(-3)
                .build();
        SubmitFollowUpRequest oversizedFollowUp = SubmitFollowUpRequest.builder()
                .questionId(10L)
                .followUpAnswerText("f".repeat(10001))
                .build();

        assertTrue(validator.validate(validFollowUp).isEmpty());
        assertFalse(validator.validate(negativeFollowUpTime).isEmpty());
        assertFalse(validator.validate(oversizedFollowUp).isEmpty());

        TtsRequest validTts = TtsRequest.builder().text("Tell me about distributed locking.").speed(1.25).build();
        TtsRequest slowTts = TtsRequest.builder().text("Hello").speed(0.1).build();
        TtsRequest fastTts = TtsRequest.builder().text("Hello").speed(4.5).build();
        TtsRequest longTts = TtsRequest.builder().text("t".repeat(4097)).build();

        assertTrue(validator.validate(validTts).isEmpty());
        assertFalse(validator.validate(slowTts).isEmpty());
        assertFalse(validator.validate(fastTts).isEmpty());
        assertFalse(validator.validate(longTts).isEmpty());
    }

    @Test
    void createInterviewEnforcesFieldSizesAndSkillLimits() {
        CreateInterviewRequest valid = CreateInterviewRequest.builder()
                .jobRole("Backend Engineer")
                .experience("1-3 years")
                .interviewType("Technical")
                .difficulty("Medium")
                .skills(List.of("Java", "Spring Boot"))
                .build();
        assertTrue(validator.validate(valid).isEmpty());

        CreateInterviewRequest tooManySkills = CreateInterviewRequest.builder()
                .jobRole("r".repeat(101))
                .experience("e".repeat(51))
                .interviewType("Technical")
                .difficulty("Medium")
                .skills(IntStream.range(0, 26).mapToObj(i -> "Skill" + i).toList())
                .build();
        assertEquals(3, validator.validate(tooManySkills).size());

        CreateInterviewRequest blankSkill = CreateInterviewRequest.builder()
                .jobRole("Backend Engineer")
                .experience("1-3 years")
                .interviewType("Technical")
                .difficulty("Medium")
                .skills(List.of("Java", "  "))
                .build();
        assertFalse(validator.validate(blankSkill).isEmpty());
    }
}
