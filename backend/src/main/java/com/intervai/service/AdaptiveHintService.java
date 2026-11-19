package com.intervai.service;

import com.intervai.dto.HintLadderRequest;
import com.intervai.dto.HintLadderResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdaptiveHintService {

    public HintLadderResponse generateHint(HintLadderRequest request) {
        int tier = Math.max(1, Math.min(3, request.getHintTier()));
        String q = request.getQuestion() != null ? request.getQuestion().toLowerCase() : "";

        return switch (tier) {
            case 1 -> new HintLadderResponse(
                    1,
                    "Tier 1: High-Level Conceptual Intuition",
                    getTier1Content(q),
                    5, // 5% mild penalty
                    "Consider the problem constraints and what invariant holds true after each step.",
                    List.of("Identify the sub-problem structure", "Check if sorting or grouping reduces complexity", "Formulate brute force first")
            );
            case 2 -> new HintLadderResponse(
                    2,
                    "Tier 2: Optimal Data Structure Recommendation",
                    getTier2Content(q),
                    12, // 12% penalty
                    "Look for opportunities to trade auxiliary space (O(N)) for optimal time complexity (O(N) or O(log N)).",
                    List.of("Hash Maps for O(1) lookups", "Two-Pointers or Sliding Window for monotonic subarrays", "Priority Queues for Top-K / order maintenance")
            );
            case 3 -> new HintLadderResponse(
                    3,
                    "Tier 3: Algorithmic Blueprint & Pseudo-code",
                    getTier3Content(q),
                    25, // 25% major hint penalty
                    "Implement the optimal pattern directly while testing corner cases (empty input, duplicates, negative numbers).",
                    List.of("Initialize state variables", "Iterate through bounds with loop invariance", "Return validated edge-case guarded output")
            );
            default -> new HintLadderResponse(1, "Conceptual Nudge", "Break the problem down into inputs, expected outputs, and constraints.", 5, "Start simple.", List.of());
        };
    }

    private String getTier1Content(String question) {
        if (question.contains("array") || question.contains("sum") || question.contains("two")) {
            return "Notice that scanning elements sequentially allows you to look back at previously encountered values. Instead of nested loops, what can you store to instantly query prior items?";
        } else if (question.contains("tree") || question.contains("graph")) {
            return "Consider whether you need a level-by-level traversal (BFS with a queue) or a recursive exploration of depth (DFS with a call stack).";
        } else if (question.contains("string") || question.contains("palindrome")) {
            return "Strings exhibit symmetry or character frequency patterns. Consider expanding outward from centers or keeping frequency counters.";
        } else {
            return "Break the problem into base cases and recursive steps. Look for redundant computations that could be cached.";
        }
    }

    private String getTier2Content(String question) {
        if (question.contains("array") || question.contains("sum") || question.contains("two")) {
            return "Use a HashMap<Element, Index> to achieve O(N) time and O(N) auxiliary space, or sort the array and use Two Pointers from both ends.";
        } else if (question.contains("tree") || question.contains("graph")) {
            return "Use a standard Deque/Queue for BFS with a visited Set<Node> to avoid cycles, or an adjacency list representation with recursion.";
        } else if (question.contains("string") || question.contains("palindrome")) {
            return "Use an integer array of size 26 or 128 (ASCII) for O(1) space frequency mapping, or a Two-Pointer left/right pointer strategy.";
        } else {
            return "Apply dynamic programming memoization (table of subproblem states) or an explicit Stack/Queue to manage pending state transitions.";
        }
    }

    private String getTier3Content(String question) {
        return """
                // Algorithmic Blueprint:
                1. Edge check: if (input == null || input.isEmpty()) return default;
                2. Data structure: Map<Key, Value> lookup = new HashMap<>();
                3. Single pass:
                   for (int i = 0; i < n; i++) {
                       Target complement = calculate(target, input[i]);
                       if (lookup.containsKey(complement)) return new Result(lookup.get(complement), i);
                       lookup.put(input[i], i);
                   }
                4. Return fallback if no solution is found.
                """;
    }
}
