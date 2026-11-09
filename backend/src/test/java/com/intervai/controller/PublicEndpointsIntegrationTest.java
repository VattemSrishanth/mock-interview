package com.intervai.controller;

import com.intervai.Application;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = Application.class)
@AutoConfigureMockMvc
class PublicEndpointsIntegrationTest {

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("JWT_SECRET", () -> "AxQlNktdZHp7gJmipaqzvL3G0e7x9PYOFCUmKzRNSEs=");
        registry.add("spring.datasource.url", () -> "jdbc:h2:mem:public-endpoints-test;DB_CLOSE_DELAY=-1");
        registry.add("spring.datasource.driver-class-name", () -> "org.h2.Driver");
        registry.add("spring.datasource.username", () -> "sa");
        registry.add("spring.datasource.password", () -> "");
    }

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getHealthEndpointReturnsOkAndRuntimeMetrics() throws Exception {
        mockMvc.perform(get("/api/v1/health").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", notNullValue()))
                .andExpect(jsonPath("$.jvmVersion", notNullValue()))
                .andExpect(jsonPath("$.uptimeSeconds", greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.memory.totalMb", greaterThan(0)))
                .andExpect(jsonPath("$.services.database", notNullValue()));
    }

    @Test
    void getPublicInterviewTipsReturnsCategorizedList() throws Exception {
        mockMvc.perform(get("/api/interviews/public/tips").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(4))))
                .andExpect(jsonPath("$[0].category", notNullValue()))
                .andExpect(jsonPath("$[0].title", notNullValue()))
                .andExpect(jsonPath("$[0].keyPoints", not(empty())));
    }
}
