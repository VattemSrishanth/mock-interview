package com.intervai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intervai.dto.ResumeParseResponse;
import com.intervai.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.encryption.AccessPermission;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeParserService {

    private final ObjectMapper objectMapper;
    private final AiService aiService;

    private static final List<String> COMMON_SKILLS = List.of(
            // Languages & Frameworks
            "Java", "Spring Boot", "Spring Security", "Spring Data JPA", "Hibernate", "Python", "Django", "FastAPI",
            "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Express", "Angular", "Vue.js", "HTML", "CSS", "Tailwind CSS",
            "C++", "C#", ".NET", "Go", "Rust", "PHP",
            // Databases & Cache
            "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "DynamoDB", "Cassandra",
            // Cloud, DevOps & Tools
            "AWS", "Docker", "Kubernetes", "Linux", "Git", "CI/CD", "Terraform", "Jenkins", "Azure", "GCP",
            // Architecture & Messaging
            "Microservices", "REST APIs", "GraphQL", "Kafka", "RabbitMQ", "System Design", "Distributed Systems", "Concurrency",
            // AI, ML & Data
            "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "Scikit-Learn", "Pandas", "NumPy", "Apache Spark", "MLOps",
            // CS Fundamentals
            "Data Structures", "Algorithms", "Object-Oriented Programming", "Design Patterns"
    );

    public ResumeParseResponse parseResumeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded resume file cannot be empty");
        }

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        String extractedText;

        try {
            if (filename.endsWith(".pdf")) {
                extractedText = extractTextFromPdf(file);
            } else if (filename.endsWith(".txt") || filename.endsWith(".md") || filename.endsWith(".rtf") || filename.endsWith(".csv")) {
                extractedText = new String(file.getBytes(), StandardCharsets.UTF_8);
            } else {
                // Try PDF extraction first, then fallback to text bytes
                try {
                    extractedText = extractTextFromPdf(file);
                } catch (Exception ex) {
                    extractedText = new String(file.getBytes(), StandardCharsets.UTF_8);
                }
            }
        } catch (BadRequestException bre) {
            throw bre;
        } catch (Exception e) {
            log.error("Failed to read resume file: {}", e.getMessage(), e);
            throw new BadRequestException("Could not extract readable text from resume. Please verify the file is not corrupted or password-protected.");
        }

        if (!StringUtils.hasText(extractedText) || extractedText.trim().length() < 25) {
            throw new BadRequestException("No readable text found in this document. If your resume is a scanned image or photo, please upload a text-based PDF or paste your resume text directly.");
        }

        return analyzeResumeText(extractedText.trim());
    }

    public ResumeParseResponse analyzeResumeText(String rawText) {
        if (!StringUtils.hasText(rawText)) {
            throw new BadRequestException("Resume text cannot be blank.");
        }

        // Limit raw text to first ~12,000 characters to keep prompts performant and avoid token overflow
        String sanitizedText = rawText.length() > 12000 ? rawText.substring(0, 12000) : rawText;

        if (aiService.hasActiveAiKey()) {
            try {
                return parseViaLlm(sanitizedText);
            } catch (Exception e) {
                log.warn("AI resume analysis failed, falling back to intelligent heuristic parser: {}", e.getMessage());
            }
        }

        return parseViaHeuristics(sanitizedText);
    }

    private String extractTextFromPdf(MultipartFile file) throws Exception {
        byte[] bytes = file.getBytes();
        try (PDDocument document = Loader.loadPDF(bytes)) {
            if (document.isEncrypted()) {
                AccessPermission ap = document.getCurrentAccessPermission();
                if (!ap.canExtractContent()) {
                    throw new BadRequestException("This PDF is encrypted and content extraction is restricted. Please upload an unprotected copy or paste the text.");
                }
            }
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            return stripper.getText(document);
        }
    }

    private ResumeParseResponse parseViaLlm(String resumeText) throws Exception {
        String prompt = "You are an expert technical recruiter and resume analyzer. Analyze the following candidate resume text and extract structured information strictly in JSON format without markdown code blocks:\n"
                + "{\n"
                + "  \"candidateName\": \"Candidate full name or empty string\",\n"
                + "  \"suggestedRole\": \"Best fitting technical job role (e.g. Backend Developer, Frontend Developer, Full Stack Developer, DevOps Engineer, Data Engineer, Machine Learning Engineer, Software Engineer)\",\n"
                + "  \"experienceLevel\": \"Fresher | Junior | Mid-level | Senior\",\n"
                + "  \"detectedSkills\": [\"Skill1\", \"Skill2\", ...],\n"
                + "  \"keyProjects\": [\"Project1 Name and brief summary\", \"Project2 Name\"],\n"
                + "  \"summary\": \"Concise 2-sentence executive summary of the candidate's profile\"\n"
                + "}\n\n"
                + "RESUME TEXT:\n" + resumeText;

        String jsonText = aiService.executePrompt(prompt, true);
        return parseJsonResponse(jsonText, resumeText);
    }

    private ResumeParseResponse parseJsonResponse(String jsonText, String originalText) {
        try {
            String cleanJson = jsonText.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            } else if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();

            JsonNode node = objectMapper.readTree(cleanJson);
            List<String> skills = new ArrayList<>();
            if (node.has("detectedSkills") && node.get("detectedSkills").isArray()) {
                node.get("detectedSkills").forEach(s -> {
                    String str = s.asText().trim();
                    if (!str.isEmpty() && !skills.contains(str)) skills.add(str);
                });
            }

            List<String> projects = new ArrayList<>();
            if (node.has("keyProjects") && node.get("keyProjects").isArray()) {
                node.get("keyProjects").forEach(p -> {
                    String str = p.asText().trim();
                    if (!str.isEmpty()) projects.add(str);
                });
            }

            // Normalise experience level
            String expLevel = normalizeExperience(node.path("experienceLevel").asText("Mid-level"));

            return ResumeParseResponse.builder()
                    .rawText(originalText)
                    .candidateName(node.path("candidateName").asText("").trim())
                    .suggestedRole(node.path("suggestedRole").asText("Software Engineer").trim())
                    .experienceLevel(expLevel)
                    .detectedSkills(skills.isEmpty() ? extractSkillsHeuristically(originalText) : skills)
                    .keyProjects(projects)
                    .summary(node.path("summary").asText("Profile parsed successfully from candidate resume.").trim())
                    .wordCount(countWords(originalText))
                    .build();
        } catch (Exception e) {
            log.warn("Failed to parse JSON response from AI provider, using heuristic fallback: {}", e.getMessage());
            return parseViaHeuristics(originalText);
        }
    }

    private ResumeParseResponse parseViaHeuristics(String resumeText) {
        List<String> detectedSkills = extractSkillsHeuristically(resumeText);
        String suggestedRole = determineRoleFromSkills(detectedSkills, resumeText);
        String experienceLevel = determineExperienceLevel(resumeText);
        String candidateName = extractNameCandidate(resumeText);
        List<String> keyProjects = extractProjectSnippets(resumeText);

        String summary = String.format("Candidate with primary proficiency in %s. Evaluated as a strong match for %s position (%s).",
                detectedSkills.stream().limit(5).collect(Collectors.joining(", ")),
                suggestedRole,
                experienceLevel);

        return ResumeParseResponse.builder()
                .rawText(resumeText)
                .candidateName(candidateName)
                .suggestedRole(suggestedRole)
                .experienceLevel(experienceLevel)
                .detectedSkills(detectedSkills)
                .keyProjects(keyProjects)
                .summary(summary)
                .wordCount(countWords(resumeText))
                .build();
    }

    private List<String> extractSkillsHeuristically(String text) {
        String lower = text.toLowerCase();
        List<String> found = new ArrayList<>();
        for (String skill : COMMON_SKILLS) {
            Pattern pattern = Pattern.compile("\\b" + Pattern.quote(skill.toLowerCase()) + "\\b");
            if (pattern.matcher(lower).find()) {
                found.add(skill);
            }
        }
        if (found.isEmpty()) {
            found.addAll(List.of("Problem Solving", "Software Engineering", "REST APIs", "Git"));
        }
        return found;
    }

    private String determineRoleFromSkills(List<String> skills, String text) {
        String lower = text.toLowerCase();
        if (lower.contains("machine learning") || lower.contains("deep learning") || lower.contains("pytorch") || lower.contains("tensorflow")) {
            return "Machine Learning Engineer";
        }
        if (lower.contains("devops") || lower.contains("kubernetes") || lower.contains("terraform") || lower.contains("ci/cd")) {
            return "DevOps Engineer";
        }
        if (lower.contains("react") && (lower.contains("java") || lower.contains("node") || lower.contains("spring") || lower.contains("python"))) {
            return "Full Stack Developer";
        }
        if (lower.contains("react") || lower.contains("vue") || lower.contains("angular") || lower.contains("css") || lower.contains("frontend")) {
            return "Frontend Developer";
        }
        if (lower.contains("spring") || lower.contains("django") || lower.contains("sql") || lower.contains("backend") || lower.contains("microservices")) {
            return "Backend Developer";
        }
        if (lower.contains("data engineer") || lower.contains("spark") || lower.contains("kafka") || lower.contains("hadoop")) {
            return "Data Engineer";
        }
        return "Software Engineer";
    }

    private String determineExperienceLevel(String text) {
        String lower = text.toLowerCase();
        if (lower.contains("senior") || lower.contains("lead") || lower.contains("principal") || lower.contains("architect")) {
            return "Senior";
        }
        if (lower.contains("intern") || lower.contains("student") || lower.contains("fresher") || lower.contains("graduate") || lower.contains("b.tech") || lower.contains("bachelor")) {
            return "Fresher";
        }
        Matcher m = Pattern.compile("(\\d+)\\+?\\s*years?\\s+(?:of\\s+)?experience").matcher(lower);
        if (m.find()) {
            int yrs = Integer.parseInt(m.group(1));
            if (yrs >= 5) return "Senior";
            if (yrs >= 2) return "Mid-level";
            if (yrs >= 1) return "Junior";
        }
        return "Mid-level";
    }

    private String normalizeExperience(String exp) {
        String lower = exp.toLowerCase();
        if (lower.contains("senior") || lower.contains("5+")) return "Senior";
        if (lower.contains("mid") || lower.contains("3-5") || lower.contains("2-4")) return "Mid-level";
        if (lower.contains("junior") || lower.contains("1-2") || lower.contains("1-3")) return "Junior";
        if (lower.contains("fresh") || lower.contains("0-1")) return "Fresher";
        return "Mid-level";
    }

    private String extractNameCandidate(String text) {
        String[] lines = text.split("\\r?\\n");
        for (String line : lines) {
            String clean = line.trim();
            // Remove pipe / dash separators (e.g. "V Srishanth | Software Engineer" -> "V Srishanth")
            if (clean.contains("|")) clean = clean.substring(0, clean.indexOf('|')).trim();
            if (clean.contains("-") && clean.indexOf('-') > 3) clean = clean.substring(0, clean.indexOf('-')).trim();

            if (clean.length() >= 3 && clean.length() <= 35 && clean.matches("^[A-Z][a-zA-Z\\s\\.]+$")) {
                String lower = clean.toLowerCase();
                if (!lower.contains("resume") && !lower.contains("curriculum") && !lower.contains("profile") &&
                    !lower.contains("summary") && !lower.contains("experience") && !lower.contains("education") &&
                    !lower.contains("contact") && !lower.contains("skills")) {
                    return clean;
                }
            }
        }
        return "";
    }

    private List<String> extractProjectSnippets(String text) {
        List<String> projects = new ArrayList<>();
        Pattern projectPattern = Pattern.compile("(?i)(?:projects?|key projects?|selected projects?)\\s*[:\\n]([\\s\\S]{40,700}?)(?=\\n\\s*[A-Z][A-Z\\s]{3,}:|\\Z)");
        Matcher matcher = projectPattern.matcher(text);
        if (matcher.find()) {
            String block = matcher.group(1);
            String[] lines = block.split("\\r?\\n");
            for (String line : lines) {
                String clean = line.replaceAll("^[•\\-*\\d\\.\\s]+", "").trim();
                if (clean.length() > 15 && clean.length() < 130 && !clean.toLowerCase().startsWith("technologies")) {
                    projects.add(clean);
                    if (projects.size() >= 3) break;
                }
            }
        }
        return projects;
    }

    private int countWords(String text) {
        if (!StringUtils.hasText(text)) return 0;
        return text.trim().split("\\s+").length;
    }
}
