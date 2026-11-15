package com.intervai.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Enterprise IP-level sliding window rate limiter protecting authentication endpoints
 * from automated credential stuffing, distributed brute-force attacks, and OTP flooding.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 5)
@Slf4j
public class AuthRateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_LOGIN_REQUESTS_PER_MINUTE = 15;
    private static final int MAX_CODE_REQUESTS_PER_MINUTE = 10;
    private static final int MAX_REGISTER_REQUESTS_PER_MINUTE = 10;
    private static final int MAX_INBOX_REQUESTS_PER_MINUTE = 60;
    private static final int MAX_TRACKED_ENTRIES = 10000;
    private static final long WINDOW_MS = 60000; // 1 minute window

    private final Map<String, RequestBucket> tracker = new ConcurrentHashMap<>();

    private static class RequestBucket {
        private final long windowStart;
        private final AtomicInteger count;

        RequestBucket(long now) {
            this.windowStart = now;
            this.count = new AtomicInteger(1);
        }

        int increment() {
            return this.count.incrementAndGet();
        }

        boolean isExpired(long now) {
            return (now - windowStart) > WINDOW_MS;
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        if (!path.startsWith("/api/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        int limit = resolveLimitForPath(path);
        if (limit <= 0) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = resolveClientIp(request);
        String bucketKey = clientIp + ":" + path;
        long now = System.currentTimeMillis();

        // Evict expired entries periodically to bound heap usage
        if (tracker.size() > MAX_TRACKED_ENTRIES) {
            cleanupExpiredBuckets(now);
        }

        RequestBucket bucket = tracker.compute(bucketKey, (key, existing) -> {
            if (existing == null || existing.isExpired(now)) {
                return new RequestBucket(now);
            }
            existing.increment();
            return existing;
        });

        if (bucket.count.get() > limit) {
            log.warn("[SECURITY RATE LIMIT] Rate limit of {} req/min exceeded for client IP {} on endpoint {}",
                    limit, clientIp, path);

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", "60");

            String json = String.format(
                    "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Too many requests from this IP address. For security, please wait 60 seconds before trying again.\",\"path\":\"%s\",\"timestamp\":\"%s\"}",
                    path, Instant.now().toString());

            response.getWriter().write(json);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private int resolveLimitForPath(String path) {
        if (path.equals("/api/auth/login")) return MAX_LOGIN_REQUESTS_PER_MINUTE;
        if (path.equals("/api/auth/send-verification-code")) return MAX_CODE_REQUESTS_PER_MINUTE;
        if (path.equals("/api/auth/register")) return MAX_REGISTER_REQUESTS_PER_MINUTE;
        if (path.startsWith("/api/auth/inbox")) return MAX_INBOX_REQUESTS_PER_MINUTE;
        return -1;
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }

    private synchronized void cleanupExpiredBuckets(long now) {
        tracker.entrySet().removeIf(entry -> entry.getValue().isExpired(now));
        if (tracker.size() > MAX_TRACKED_ENTRIES) {
            Iterator<String> it = tracker.keySet().iterator();
            int toRemove = tracker.size() - (MAX_TRACKED_ENTRIES / 2);
            while (it.hasNext() && toRemove > 0) {
                it.next();
                it.remove();
                toRemove--;
            }
        }
    }
}
