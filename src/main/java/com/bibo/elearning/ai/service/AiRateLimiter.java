package com.bibo.elearning.ai.service;

import java.time.Clock;
import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import com.bibo.elearning.ai.exception.AiException;

/**
 * Per-student limits so one account can't use up the school's shared Groq quota
 * (free tier: ~1,000 requests/day for the whole organisation). In-memory: resets on restart.
 */
@Component
public class AiRateLimiter {

    static final int PER_MINUTE = 8;
    static final int PER_DAY = 80;

    private final Map<String, Deque<Long>> calls = new ConcurrentHashMap<>();
    private final Clock clock;

    public AiRateLimiter() {
        this(Clock.systemUTC());
    }

    AiRateLimiter(Clock clock) {
        this.clock = clock;
    }

    public void check(String username) {
        long now = clock.millis();
        long dayAgo = now - Duration.ofDays(1).toMillis();
        long minuteAgo = now - Duration.ofMinutes(1).toMillis();

        Deque<Long> times = calls.computeIfAbsent(username, k -> new ArrayDeque<>());
        synchronized (times) {
            while (!times.isEmpty() && times.peekFirst() < dayAgo) times.pollFirst();
            if (times.size() >= PER_DAY) {
                throw new AiException(HttpStatus.TOO_MANY_REQUESTS,
                        "You've asked Bibo a lot today! 🌙 Take a break and come back tomorrow.");
            }
            long lastMinute = times.stream().filter(t -> t >= minuteAgo).count();
            if (lastMinute >= PER_MINUTE) {
                throw new AiException(HttpStatus.TOO_MANY_REQUESTS,
                        "Whoa, slow down a little! ⏳ Wait a minute, then ask again.");
            }
            times.addLast(now);
        }
    }
}
