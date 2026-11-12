package com.intervai.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.*;

class RequestValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

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
    void updateProfileAllowsValidFullAndMinimalPayloads() {
        UpdateProfileRequest full = new UpdateProfileRequest(
                "V Srishanth",
                "Backend Developer",
                "Mid-Level (3-5 years)",
                "Lead distributed API architecture roles.",
                "https://example.com/avatar.png",
                List.of("Java", "Spring Boot", "PostgreSQL")
        );
        UpdateProfileRequest minimal = new UpdateProfileRequest("Candidate", null, null, null, null, null);

        assertTrue(validator.validate(full).isEmpty());
        assertTrue(validator.validate(minimal).isEmpty());
    }

    @Test
    void updateProfileRejectsBlankNameAndOversizedFields() {
        UpdateProfileRequest blankName = new UpdateProfileRequest("   ", null, null, null, null, null);
        assertFalse(validator.validate(blankName).isEmpty());

        UpdateProfileRequest longFields = new UpdateProfileRequest(
                "n".repeat(101),
                "r".repeat(101),
                "e".repeat(51),
                "g".repeat(256),
                "u".repeat(501),
                IntStream.range(0, 31).mapToObj(i -> "Skill" + i).toList()
        );

        Set<ConstraintViolation<UpdateProfileRequest>> violations = validator.validate(longFields);
        assertEquals(6, violations.size());
    }

    @Test
    void updateProfileRejectsBlankOrOversizedSkillEntries() {
        UpdateProfileRequest blankSkill = new UpdateProfileRequest(
                "Candidate", null, null, null, null, List.of("Java", "   ")
        );
        UpdateProfileRequest oversizedSkill = new UpdateProfileRequest(
                "Candidate", null, null, null, null, List.of("s".repeat(101))
        );

        assertFalse(validator.validate(blankSkill).isEmpty());
        assertFalse(validator.validate(oversizedSkill).isEmpty());
    }

    @Test
    void codeExecutionEnforcesRequiredAndLengthBounds() {
        CodeExecutionRequest valid = CodeExecutionRequest.builder()
                .language("java")
                .code("public class Main { public static void main(String[] args) {} }")
                .stdin("42")
                .build();
        assertTrue(validator.validate(valid).isEmpty());

        CodeExecutionRequest oversized = CodeExecutionRequest.builder()
                .language("l".repeat(51))
                .code("c".repeat(20001))
                .stdin("i".repeat(5001))
                .build();
        assertEquals(3, validator.validate(oversized).size());

        CodeExecutionRequest blank = CodeExecutionRequest.builder()
                .language(" ")
                .code("")
                .build();
        assertEquals(2, validator.validate(blank).size());
    }

    @Test
    void createInterviewEnforcesRequiredFieldsAndQuestionBounds() {
        CreateInterviewRequest valid = CreateInterviewRequest.builder()
                .jobRole("Backend Developer")
                .experience("Mid-Level (3-5 years)")
                .interviewType("Technical")
                .difficulty("Medium")
                .numberOfQuestions(5)
                .interviewMode("Voice")
                .skills(List.of("Java", "Spring Boot"))
                .build();
        assertTrue(validator.validate(valid).isEmpty());

        CreateInterviewRequest outOfBounds = CreateInterviewRequest.builder()
                .jobRole(" ")
                .experience("")
                .interviewType("Technical")
                .difficulty("Medium")
                .numberOfQuestions(25)
                .skills(IntStream.range(0, 26).mapToObj(i -> "Skill" + i).toList())
                .build();
        assertEquals(4, validator.validate(outOfBounds).size());
    }

    @Test
    void submitAnswerAndFollowUpEnforceNonBlankTextUnlessSkipped() {
        SubmitAnswerRequest missingAnswer = SubmitAnswerRequest.builder()
                .questionId(1L)
                .answerText("   ")
                .isSkipped(false)
                .build();
        assertFalse(validator.validate(missingAnswer).isEmpty());

        SubmitAnswerRequest skippedWithoutAnswer = SubmitAnswerRequest.builder()
                .questionId(1L)
                .answerText("")
                .isSkipped(true)
                .timeSpentSeconds(12)
                .build();
        assertTrue(validator.validate(skippedWithoutAnswer).isEmpty());

        SubmitFollowUpRequest invalidFollowUp = SubmitFollowUpRequest.builder()
                .questionId(1L)
                .followUpAnswerText(" ")
                .timeSpentSeconds(-5)
                .build();
        assertEquals(2, validator.validate(invalidFollowUp).size());
    }

    @Test
    void ttsRequestEnforcesTextAndSpeedBounds() {
        TtsRequest valid = TtsRequest.builder()
                .text("Walk me through how you would partition a hot Kafka topic.")
                .voice("nova")
                .persona("sarah")
                .speed(1.1)
                .build();
        assertTrue(validator.validate(valid).isEmpty());

        TtsRequest invalid = TtsRequest.builder()
                .text(" ")
                .speed(5.0)
                .build();
        assertEquals(2, validator.validate(invalid).size());
    }
}

