package com.intervai.service;

import com.intervai.dto.DailyWorkoutDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class DailyWorkoutServiceTest {

    private DailyWorkoutService dailyWorkoutService;

    @BeforeEach
    void setUp() {
        dailyWorkoutService = new DailyWorkoutService();
    }

    @Test
    void getWorkoutForDate_CoversAllFiveCurriculumTracksAcrossDates() {
        Set<String> topics = new HashSet<>();
        LocalDate baseDate = LocalDate.of(2026, 11, 1);

        for (int i = 0; i < 30; i++) {
            LocalDate date = baseDate.plusDays(i);
            DailyWorkoutDto workout = dailyWorkoutService.getWorkoutForDate(date);
            assertNotNull(workout);
            assertEquals("WRK-" + date, workout.getWorkoutId());
            assertEquals(date, workout.getWorkoutDate());
            assertEquals(50, workout.getXpReward());
            assertNotNull(workout.getConceptOptions());
            assertEquals(4, workout.getConceptOptions().size());
            assertTrue(workout.getCorrectOptionIndex() >= 0 && workout.getCorrectOptionIndex() < 4);
            assertFalse(workout.getQuickCodePrompt().isBlank());
            topics.add(workout.getDailyFocusTopic());
        }

        assertEquals(5, topics.size(), "All 5 curriculum tracks should rotate across consecutive dates");
    }

    @Test
    void validateAnswer_EvaluatesCorrectAndIncorrectOptions() {
        DailyWorkoutDto today = dailyWorkoutService.getTodaysWorkout();
        assertTrue(dailyWorkoutService.validateAnswer(today.getCorrectOptionIndex()));
        assertFalse(dailyWorkoutService.validateAnswer((today.getCorrectOptionIndex() + 1) % 4));
    }
}
