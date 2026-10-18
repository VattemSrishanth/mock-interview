package com.intervai.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

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
        SubmitAnswerRequest oversized = new SubmitAnswerRequest(1L, "x".repeat(10001), null, 0, false);
        SubmitAnswerRequest oversizedUrl = new SubmitAnswerRequest(1L, "answer", "x".repeat(2049), 0, false);

        assertTrue(validator.validate(valid).isEmpty());
        assertTrue(validator.validate(skipped).isEmpty());
        assertFalse(validator.validate(empty).isEmpty());
        assertFalse(validator.validate(oversized).isEmpty());
        assertFalse(validator.validate(oversizedUrl).isEmpty());
    }
}
