package com.intervai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/** Bounded, process-local fixed-window rate limiter shared by AI endpoints. */
@Component
public class AiRateLimiter {
    private final int maxRequests;
    private final long windowMillis;
    private final int maxTrackedUsers;
    private final Clock clock;
    private final Map<Long, Window> windows = new HashMap<>();

    @Autowired
    public AiRateLimiter(
            @Value("${app.ai.rate-limit.max-requests:10}") int maxRequests,
            @Value("${app.ai.rate-limit.window-seconds:60}") long windowSeconds,
            @Value("${app.ai.rate-limit.max-tracked-users:10000}") int maxTrackedUsers) {
        this(maxRequests, windowSeconds, maxTrackedUsers, Clock.systemUTC());
    }

    AiRateLimiter(int maxRequests, long windowSeconds, int maxTrackedUsers, Clock clock) {
        if (maxRequests < 1 || windowSeconds < 1 || maxTrackedUsers < 1) {
            throw new IllegalArgumentException("AI rate-limit settings must be positive");
        }
        this.maxRequests = maxRequests;
        this.windowMillis = Math.multiplyExact(windowSeconds, 1000L);
        this.maxTrackedUsers = maxTrackedUsers;
        this.clock = clock;
    }

    public synchronized boolean tryAcquire(long userId) {
        long now = clock.millis();
        Window window = windows.get(userId);
        if (window != null && isExpired(window, now)) {
            windows.remove(userId);
            window = null;
        }

        if (window == null) {
            removeExpiredWindows(now);
            if (windows.size() >= maxTrackedUsers) return false;
            window = new Window(now);
            windows.put(userId, window);
        }

        if (window.requestCount >= maxRequests) return false;
        window.requestCount++;
        return true;
    }

    private void removeExpiredWindows(long now) {
        Iterator<Map.Entry<Long, Window>> iterator = windows.entrySet().iterator();
        while (iterator.hasNext()) {
            if (isExpired(iterator.next().getValue(), now)) iterator.remove();
        }
    }

    private boolean isExpired(Window window, long now) {
        return now >= window.startedAt && now - window.startedAt >= windowMillis;
    }

    private static final class Window {
        private final long startedAt;
        private int requestCount;

        private Window(long startedAt) {
            this.startedAt = startedAt;
        }
    }
}
