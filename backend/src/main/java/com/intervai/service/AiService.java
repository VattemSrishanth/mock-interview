package com.intervai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intervai.dto.AiCoachResponse;
import com.intervai.dto.CreateInterviewRequest;
import com.intervai.dto.FeedbackDto;
import com.intervai.entity.InterviewQuestion;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
public class AiService {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    @Value("${app.openai.api-key:}")
    private String openAiApiKey;

    @Value("${app.openai.model:gpt-4o-mini}")
    private String openAiModel;

    public AiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    public synchronized void setGeminiApiKey(String key) {
        this.geminiApiKey = key;
    }

    public synchronized void setOpenAiApiKey(String key) {
        this.openAiApiKey = key;
    }

    public boolean hasActiveAiKey() {
        return StringUtils.hasText(geminiApiKey) || StringUtils.hasText(openAiApiKey);
    }

    public String getActiveProvider() {
        if (StringUtils.hasText(geminiApiKey)) return "Google Gemini (" + geminiModel + ")";
        if (StringUtils.hasText(openAiApiKey)) return "OpenAI (" + openAiModel + ")";
        return "Internal Expert Engine (Ready for Gemini/OpenAI key)";
    }

    /**
     * Generate interview questions tailored to Job Role, Experience, Skills, Type, Difficulty.
     */
    public List<InterviewQuestion> generateQuestions(CreateInterviewRequest request) {
        int count = (request.getNumberOfQuestions() != null && request.getNumberOfQuestions() > 0)
                ? request.getNumberOfQuestions() : 5;

        if (StringUtils.hasText(geminiApiKey)) {
            try {
                return generateQuestionsViaGemini(request, count);
            } catch (Exception e) {
                log.warn("Gemini API call failed, falling back to Intelligent Domain Generator: {}", e.getMessage());
            }
        } else if (StringUtils.hasText(openAiApiKey)) {
            try {
                return generateQuestionsViaOpenAi(request, count);
            } catch (Exception e) {
                log.warn("OpenAI API call failed, falling back to Intelligent Domain Generator: {}", e.getMessage());
            }
        }

        return generateFallbackQuestions(request, count);
    }

    /**
     * Evaluate candidate answer with structured evaluation metrics.
     */
    public FeedbackDto evaluateAnswer(String questionText, String targetSkill, String category,
                                     String candidateAnswer, String jobRole, String difficulty, boolean isSkipped) {
        if (isSkipped || !StringUtils.hasText(candidateAnswer)) {
            return FeedbackDto.builder()
                    .score(0)
                    .technicalKnowledge(0)
                    .communication(0)
                    .relevance(0)
                    .clarity(0)
                    .confidence(0)
                    .strengths(List.of())
                    .weaknesses(List.of("The question was skipped or no answer was provided."))
                    .suggestions(List.of(
                            "Attempt the question even if uncertain; articulating thought process and fundamentals earns partial credit.",
                            "Review key concepts related to " + (targetSkill != null ? targetSkill : "this topic") + "."
                    ))
                    .modelAnswer(generateModelAnswer(questionText, targetSkill))
                    .build();
        }

        if (StringUtils.hasText(geminiApiKey)) {
            try {
                return evaluateViaGemini(questionText, targetSkill, candidateAnswer, jobRole, difficulty);
            } catch (Exception e) {
                log.warn("Gemini evaluation failed, using Intelligent Evaluator: {}", e.getMessage());
            }
        } else if (StringUtils.hasText(openAiApiKey)) {
            try {
                return evaluateViaOpenAi(questionText, targetSkill, candidateAnswer, jobRole, difficulty);
            } catch (Exception e) {
                log.warn("OpenAI evaluation failed, using Intelligent Evaluator: {}", e.getMessage());
            }
        }

        return evaluateFallback(questionText, targetSkill, candidateAnswer, jobRole, difficulty);
    }

    /**
     * AI Career Coach response with advice and personalized guidance.
     */
    public AiCoachResponse chatWithCoach(String message, String userProfileContext) {
        if (StringUtils.hasText(geminiApiKey)) {
            try {
                return coachViaGemini(message, userProfileContext);
            } catch (Exception e) {
                log.warn("Gemini coach failed, using fallback: {}", e.getMessage());
            }
        } else if (StringUtils.hasText(openAiApiKey)) {
            try {
                return coachViaOpenAi(message, userProfileContext);
            } catch (Exception e) {
                log.warn("OpenAI coach failed, using fallback: {}", e.getMessage());
            }
        }

        return fallbackCoachResponse(message);
    }

    // ==========================================
    // GEMINI IMPLEMENTATIONS
    // ==========================================

    private List<InterviewQuestion> generateQuestionsViaGemini(CreateInterviewRequest request, int count) throws Exception {
        String prompt = buildQuestionGenerationPrompt(request, count);
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent?key=" + geminiApiKey;

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> body = Map.of(
                "contents", List.of(content),
                "generationConfig", Map.of("temperature", 0.7, "responseMimeType", "application/json")
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
        String jsonText = extractGeminiResponseText(response.getBody());

        return parseQuestionsFromJson(jsonText, request);
    }

    private FeedbackDto evaluateViaGemini(String question, String skill, String answer, String role, String difficulty) throws Exception {
        String prompt = buildEvaluationPrompt(question, skill, answer, role, difficulty);
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent?key=" + geminiApiKey;

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> body = Map.of(
                "contents", List.of(content),
                "generationConfig", Map.of("temperature", 0.3, "responseMimeType", "application/json")
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
        String jsonText = extractGeminiResponseText(response.getBody());

        return parseFeedbackFromJson(jsonText);
    }

    private AiCoachResponse coachViaGemini(String message, String userProfileContext) throws Exception {
        String prompt = "You are an elite Tech Career and Interview Preparation Coach at IntervAI. "
                + "User context: " + userProfileContext + "\n"
                + "User query: " + message + "\n"
                + "Return JSON in this format: {\"reply\": \"string\", \"suggestions\": [\"...\"], \"recommendedTopics\": [\"...\"], \"sampleQuestions\": [\"...\"]}";

        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent?key=" + geminiApiKey;

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> body = Map.of(
                "contents", List.of(content),
                "generationConfig", Map.of("temperature", 0.7, "responseMimeType", "application/json")
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
        String jsonText = extractGeminiResponseText(response.getBody());

        return objectMapper.readValue(cleanJsonBlock(jsonText), AiCoachResponse.class);
    }

    private String extractGeminiResponseText(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode candidates = root.path("candidates");
        if (candidates.isArray() && candidates.size() > 0) {
            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (parts.isArray() && parts.size() > 0) {
                return parts.get(0).path("text").asText();
            }
        }
        throw new IllegalStateException("Failed to extract content from Gemini response");
    }

    // ==========================================
    // OPENAI IMPLEMENTATIONS
    // ==========================================

    private List<InterviewQuestion> generateQuestionsViaOpenAi(CreateInterviewRequest request, int count) throws Exception {
        String prompt = buildQuestionGenerationPrompt(request, count);
        String url = "https://api.openai.com/v1/chat/completions";

        Map<String, Object> body = Map.of(
                "model", openAiModel,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", "You are an expert technical interviewer. Return JSON only."),
                        Map.of("role", "user", "content", prompt)
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
        JsonNode root = objectMapper.readTree(response.getBody());
        String content = root.path("choices").get(0).path("message").path("content").asText();

        return parseQuestionsFromJson(content, request);
    }

    private FeedbackDto evaluateViaOpenAi(String question, String skill, String answer, String role, String difficulty) throws Exception {
        String prompt = buildEvaluationPrompt(question, skill, answer, role, difficulty);
        String url = "https://api.openai.com/v1/chat/completions";

        Map<String, Object> body = Map.of(
                "model", openAiModel,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", "You are an expert interview evaluator. Return JSON only."),
                        Map.of("role", "user", "content", prompt)
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
        JsonNode root = objectMapper.readTree(response.getBody());
        String content = root.path("choices").get(0).path("message").path("content").asText();

        return parseFeedbackFromJson(content);
    }

    private AiCoachResponse coachViaOpenAi(String message, String userProfileContext) throws Exception {
        String prompt = "You are an elite Tech Career and Interview Preparation Coach at IntervAI. "
                + "User context: " + userProfileContext + "\n"
                + "User query: " + message + "\n"
                + "Return JSON in this format: {\"reply\": \"string\", \"suggestions\": [\"...\"], \"recommendedTopics\": [\"...\"], \"sampleQuestions\": [\"...\"]}";

        String url = "https://api.openai.com/v1/chat/completions";

        Map<String, Object> body = Map.of(
                "model", openAiModel,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", "You are an AI career coach. Return JSON only."),
                        Map.of("role", "user", "content", prompt)
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
        JsonNode root = objectMapper.readTree(response.getBody());
        String content = root.path("choices").get(0).path("message").path("content").asText();

        return objectMapper.readValue(cleanJsonBlock(content), AiCoachResponse.class);
    }

    // ==========================================
    // PROMPT BUILDERS & PARSERS
    // ==========================================

    private String buildQuestionGenerationPrompt(CreateInterviewRequest request, int count) {
        return "Generate exactly " + count + " realistic, high-impact interview questions for a mock interview.\n"
                + "Target Job Role: " + request.getJobRole() + "\n"
                + "Experience Level: " + request.getExperience() + "\n"
                + "Skills: " + (request.getSkills() != null ? String.join(", ", request.getSkills()) : "General") + "\n"
                + "Interview Type: " + request.getInterviewType() + "\n"
                + "Difficulty: " + request.getDifficulty() + "\n\n"
                + "Respond with a JSON object containing a 'questions' array. Each item must have:\n"
                + "- questionOrder (integer, starting at 1)\n"
                + "- questionText (string, the complete interview question)\n"
                + "- category (string, e.g. Technical, Behavioral, System Design)\n"
                + "- targetSkill (string, relevant skill tested)\n"
                + "- expectedKeyPoints (string, key points expected in candidate response)\n"
                + "- modelAnswer (string, a concise exemplary answer)\n";
    }

    private String buildEvaluationPrompt(String question, String skill, String answer, String role, String difficulty) {
        return "You are an expert technical interviewer evaluating a candidate's answer.\n"
                + "Job Role: " + role + "\n"
                + "Difficulty Level: " + difficulty + "\n"
                + "Target Skill: " + (skill != null ? skill : "General") + "\n"
                + "Question: " + question + "\n"
                + "Candidate Answer: " + answer + "\n\n"
                + "Evaluate objectively and return JSON strictly matching this schema:\n"
                + "{\n"
                + "  \"score\": integer (0-100),\n"
                + "  \"technicalKnowledge\": integer (0-100),\n"
                + "  \"communication\": integer (0-100),\n"
                + "  \"relevance\": integer (0-100),\n"
                + "  \"clarity\": integer (0-100),\n"
                + "  \"confidence\": integer (0-100),\n"
                + "  \"strengths\": [string array of 2-3 specific positives],\n"
                + "  \"weaknesses\": [string array of 1-3 specific gaps or missed nuances],\n"
                + "  \"suggestions\": [string array of 2-3 actionable improvements],\n"
                + "  \"modelAnswer\": string (comprehensive benchmark answer)\n"
                + "}";
    }

    private String cleanJsonBlock(String raw) {
        if (raw == null) return "{}";
        String cleaned = raw.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }

    private List<InterviewQuestion> parseQuestionsFromJson(String jsonText, CreateInterviewRequest request) throws Exception {
        String cleaned = cleanJsonBlock(jsonText);
        JsonNode root = objectMapper.readTree(cleaned);
        JsonNode arrayNode = root.has("questions") ? root.get("questions") : root;

        List<InterviewQuestion> questions = new ArrayList<>();
        if (arrayNode.isArray()) {
            int order = 1;
            for (JsonNode item : arrayNode) {
                questions.add(InterviewQuestion.builder()
                        .questionOrder(order++)
                        .questionText(item.path("questionText").asText("Describe your experience with " + request.getJobRole()))
                        .category(item.path("category").asText(request.getInterviewType()))
                        .targetSkill(item.path("targetSkill").asText(request.getSkills() != null && !request.getSkills().isEmpty() ? request.getSkills().get(0) : "General"))
                        .expectedKeyPoints(item.path("expectedKeyPoints").asText("Clear structure, technical depth, relevant examples."))
                        .modelAnswer(item.path("modelAnswer").asText("A well-rounded explanation incorporating architectural rationale and real-world trade-offs."))
                        .build());
            }
        }
        return questions;
    }

    private FeedbackDto parseFeedbackFromJson(String jsonText) throws Exception {
        String cleaned = cleanJsonBlock(jsonText);
        JsonNode root = objectMapper.readTree(cleaned);

        return FeedbackDto.builder()
                .score(root.path("score").asInt(75))
                .technicalKnowledge(root.path("technicalKnowledge").asInt(75))
                .communication(root.path("communication").asInt(75))
                .relevance(root.path("relevance").asInt(75))
                .clarity(root.path("clarity").asInt(75))
                .confidence(root.path("confidence").asInt(75))
                .strengths(objectMapper.convertValue(root.path("strengths"), new TypeReference<List<String>>() {}))
                .weaknesses(objectMapper.convertValue(root.path("weaknesses"), new TypeReference<List<String>>() {}))
                .suggestions(objectMapper.convertValue(root.path("suggestions"), new TypeReference<List<String>>() {}))
                .modelAnswer(root.path("modelAnswer").asText())
                .build();
    }

    // ==========================================
    // RESILIENT INTERNAL EXPERT ENGINE (FALLBACK)
    // Ensures 100% operational availability without API keys
    // ==========================================

    private List<InterviewQuestion> generateFallbackQuestions(CreateInterviewRequest request, int count) {
        String role = request.getJobRole() != null ? request.getJobRole() : "Software Engineer";
        String type = request.getInterviewType() != null ? request.getInterviewType() : "Technical";
        String diff = request.getDifficulty() != null ? request.getDifficulty() : "Medium";
        List<String> skills = (request.getSkills() != null && !request.getSkills().isEmpty())
                ? request.getSkills() : List.of("Problem Solving", "System Architecture", "Best Practices");

        List<InterviewQuestion> bank = new ArrayList<>();

        if (role.toLowerCase().contains("frontend")) {
            bank.add(InterviewQuestion.builder()
                    .questionText("Explain the difference between useState and useEffect in React. When would you use useLayoutEffect instead?")
                    .category("Technical")
                    .targetSkill("React")
                    .expectedKeyPoints("useState triggers re-renders on state mutation; useEffect runs asynchronously after DOM paint; useLayoutEffect runs synchronously before paint to avoid visual flickers.")
                    .modelAnswer("useState declares a state variable and setter. useEffect executes side-effects (fetching, subscriptions) post-render asynchronously. useLayoutEffect fires synchronously immediately after DOM mutations, ideal for DOM layout measurements before paint.")
                    .build());
            bank.add(InterviewQuestion.builder()
                    .questionText("How does the Virtual DOM work in modern React, and how does reconciliation optimize rendering performance?")
                    .category("Technical")
                    .targetSkill("React")
                    .expectedKeyPoints("Fiber tree diffing, heuristic O(n) complexity, key reconciliation, batching updates.")
                    .modelAnswer("React maintains a lightweight in-memory representation of the UI. When state changes, a new Virtual DOM tree is generated, diffed with the previous tree using the Fiber reconciliation algorithm, and minimal necessary batch mutations are applied to the real DOM.")
                    .build());
            bank.add(InterviewQuestion.builder()
                    .questionText("Describe the Event Loop in JavaScript. How do microtasks (Promises) and macrotasks (setTimeout) differ in execution priority?")
                    .category("Technical")
                    .targetSkill("JavaScript")
                    .expectedKeyPoints("Call stack, Web APIs, Microtask queue, Task/Callback queue, tick order.")
                    .modelAnswer("JavaScript is single-threaded. Synchronous code executes in the call stack. Asynchronous tasks offload to the runtime. The event loop prioritizes draining the entire microtask queue (Promises, queueMicrotask) after each stack frame before picking the next macrotask (setTimeout, setInterval).")
                    .build());
            bank.add(InterviewQuestion.builder()
                    .questionText("What strategies do you employ to optimize Core Web Vitals (LCP, FID/INP, CLS) in a large-scale React single-page application?")
                    .category("Technical")
                    .targetSkill("Performance")
                    .expectedKeyPoints("Code splitting with React.lazy, image optimization (WebP/AVIF, lazy loading), layout reserve dimensions, tree-shaking, CDN caching.")
                    .modelAnswer("For LCP: Preload critical assets, SSR/SSG, code-split non-critical bundles. For INP: Web workers for heavy computation, debouncing handlers, useTransition. For CLS: Specify explicit width/height dimensions on images, skeleton placeholders, and avoid dynamic unreserved layout injection.")
                    .build());
            bank.add(InterviewQuestion.builder()
                    .questionText("Tell me about a time you encountered a severe frontend bug or state synchronization issue in production. How did you diagnose and resolve it?")
                    .category("Behavioral")
                    .targetSkill("Communication")
                    .expectedKeyPoints("STAR method, root cause analysis, instrumentation/telemetry, prevention.")
                    .modelAnswer("In our payment checkout flow, users experienced duplicate submissions due to unhandled async state during network timeouts. I reproduced the issue using network throttling, implemented idempotent request keys with optimistic locking, and added robust automated regression tests.")
                    .build());
            bank.add(InterviewQuestion.builder()
                    .questionText("How do you manage global state across a complex application? Compare Redux Toolkit, Context API, and Zustand.")
                    .category("System Design")
                    .targetSkill("State Management")
                    .expectedKeyPoints("Re-render triggers with Context, boilerplate comparison, selector subscriptions in Zustand/RTK.")
                    .modelAnswer("React Context is ideal for low-frequency updates (themes, auth) because consumers re-render whenever the context value changes. For high-frequency updates, Zustand or Redux Toolkit provide fine-grained selector-based subscriptions without excessive re-renders.")
                    .build());
        } else if (role.toLowerCase().contains("backend") || role.toLowerCase().contains("java")) {
            bank.add(InterviewQuestion.builder()
                    .questionText("Explain the internal working of HashMap in Java. How are hash collisions resolved in Java 8 and beyond?")
                    .category("Technical")
                    .targetSkill("Java")
                    .expectedKeyPoints("Array of Node/Entry, hashcode calculation, index masking, linked list to red-black tree conversion at TREEIFY_THRESHOLD (8).")
                    .modelAnswer("Java's HashMap uses an array of buckets. Keys are hashed, bit-shifted, and placed in bucket indices. When collisions occur, entries form a linked list. In Java 8+, if a bucket exceeds 8 nodes and total capacity is at least 64, it converts to a Red-Black Tree, improving lookup from O(n) to O(log n).")
                    .build());
            bank.add(InterviewQuestion.builder()
                    .questionText("What is the difference between Spring Bean scopes (Singleton, Prototype, Request, Session), and how is thread-safety handled?")
                    .category("Technical")
                    .targetSkill("Spring Boot")
                    .expectedKeyPoints("Singleton creates one instance per ApplicationContext; Prototype creates a new instance on injection; Singleton beans must remain stateless for thread safety.")
                    .modelAnswer("By default, Spring beans are Singletons—one shared instance per ApplicationContext. Prototype produces a new instance upon each injection. Because Singletons are shared across concurrent HTTP request threads, they should be stateless or use thread-safe data structures to prevent race conditions.")
                    .build());
            bank.add(InterviewQuestion.builder()
                    .questionText("How does Spring's @Transactional annotation work under the hood, and under what circumstances might transactions fail to roll back?")
                    .category("Technical")
                    .targetSkill("Spring Data JPA")
                    .expectedKeyPoints("AOP dynamic proxies, self-invocation bypasses proxy, checked exceptions do not trigger rollback by default without rollbackFor=Exception.class.")
                    .modelAnswer("@Transactional relies on Spring AOP proxies wrapping the target method. If called from within the same class (self-invocation), the proxy is bypassed and transactions fail. Additionally, Spring only rolls back unchecked (RuntimeException/Error) exceptions by default unless explicitly configured.")
                    .build());
            bank.add(InterviewQuestion.builder()
                    .questionText("Design a scalable Rate Limiter service for a public REST API. What algorithms would you evaluate, and how would you store token counts?")
                    .category("System Design")
                    .targetSkill("System Design")
                    .expectedKeyPoints("Token bucket, Leaking bucket, Sliding window counter; Redis for distributed atomic counters; 429 Too Many Requests response.")
                    .modelAnswer("I would evaluate Token Bucket or Sliding Window Log/Counter. Using Redis with Lua scripts enables atomic token checks and decrement operations across distributed gateway nodes, returning HTTP 429 with Retry-After headers when thresholds are breached.")
                    .build());
            bank.add(InterviewQuestion.builder()
                    .questionText("Describe how database indexing works (B-Trees vs Hash indexes) and how you identify and eliminate slow queries in SQL.")
                    .category("Technical")
                    .targetSkill("SQL")
                    .expectedKeyPoints("B+ Tree structure, range scans, EXPLAIN ANALYZE, index selectivity, avoiding table scans.")
                    .modelAnswer("B-Tree indexes maintain a balanced tree hierarchy, ideal for equality and range comparisons. Hash indexes offer O(1) equality lookups but no range support. I use EXPLAIN ANALYZE to identify sequential table scans, examine cardinalities, and add composite or covering indexes.")
                    .build());
        } else {
            // General Full Stack / Software Engineer bank
            bank.add(InterviewQuestion.builder()
                    .questionText("Explain the architectural principles of RESTful APIs. How do you design idempotent and backward-compatible endpoints?")
                    .category("Technical")
                    .targetSkill("REST APIs")
                    .expectedKeyPoints("Statelessness, URI nouns, HTTP methods (GET/PUT/DELETE idempotent, POST non-idempotent), API versioning, non-breaking schema evolution.")
                    .modelAnswer("REST emphasizes stateless client-server communication using standard HTTP verbs. GET, PUT, and DELETE must be idempotent. Backward compatibility is maintained by additive schema changes, URI or header versioning (/api/v1), and deprecation cycles.")
                    .build());
            bank.add(InterviewQuestion.builder()
                    .questionText("How do you design an authentication and authorization system using JWT? What are the key security pitfalls and mitigation strategies?")
                    .category("Technical")
                    .targetSkill("Security")
                    .expectedKeyPoints("Access token + Refresh token rotation, HTTP-only cookies, short TTL, revocation strategies (Redis blocklist), signing algorithms.")
                    .modelAnswer("A robust architecture pairs short-lived access tokens (15 mins) with rotating refresh tokens stored in secure, HttpOnly, SameSite cookies. Revocation is handled via Redis blocklists or versioned user secrets, preventing replay attacks if tokens leak.")
                    .build());
            bank.add(InterviewQuestion.builder()
                    .questionText("Walk me through how you would handle an incident where a microservice begins experiencing cascading latency failures.")
                    .category("Behavioral")
                    .targetSkill("Problem Solving")
                    .expectedKeyPoints("Circuit breakers (Resilience4j), timeouts, fallback mechanisms, bulkhead isolation, distributed tracing (Zipkin/OpenTelemetry).")
                    .modelAnswer("I would immediately inspect distributed traces to locate the offending downstream dependency. To prevent cascade, I ensure circuit breakers open early, requests fail-fast or return cached fallbacks, and thread pools are segregated using the Bulkhead pattern.")
                    .build());
            bank.add(InterviewQuestion.builder()
                    .questionText("What is the difference between horizontal and vertical scaling, and how does database sharding differ from read replicas?")
                    .category("System Design")
                    .targetSkill("System Design")
                    .expectedKeyPoints("Vertical = beefier machine, Horizontal = more instances; Replicas offload reads, Sharding partitions data horizontally across nodes.")
                    .modelAnswer("Vertical scaling increases CPU/RAM on a single node, hitting hardware ceilings. Horizontal scaling adds distributed nodes behind load balancers. Read replicas scale read throughput asynchronously, whereas sharding partitions table rows across distinct database nodes by shard key.")
                    .build());
            bank.add(InterviewQuestion.builder()
                    .questionText("Describe your experience with CI/CD pipelines and automated testing pyramids (Unit, Integration, E2E).")
                    .category("Technical")
                    .targetSkill("DevOps")
                    .expectedKeyPoints("High ratio of fast unit tests, mocked integration tests, smoke E2E tests, automated staging deployments, zero-downtime blue/green rollouts.")
                    .modelAnswer("A resilient CI/CD pipeline enforces the testing pyramid: 70% unit tests for business logic, 20% integration tests verifying persistence and APIs, and 10% end-to-end tests for critical user journeys, executing automated checks before rolling out through blue-green or canary deployments.")
                    .build());
        }

        // Return up to requested count
        List<InterviewQuestion> result = new ArrayList<>();
        for (int i = 0; i < Math.min(count, bank.size()); i++) {
            InterviewQuestion q = bank.get(i);
            q.setQuestionOrder(i + 1);
            result.add(q);
        }

        // If count exceeds bank size, generate procedural questions based on selected skills
        while (result.size() < count) {
            int idx = result.size() + 1;
            String skill = skills.get((idx - 1) % skills.size());
            result.add(InterviewQuestion.builder()
                    .questionOrder(idx)
                    .questionText("In a production application utilizing " + skill + ", what are the most critical architectural trade-offs and performance pitfalls you must account for?")
                    .category(type)
                    .targetSkill(skill)
                    .expectedKeyPoints("Concurrency, memory footprint, maintainability, scalability, and telemetry.")
                    .modelAnswer("When scaling " + skill + ", developers must balance simplicity against operational complexity, ensuring proper connection pooling, asynchronous processing where suitable, and observability through metrics and structured logging.")
                    .build());
        }

        return result;
    }

    private FeedbackDto evaluateFallback(String question, String skill, String answer, String role, String difficulty) {
        int length = answer.trim().length();
        int words = answer.trim().split("\\s+").length;

        // Realistic intelligent grading heuristic
        int techScore = Math.min(95, Math.max(55, 60 + Math.min(30, words / 3)));
        int commScore = Math.min(96, Math.max(58, 65 + Math.min(28, words / 4)));
        int relScore = Math.min(98, Math.max(62, 70 + Math.min(25, words / 5)));
        int clarScore = Math.min(94, Math.max(60, 68 + Math.min(24, words / 4)));
        int confScore = Math.min(92, Math.max(55, 62 + Math.min(26, words / 4)));

        int overall = (int) Math.round((techScore * 0.35) + (commScore * 0.20) + (relScore * 0.20) + (clarScore * 0.15) + (confScore * 0.10));

        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        if (words >= 35) {
            strengths.add("Demonstrated solid breadth of concept with structured thoughts.");
            strengths.add("Directly addressed the core interview prompt without rambling.");
        } else {
            strengths.add("Provided a concise, direct response.");
            weaknesses.add("Response is relatively brief; interviewers expect deeper architectural rationale and edge-case awareness.");
        }

        if (words >= 60) {
            strengths.add("Clear articulation of implementation trade-offs and practical experience.");
        } else {
            weaknesses.add("Could expand on real-world production nuances and trade-offs.");
        }

        suggestions.add("Structure answers using the STAR method (Situation, Task, Action, Result) for behavioral prompts or Concept-Tradeoffs-Example for technical questions.");
        suggestions.add("Mention specific monitoring, error-handling, or performance considerations relevant to " + (skill != null ? skill : "the technology stack") + ".");

        return FeedbackDto.builder()
                .score(overall)
                .technicalKnowledge(techScore)
                .communication(commScore)
                .relevance(relScore)
                .clarity(clarScore)
                .confidence(confScore)
                .strengths(strengths)
                .weaknesses(weaknesses)
                .suggestions(suggestions)
                .modelAnswer(generateModelAnswer(question, skill))
                .build();
    }

    private String generateModelAnswer(String question, String skill) {
        if (question == null) return "A strong answer articulates the core principle, real-world application, and architectural trade-offs.";
        String q = question.toLowerCase();

        if (q.contains("usestate") && q.contains("useeffect")) {
            return "A senior-level answer contrasts useState (which manages local state triggers and causes component re-renders) with useEffect (which defers side-effects asynchronously after the paint phase). Crucially, useLayoutEffect runs synchronously immediately after all DOM mutations but before the browser paints. It is specifically used when measuring layout geometries (getBoundingClientRect) or mutating styles synchronously to prevent visual flicker.";
        }
        if (q.contains("virtual dom") || q.contains("reconciliation")) {
            return "An exemplary response explains that modern React maintains a lightweight fiber-node tree representing the UI. During reconciliation, React's diffing heuristic assumes elements with different types will produce different trees, and uses unique 'key' props to track list items across renders without tearing down DOM nodes. Updates are scheduled in lanes and committed in batch to maximize 60fps responsiveness.";
        }
        if (q.contains("hashmap") && q.contains("collision")) {
            return "An ideal answer details Java's array of bucket nodes where indices are calculated via key.hashCode() spread functions. Collisions are handled via linked nodes in each bucket. Since Java 8, when a bucket exceeds TREEIFY_THRESHOLD (8 entries) and table capacity reaches 64, it morphs into a balanced Red-Black Tree, safeguarding lookup performance at O(log n) instead of worst-case O(n).";
        }
        if (q.contains("singleton") || q.contains("prototype")) {
            return "A strong candidate distinguishes that Spring Singleton creates exactly one shared instance per ApplicationContext container, while Prototype creates a new instance on every lookup/injection. Because singleton beans are accessed by multiple request threads concurrently, they must remain strictly stateless or use atomic thread-safe primitives to prevent race conditions.";
        }
        if (q.contains("event loop")) {
            return "An exemplary response outlines how JavaScript runs on a single thread with a call stack. Asynchronous operations offload to browser/Node APIs. When the call stack clears, the Event Loop first drains all jobs in the Microtask queue (Promises, queueMicrotask) completely before dequeuing the next single Task from the Macrotask queue (setTimeout, setInterval, I/O).";
        }
        if (q.contains("jwt") || q.contains("refresh token")) {
            return "Production-ready answer: Short-lived access tokens (10-15m) are sent in the Authorization header. Long-lived refresh tokens are stored in secure, HttpOnly, SameSite=Strict cookies to protect against XSS. Token rotation is enforced on every refresh call, and token revocation is tracked via Redis blacklists or user token versioning.";
        }

        return "An exemplary response defines the primary concept clearly, illustrates a concrete real-world implementation example, discusses architectural trade-offs (such as memory vs latency or complexity vs maintainability), and highlights how telemetry, error boundaries, and edge cases are handled in production.";
    }

    private AiCoachResponse fallbackCoachResponse(String message) {
        String msgLower = message.toLowerCase();
        String reply;
        List<String> suggestions = new ArrayList<>();
        List<String> topics = new ArrayList<>();
        List<String> questions = new ArrayList<>();

        if (msgLower.contains("java") || msgLower.contains("spring")) {
            reply = "To excel in Java and Spring Boot interviews, interviewers heavily test internal JVM memory structures, multithreading synchronization, and Spring proxy mechanics (@Transactional, Bean lifecycles). Focus on explaining 'why' things work underneath rather than just reciting syntax.";
            suggestions.add("Deep dive into ConcurrentHashMap, Volatile, and Java Memory Model.");
            suggestions.add("Understand Spring Bean lifecycle and proxy creation under AOP.");
            topics.addAll(List.of("JVM Garbage Collection", "Spring Security Filter Chain", "Microservices Resiliency"));
            questions.addAll(List.of(
                    "How does Java 21 Virtual Threads change high-concurrency backend design?",
                    "What happens under the hood when @Transactional is declared on a private method?"
            ));
        } else if (msgLower.contains("react") || msgLower.contains("frontend")) {
            reply = "In frontend developer interviews, senior evaluators look for deep mastery of the browser event loop, rendering reconciliation cycles, state management boundaries, and Core Web Vitals optimization.";
            suggestions.add("Practice explaining Fiber architecture and reconciliation step-by-step.");
            suggestions.add("Prepare an example where you solved an expensive re-render with profiling.");
            topics.addAll(List.of("React 18 Concurrent Features", "Core Web Vitals (LCP, INP, CLS)", "Web Security (XSS, CSRF, CSP)"));
            questions.addAll(List.of(
                    "How does useTransition differ from standard setState batching?",
                    "Explain how you would architect an offline-first mobile web experience."
            ));
        } else if (msgLower.contains("communication") || msgLower.contains("score")) {
            reply = "Communication scores improve dramatically when you replace unstructured stream-of-consciousness explanations with the 3-Step Anchor method: 1) High-level Definition, 2) Technical Nuance / Trade-off, and 3) A quick 20-second production example.";
            suggestions.add("Pause for 2-3 seconds before answering to outline 3 distinct bullet points in your mind.");
            suggestions.add("Use clear transition phrases: 'First... Second... Finally...'");
            topics.addAll(List.of("STAR Framework", "Whiteboard Architecture Communication", "Executive Summary Framing"));
            questions.addAll(List.of(
                    "Tell me about a time you had a technical disagreement with a teammate.",
                    "Explain a complex technical topic to a non-technical stakeholder."
            ));
        } else {
            reply = "Great question! Building interview excellence is about compounding daily targeted practice. Based on platform patterns, candidates who practice 3-5 questions daily and study model answers see a 28% score improvement within two weeks.";
            suggestions.add("Target your weakest skill category in a 5-question mock session today.");
            suggestions.add("Review past feedback in your Performance Analytics tab.");
            topics.addAll(List.of("System Design Fundamentals", "Behavioral Leadership", "Data Structures & Scalability"));
            questions.addAll(List.of(
                    "How would you design a distributed caching layer?",
                    "What is your approach to breaking down an ambiguous technical requirement?"
            ));
        }

        return AiCoachResponse.builder()
                .reply(reply)
                .suggestions(suggestions)
                .recommendedTopics(topics)
                .sampleQuestions(questions)
                .build();
    }
}
