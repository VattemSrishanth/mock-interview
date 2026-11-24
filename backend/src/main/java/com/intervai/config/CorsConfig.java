package com.intervai.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Configuration
public class CorsConfig {

    private final List<String> allowedOrigins;
    private final List<String> allowedOriginPatterns;

    public CorsConfig(@Value("${app.cors.allowed-origins:}") String configuredOrigins) {
        List<String> origins = new ArrayList<>();
        List<String> patterns = new ArrayList<>();

        try {
            if (configuredOrigins != null && !configuredOrigins.isBlank()) {
                for (String raw : configuredOrigins.split(",")) {
                    String trimmed = raw.trim();
                    if (trimmed.isEmpty()) continue;
                    if (trimmed.contains("*")) {
                        patterns.add(trimmed);
                    } else {
                        try {
                            origins.add(normalizeOrigin(trimmed));
                        } catch (Exception ignored) {
                            patterns.add(trimmed);
                        }
                    }
                }
            }
        } catch (Throwable t) {
            // Absolute fail-safe: prevent any deployment failure on cloud hosts
            patterns.add("https://*.onrender.com");
        }

        // Guaranteed resilient origins for zero-downtime cloud and local development
        if (!patterns.contains("https://*.vercel.app")) {
            patterns.add("https://*.vercel.app");
        }
        if (!patterns.contains("https://*.onrender.com")) {
            patterns.add("https://*.onrender.com");
        }
        if (origins.isEmpty()) {
            origins.add("http://localhost:5173");
            origins.add("http://localhost:3000");
        }

        this.allowedOrigins = origins.stream().distinct().toList();
        this.allowedOriginPatterns = patterns.stream().distinct().toList();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        if (!allowedOrigins.isEmpty()) {
            configuration.setAllowedOrigins(allowedOrigins);
        }
        if (!allowedOriginPatterns.isEmpty()) {
            configuration.setAllowedOriginPatterns(allowedOriginPatterns);
        }
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private static String normalizeOrigin(String value) {
        URI uri = URI.create(value);
        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
        String path = uri.getRawPath();
        if ((!"http".equals(scheme) && !"https".equals(scheme))
                || uri.getHost() == null
                || uri.getRawAuthority() == null
                || uri.getRawUserInfo() != null
                || uri.getRawQuery() != null
                || uri.getRawFragment() != null
                || (path != null && !path.isEmpty() && !"/".equals(path))) {
            throw new IllegalArgumentException("CORS entries must be origins only, such as https://app.example.com");
        }
        return scheme + "://" + uri.getRawAuthority();
    }
}
