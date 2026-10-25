package com.bibo.elearning.parent.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import com.bibo.elearning.parent.dto.response.ParentOverviewResponse.DayActivity;

class ParentOverviewLogicTest {

    // 2026-10-25 is a Sunday → week is Mon 10-19 .. Sun 10-25
    private static final LocalDate SUNDAY = LocalDate.of(2026, 10, 25);

    @Test
    void weeklyActivity_countsLessonsPerDay_MonToSun() {
        List<LocalDateTime> completions = List.of(
                LocalDateTime.of(2026, 10, 19, 9, 0),   // Mon
                LocalDateTime.of(2026, 10, 19, 15, 0),  // Mon
                LocalDateTime.of(2026, 10, 22, 8, 0),   // Thu
                LocalDateTime.of(2026, 10, 25, 20, 0),  // Sun (today)
                LocalDateTime.of(2026, 10, 18, 10, 0)); // previous Sunday → ignored

        List<DayActivity> week = ParentService.weeklyActivity(completions, SUNDAY);

        assertThat(week).hasSize(7);
        assertThat(week).extracting(DayActivity::day)
                .containsExactly("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun");
        assertThat(week).extracting(DayActivity::lessonsCompleted)
                .containsExactly(2, 0, 0, 1, 0, 0, 1);
        assertThat(week.get(0).date()).isEqualTo(LocalDate.of(2026, 10, 19));
    }

    @Test
    void weeklyActivity_onMonday_startsThatSameDay() {
        LocalDate monday = LocalDate.of(2026, 10, 19);
        List<DayActivity> week = ParentService.weeklyActivity(List.of(), monday);
        assertThat(week.get(0).date()).isEqualTo(monday);
        assertThat(week.get(6).date()).isEqualTo(SUNDAY);
    }

    @Test
    void learningWeek_isOneBasedFromFirstActivity() {
        assertThat(ParentService.learningWeek(null, SUNDAY)).isEqualTo(1);
        assertThat(ParentService.learningWeek(SUNDAY, SUNDAY)).isEqualTo(1);
        assertThat(ParentService.learningWeek(SUNDAY.minusDays(6), SUNDAY)).isEqualTo(1);
        assertThat(ParentService.learningWeek(SUNDAY.minusDays(7), SUNDAY)).isEqualTo(2);
        assertThat(ParentService.learningWeek(SUNDAY.minusDays(20), SUNDAY)).isEqualTo(3);
        assertThat(ParentService.learningWeek(SUNDAY.plusDays(3), SUNDAY)).isEqualTo(1); // clock skew guard
    }

    @Test
    void goalReachedAt_returnsTimeOfNthCompletionToday() {
        List<LocalDateTime> completions = List.of(
                LocalDateTime.of(2026, 10, 25, 16, 0),
                LocalDateTime.of(2026, 10, 25, 9, 0),
                LocalDateTime.of(2026, 10, 24, 9, 0),   // yesterday, ignored
                LocalDateTime.of(2026, 10, 25, 11, 30));

        assertThat(ParentService.goalReachedAt(completions, 2, SUNDAY))
                .isEqualTo(LocalDateTime.of(2026, 10, 25, 11, 30));
        assertThat(ParentService.goalReachedAt(completions, 3, SUNDAY))
                .isEqualTo(LocalDateTime.of(2026, 10, 25, 16, 0));
        assertThat(ParentService.goalReachedAt(completions, 4, SUNDAY)).isNull();
        assertThat(ParentService.goalReachedAt(completions, 0, SUNDAY)).isNull();
    }
}
