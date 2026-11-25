package com.intervai.service;

import com.intervai.dto.DailyWorkoutDto;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DailyWorkoutService {

    public DailyWorkoutDto getTodayWorkout() {
        return getTodaysWorkout();
    }

    public boolean validateAnswer(int selectedOptionIndex) {
        DailyWorkoutDto today = getTodaysWorkout();
        return today.getCorrectOptionIndex() == selectedOptionIndex;
    }

    public DailyWorkoutDto getTodaysWorkout() {
        return getWorkoutForDate(LocalDate.now());
    }

    public DailyWorkoutDto getWorkoutForDate(LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        int dayIndex = Math.abs(targetDate.hashCode() % 5);

        DailyWorkoutDto workout = new DailyWorkoutDto();
        workout.setWorkoutId("WRK-" + targetDate);
        workout.setWorkoutDate(targetDate);
        workout.setXpReward(50);

        switch (dayIndex) {
            case 0 -> {
                workout.setDailyFocusTopic("System Scalability & Database Indexing (B-Trees vs Hash Index)");
                workout.setRapidConceptQuestion("Why are B-Tree indexes typically preferred over Hash indexes in relational databases (PostgreSQL/MySQL)?");
                workout.setConceptOptions(List.of(
                        "Hash indexes consume more memory than B-Trees in all scenarios.",
                        "B-Trees efficiently support range queries (BETWEEN, >, <) and order-by operations.",
                        "Hash indexes cannot be persisted to physical disk storage.",
                        "B-Trees provide O(1) worst-case lookup time compared to Hash tables."
                ));
                workout.setCorrectOptionIndex(1);
                workout.setConceptExplanation("B-Trees store keys in sorted sequential order, allowing log(N) seeks followed by sequential scans for ranges. Hash indexes only support exact equality (=).");
                workout.setQuickCodePrompt("Implement an in-memory TTL Cache with get(key) and put(key, value, ttlMillis).");
                workout.setCodeStarterSnippet("class TTLCache<K, V> {\n    // Implement your thread-safe or O(1) TTL eviction\n}");
                workout.setTargetExpectedComplexity("O(1) Get / Put, O(1) Expiry Check");
            }
            case 1 -> {
                workout.setDailyFocusTopic("Dynamic Programming & Sliding Window Invariants");
                workout.setRapidConceptQuestion("Which condition indicates that an array problem should be tackled via a Sliding Window rather than 2D DP?");
                workout.setConceptOptions(List.of(
                        "The array contains duplicate floating point numbers.",
                        "The constraint requires finding a contiguous subarray satisfying a monotonic property.",
                        "The input array is already guaranteed to be sorted in reverse order.",
                        "The search space requires testing all combinations of non-adjacent elements."
                ));
                workout.setCorrectOptionIndex(1);
                workout.setConceptExplanation("Sliding Window works when adding an element on the right monotonically tightens/relaxes the window constraint, allowing left pointer adjustments in O(N) total time.");
                workout.setQuickCodePrompt("Find the length of the longest substring without repeating characters.");
                workout.setCodeStarterSnippet("public int lengthOfLongestSubstring(String s) {\n    // Write O(N) sliding window\n    return 0;\n}");
                workout.setTargetExpectedComplexity("Time: O(N), Space: O(min(M, N))");
            }
            case 2 -> {
                workout.setDailyFocusTopic("Distributed Caching & Consistent Hashing Rings");
                workout.setRapidConceptQuestion("Why do production consistent hashing rings introduce virtual nodes (vnodes) per physical cache shard?");
                workout.setConceptOptions(List.of(
                        "To encrypt cache keys before network transmission.",
                        "To ensure uniform key distribution and avoid hotspotting when nodes join or leave.",
                        "To bypass TCP connection limits in HTTP/1.1 clients.",
                        "To convert LRU eviction policies into FIFO queues."
                ));
                workout.setCorrectOptionIndex(1);
                workout.setConceptExplanation("Virtual nodes map each physical shard to many points around the hash ring, smoothing variance in partition sizes and spreading rebalance load evenly across surviving nodes.");
                workout.setQuickCodePrompt("Design a thread-safe ConsistentHashRouter supporting addNode, removeNode, and routeKey.");
                workout.setCodeStarterSnippet("class ConsistentHashRouter {\n    // Use a TreeMap<Long, String> hash ring with virtual nodes\n}");
                workout.setTargetExpectedComplexity("O(log(N * V)) Lookup, Minimal K/N Rebalancing");
            }
            case 3 -> {
                workout.setDailyFocusTopic("Event-Driven Reliability & Transactional Outbox Pattern");
                workout.setRapidConceptQuestion("What dual-write failure mode does the Transactional Outbox pattern eliminate?");
                workout.setConceptOptions(List.of(
                        "Browser CORS preflight failures on cross-origin POST requests.",
                        "Updating the database without publishing the corresponding domain event (or vice versa) on crash.",
                        "Stack overflow errors during recursive JSON serialization.",
                        "CPU throttling inside single-threaded event loops."
                ));
                workout.setCorrectOptionIndex(1);
                workout.setConceptExplanation("Persisting the entity mutation and the outbox event inside the same ACID database transaction ensures atomic durability before a relay publishes to Kafka/RabbitMQ.");
                workout.setQuickCodePrompt("Implement an idempotent message deduplicator using a bounded key store.");
                workout.setCodeStarterSnippet("class IdempotentConsumer {\n    public boolean tryProcess(String eventId) {\n        return true;\n    }\n}");
                workout.setTargetExpectedComplexity("O(1) Deduplication Check, At-Least-Once Safe");
            }
            default -> {
                workout.setDailyFocusTopic("Concurrency & Distributed Consensus (CAP Theorem)");
                workout.setRapidConceptQuestion("In a distributed partitioned network (P), what does a CP system guarantee over an AP system?");
                workout.setConceptOptions(List.of(
                        "Guarantees 100% uptime availability for all read requests during partition.",
                        "Guarantees strong linearizable consistency at the cost of returning errors when partitions occur.",
                        "Guarantees zero network latency across geographically separated clusters.",
                        "Guarantees that database schemas can be altered without downtime."
                ));
                workout.setCorrectOptionIndex(1);
                workout.setConceptExplanation("Under network partition (P), a CP system rejects or pauses writes to preserve strict consistency, ensuring all nodes present the exact same state.");
                workout.setQuickCodePrompt("Implement a rate-limiter Token Bucket algorithm for high-concurrency API calls.");
                workout.setCodeStarterSnippet("class TokenBucketRateLimiter {\n    public boolean allowRequest() {\n        return true;\n    }\n}");
                workout.setTargetExpectedComplexity("O(1) Time, Atomic Lock-Free Synchronization");
            }
        }

        return workout;
    }
}
