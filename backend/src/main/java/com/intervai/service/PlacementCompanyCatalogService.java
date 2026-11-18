package com.intervai.service;

import com.intervai.dto.PlacementCompanyTemplateDto;
import com.intervai.entity.PlacementCompanyTier;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * In-memory catalog of pre-calibrated campus placement drive templates
 * covering Tier-1 FAANG, Tier-2 Product Unicorns, and Tier-3 Enterprise IT Services.
 */
@Service
public class PlacementCompanyCatalogService {

    private final List<PlacementCompanyTemplateDto> catalog = new ArrayList<>();

    public PlacementCompanyCatalogService() {
        initCatalog();
    }

    private void initCatalog() {
        catalog.add(PlacementCompanyTemplateDto.builder()
                .companyName("Google")
                .slug("google-swe")
                .tier(PlacementCompanyTier.TIER_1_PRODUCT)
                .logoKey("google")
                .targetRole("Software Engineer (Campus / Early Career)")
                .primaryFocus("Algorithmic Efficiency, Graph & Tree Traversals, Distributed System Foundations, Googliness")
                .averagePackageLpa("35 - 55 LPA")
                .roundsCount(4)
                .roundNames(List.of("Online Assessment (DSA)", "Technical Round 1 (Algorithms)", "Technical Round 2 (Data Structures & Edge Cases)", "Googliness & Leadership"))
                .commonTopics(List.of("Dynamic Programming", "Dijkstra / Shortest Path", "Trie & Segment Trees", "Concurrency", "STAR Leadership"))
                .cutOffPercentage(82.0)
                .isFeatured(true)
                .recruiterProTip("Always verbalize time and space complexity before writing a single line of code. Write modular helper functions.")
                .build());

        catalog.add(PlacementCompanyTemplateDto.builder()
                .companyName("Amazon")
                .slug("amazon-sde1")
                .tier(PlacementCompanyTier.TIER_1_PRODUCT)
                .logoKey("amazon")
                .targetRole("Software Development Engineer I")
                .primaryFocus("Data Structures, Scalable LLD, Amazon 16 Leadership Principles (Customer Obsession, Ownership)")
                .averagePackageLpa("30 - 45 LPA")
                .roundsCount(4)
                .roundNames(List.of("OA Debugging & Coding", "Technical Problem Solving (Arrays/Trees)", "Object-Oriented Design (LLD)", "Bar Raiser & Behavioral Leadership"))
                .commonTopics(List.of("Binary Search & Two Pointers", "Hash Maps & Heaps", "Design Parking Lot / LRU Cache", "Customer Obsession STAR"))
                .cutOffPercentage(80.0)
                .isFeatured(true)
                .recruiterProTip("Every behavioral question requires a crisp STAR response showing customer impact with quantifiable metrics.")
                .build());

        catalog.add(PlacementCompanyTemplateDto.builder()
                .companyName("Microsoft")
                .slug("microsoft-swe")
                .tier(PlacementCompanyTier.TIER_1_PRODUCT)
                .logoKey("microsoft")
                .targetRole("Software Engineer (University Placement)")
                .primaryFocus("Clean Code Quality, System Design Basics, Trees/Linked Lists, Growth Mindset")
                .averagePackageLpa("28 - 48 LPA")
                .roundsCount(3)
                .roundNames(List.of("Codility Coding Round", "Technical Problem Solving & Refactoring", "System Design & Culture Fit"))
                .commonTopics(List.of("Tree Serialization", "Recursion & Backtracking", "REST API Design", "Growth Mindset Examples"))
                .cutOffPercentage(78.0)
                .isFeatured(true)
                .recruiterProTip("Emphasize testability, clean variable naming, and handling null/empty/boundary edge cases gracefully.")
                .build());

        catalog.add(PlacementCompanyTemplateDto.builder()
                .companyName("Swiggy / Zomato")
                .slug("foodtech-fullstack")
                .tier(PlacementCompanyTier.TIER_2_GROWTH)
                .logoKey("swiggy")
                .targetRole("Associate SDE (Backend / Full Stack)")
                .primaryFocus("Microservices, Redis Caching, PostgreSQL Indexing, Kafka Event Streaming, React/Node/Java")
                .averagePackageLpa("18 - 28 LPA")
                .roundsCount(3)
                .roundNames(List.of("Machine Coding Round", "System Architecture & DB Optimization", "Culture & Problem Solving"))
                .commonTopics(List.of("Rate Limiting", "Order State Machine", "DB Indexing & Locking", "Low-Latency REST APIs"))
                .cutOffPercentage(75.0)
                .isFeatured(false)
                .recruiterProTip("They value working machine coding skills—implementing functional code with clean domain models within 90 minutes.")
                .build());

        catalog.add(PlacementCompanyTemplateDto.builder()
                .companyName("TCS Digital / Prime")
                .slug("tcs-digital")
                .tier(PlacementCompanyTier.TIER_3_ENTERPRISE)
                .logoKey("tcs")
                .targetRole("System Engineer (Digital / Prime Cadre)")
                .primaryFocus("Core Java / Python, OOP Concepts, SQL Joins, Cloud & GenAI Awareness, Managerial Fit")
                .averagePackageLpa("7 - 9.5 LPA")
                .roundsCount(2)
                .roundNames(List.of("National Qualifier Test (NQT) Technical", "Technical + Managerial + HR Interview"))
                .commonTopics(List.of("OOP Principles (Polymorphism, Abstraction)", "SQL Group By & Subqueries", "Data Structures Basics", "Final Year Project Deep-Dive"))
                .cutOffPercentage(68.0)
                .isFeatured(true)
                .recruiterProTip("Know every architectural detail of your academic and hackathon projects. Explain your individual contribution confidently.")
                .build());

        catalog.add(PlacementCompanyTemplateDto.builder()
                .companyName("Infosys SP (Specialist Programmer)")
                .slug("infosys-sp")
                .tier(PlacementCompanyTier.TIER_3_ENTERPRISE)
                .logoKey("infosys")
                .targetRole("Specialist Programmer (Power Programmer)")
                .primaryFocus("Advanced Competitive Programming, Dynamic Programming, Greedy Algorithms, Graph Theory")
                .averagePackageLpa("9.5 - 12 LPA")
                .roundsCount(2)
                .roundNames(List.of("HackWithInfy Coding Round", "Advanced Technical Discussion"))
                .commonTopics(List.of("Segment Trees", "Shortest Path / BFS", "Dynamic Programming on Trees", "System Fundamentals"))
                .cutOffPercentage(72.0)
                .isFeatured(false)
                .recruiterProTip("The SP round is deeply algorithmic. Focus on optimal Big-O time complexity and avoiding TLE.")
                .build());
    }

    public List<PlacementCompanyTemplateDto> getAllTemplates() {
        return new ArrayList<>(catalog);
    }

    public List<PlacementCompanyTemplateDto> getTemplatesByTier(PlacementCompanyTier tier) {
        return catalog.stream()
                .filter(t -> t.getTier() == tier)
                .toList();
    }

    public Optional<PlacementCompanyTemplateDto> getTemplateBySlug(String slug) {
        if (slug == null) return Optional.empty();
        return catalog.stream()
                .filter(t -> t.getSlug().equalsIgnoreCase(slug))
                .findFirst();
    }
}
