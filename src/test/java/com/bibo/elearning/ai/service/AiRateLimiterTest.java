package com.bibo.elearning.ai.service;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import com.bibo.elearning.ai.exception.AiException;

class AiRateLimiterTest {

    private final AtomicReference<Instant> now = new AtomicReference<>(Instant.parse("2026-10-26T06:00:00Z"));
    private final Clock clock = new Clock() {
        @Override public ZoneOffset getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(java.time.ZoneId zone) { return this; }
        @Override public Instant instant() { return now.get(); }
    };
    private final AiRateLimiter limiter = new AiRateLimiter(clock);

    @Test
    void blocksAfterPerMinuteLimit_thenAllowsNextMinute() {
        for (int i = 0; i < AiRateLimiter.PER_MINUTE; i++) limiter.check("harry");
        assertThatThrownBy(() -> limiter.check("harry")).isInstanceOf(AiException.class).hasMessageContaining("slow down");
        assertThatCode(() -> limiter.check("hermione")).doesNotThrowAnyException(); // per student

        now.set(now.get().plus(Duration.ofSeconds(61)));
        assertThatCode(() -> limiter.check("harry")).doesNotThrowAnyException();
    }

    @Test
    void blocksAfterDailyLimit() {
        for (int i = 0; i < AiRateLimiter.PER_DAY; i++) {
            limiter.check("ron");
            now.set(now.get().plus(Duration.ofMinutes(1)));
        }
        assertThatThrownBy(() -> limiter.check("ron")).hasMessageContaining("tomorrow");
        now.set(now.get().plus(Duration.ofDays(1)));
        assertThatCode(() -> limiter.check("ron")).doesNotThrowAnyException();
    }
}
