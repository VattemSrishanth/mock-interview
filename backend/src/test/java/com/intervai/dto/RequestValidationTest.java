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
}
