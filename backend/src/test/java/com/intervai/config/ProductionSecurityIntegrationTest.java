package com.intervai.config;

import com.intervai.Application;
import com.intervai.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = Application.class)
@AutoConfigureMockMvc
@ActiveProfiles("prod")
class ProductionSecurityIntegrationTest {
    private static final String ORIGINS = "https://frontend.example.com,http://localhost:5173,http://127.0.0.1:5173";

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("JWT_SECRET", () -> "AxQlNktdZHp7gJmipaqzvL3G0e7x9PYOFCUmKzRNSEs=");
        registry.add("CORS_ALLOWED_ORIGINS", () -> ORIGINS);
        registry.add("ADMIN_EMAIL", () -> "configured-admin@example.com");
        registry.add("ADMIN_PASSWORD", () -> "Configured-Admin-Password-2026");
        registry.add("app.ai.rate-limit.max-requests", () -> "2");
        registry.add("app.ai.rate-limit.window-seconds", () -> "60");
        registry.add("spring.datasource.url", () -> "jdbc:h2:mem:production-security-tests;DB_CLOSE_DELAY=-1");
        registry.add("spring.datasource.driver-class-name", () -> "org.h2.Driver");
        registry.add("spring.datasource.username", () -> "sa");
        registry.add("spring.datasource.password", () -> "");
    }

    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired @Qualifier("corsConfigurationSource") CorsConfigurationSource corsSource;
    @Autowired Environment environment;

    @Test
    void productionDisablesConsoleSkipsDemoAccountsAndKeepsConfiguredAdmin() {
        assertEquals("false", environment.getProperty("spring.h2.console.enabled"));
        assertEquals("false", environment.getProperty("spring.h2.console.settings.web-allow-others"));
        assertFalse(users.existsByEmail("admin@intervai.com"));
        assertFalse(users.existsByEmail("srishanth@intervai.com"));
        assertTrue(users.existsByEmail("configured-admin@example.com"));

        CorsConfiguration cors = corsSource.getCorsConfiguration(new org.springframework.mock.web.MockHttpServletRequest("GET", "/api/test"));
        assertNotNull(cors);
        assertEquals(java.util.List.of("https://frontend.example.com", "http://localhost:5173", "http://127.0.0.1:5173"), cors.getAllowedOrigins());
        assertFalse(cors.getAllowCredentials());
        assertNull(cors.checkOrigin("https://attacker.example"));
    }

    @Test
    void registrationLoginAndAdminRoleAuthorizationRemainAvailable() throws Exception {
        String registration = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Security Test","email":"security-test@example.com","password":"test-password"}
                                """))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String userToken = new com.fasterxml.jackson.databind.ObjectMapper().readTree(registration).get("token").asText();

        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"security-test@example.com\",\"password\":\"test-password\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.token").isNotEmpty());
        mvc.perform(get("/api/admin/stats").header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());

        String adminLogin = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"configured-admin@example.com\",\"password\":\"Configured-Admin-Password-2026\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn().getResponse().getContentAsString();
        String adminToken = new com.fasterxml.jackson.databind.ObjectMapper().readTree(adminLogin).get("token").asText();
        mvc.perform(get("/api/admin/stats").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"security-test@example.com\",\"password\":\"wrong-password\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void coachRejectsInvalidMessagesWithoutSpendingQuotaThenReturns429() throws Exception {
        String login = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"configured-admin@example.com\",\"password\":\"Configured-Admin-Password-2026\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String token = new com.fasterxml.jackson.databind.ObjectMapper().readTree(login).get("token").asText();

        mvc.perform(post("/api/ai/coach").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"message\":\"  \"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/ai/coach").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"message\":\"" + "x".repeat(2001) + "\"}"))
                .andExpect(status().isBadRequest());

        String valid = "{\"message\":\"Help me prepare for a Java interview\"}";
        mvc.perform(post("/api/ai/coach").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(valid))
                .andExpect(status().isOk());
        mvc.perform(post("/api/ai/coach").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(valid))
                .andExpect(status().isOk());
        mvc.perform(post("/api/ai/coach").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(valid))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void unauthenticatedRequestsCannotUseProtectedAiEndpoints() throws Exception {
        mvc.perform(post("/api/ai/coach").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"Help me prepare\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/interviews/1/answer").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"questionId\":1,\"answerText\":\"An answer\"}"))
                .andExpect(status().isUnauthorized());
    }
}
