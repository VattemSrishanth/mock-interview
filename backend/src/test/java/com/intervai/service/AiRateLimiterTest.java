package com.intervai.service;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

class AiRateLimiterTest {
    @Test
    void enforcesPerUserLimitAndBoundsTrackedUsers() {
        AiRateLimiter limiter = new AiRateLimiter(2, 60, 2,
                Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC));

        assertTrue(limiter.tryAcquire(1));
        assertTrue(limiter.tryAcquire(1));
        assertFalse(limiter.tryAcquire(1));
        assertTrue(limiter.tryAcquire(2));
        assertFalse(limiter.tryAcquire(3));
    }

    @Test
    void concurrentRequestsCannotExceedPerUserLimit() throws InterruptedException {
        int maxRequests = 5;
        AiRateLimiter limiter = new AiRateLimiter(maxRequests, 60, 10,
                Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC));
        int workers = 32;
        CountDownLatch ready = new CountDownLatch(workers);
        CountDownLatch start = new CountDownLatch(1);
        AtomicInteger acquired = new AtomicInteger();
        Thread[] threads = new Thread[workers];

        for (int i = 0; i < workers; i++) {
            threads[i] = new Thread(() -> {
                ready.countDown();
                try {
                    start.await();
                    if (limiter.tryAcquire(99)) acquired.incrementAndGet();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
            threads[i].start();
        }
        ready.await();
        start.countDown();
        for (Thread thread : threads) thread.join();

        assertEquals(maxRequests, acquired.get());
    }
}
