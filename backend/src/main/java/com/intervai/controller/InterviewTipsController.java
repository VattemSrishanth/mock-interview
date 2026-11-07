package com.intervai.controller;

import com.intervai.dto.InterviewTipDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/interviews/public/tips")
public class InterviewTipsController {

    @GetMapping
    public ResponseEntity<List<InterviewTipDto>> getPublicInterviewTips() {
        List<InterviewTipDto> tips = Arrays.asList(
                InterviewTipDto.builder()
                        .category("BEHAVIORAL_STAR")
                        .title("Mastering the STAR Behavioral Framework")
                        .summary("Structure responses to situational questions to highlight individual accountability and measurable results.")
                        .keyPoints(Arrays.asList(
                                "Situation (10%): Set concise context, tech stack, and scope in 1-2 sentences.",
                                "Task (15%): Clarify what you personally owned and the core obstacle to solve.",
                                "Action (50%): Detail your technical approach, architecture, and team collaboration.",
                                "Result (25%): Quantify the outcome (e.g. 40% latency reduction, 99.9% uptime)."
                        ))
                        .commonPitfalls(Arrays.asList(
                                "Spending over 60 seconds on background context.",
                                "Using 'we' instead of clarifying your specific contributions.",
                                "Omitting metrics or measurable business impact."
                        ))
                        .build(),

                InterviewTipDto.builder()
                        .category("SYSTEM_DESIGN")
                        .title("Deconstructing Distributed System Design")
                        .summary("Approach architectural questions with top-down requirements clarification and explicit trade-off analyses.")
                        .keyPoints(Arrays.asList(
                                "Clarify functional and non-functional requirements (read vs. write volume, latency bounds, SLA).",
                                "Perform quick back-of-the-envelope calculations for storage, throughput, and bandwidth.",
                                "Define clear API contracts and data models before drawing high-level architectures.",
                                "Identify single points of failure (SPOF) and discuss database sharding, replication, and caching."
                        ))
                        .commonPitfalls(Arrays.asList(
                                "Jumping straight to microservices without understanding scale.",
                                "Neglecting data consistency models (CAP theorem, ACID vs. BASE).",
                                "Ignoring failure recovery and circuit-breaker patterns."
                        ))
                        .build(),

                InterviewTipDto.builder()
                        .category("TECHNICAL_CODING")
                        .title("Articulating Problem-Solving in Live Coding")
                        .summary("Interviewers evaluate your thought process and problem formulation as much as the final implementation.")
                        .keyPoints(Arrays.asList(
                                "Think aloud and communicate your approach before typing code.",
                                "Verify edge cases (null inputs, empty collections, extreme scale) proactively.",
                                "State space and time complexity in Big-O notation explicitly.",
                                "Write clean, modular code with descriptive variable names and helper functions."
                        ))
                        .commonPitfalls(Arrays.asList(
                                "Coding in complete silence without verifying requirements.",
                                "Ignoring boundary conditions and off-by-one errors.",
                                "Premature micro-optimization before achieving a correct baseline."
                        ))
                        .build(),

                InterviewTipDto.builder()
                        .category("COMMUNICATION_PACING")
                        .title("Speech Articulation & Vocal Delivery")
                        .summary("Clear, steady delivery projects authority and ensures speech recognition systems accurately capture technical nuances.")
                        .keyPoints(Arrays.asList(
                                "Target a steady speaking pace between 130 and 150 words per minute.",
                                "Replace filler words ('um', 'like', 'you know') with brief intentional pauses.",
                                "Structure explanations in bullet points or clear sequential steps ('First... Next... Finally').",
                                "Conclude answers decisively with a summary wrap-up statement."
                        ))
                        .commonPitfalls(Arrays.asList(
                                "Speaking too rapidly when encountering difficult questions.",
                                "Trailing off sentences without an explicit conclusion.",
                                "Over-answering and straying from the original question prompt."
                        ))
                        .build()
        );

        return ResponseEntity.ok(tips);
    }
}
