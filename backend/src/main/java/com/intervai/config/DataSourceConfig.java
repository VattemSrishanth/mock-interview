package com.intervai.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Resilient DataSource configuration for Cloud Deployments (Render, Heroku, AWS, Railway).
 * Automatically parses cloud database URIs (postgres:// or postgresql://) into JDBC format,
 * enforces SSL, manages connection pool sizing, and provides safe embedded H2 fallback.
 */
@Configuration
@Slf4j
public class DataSourceConfig {

    @Value("${spring.datasource.url:}")
    private String rawUrl;

    @Value("${spring.datasource.username:}")
    private String username;

    @Value("${spring.datasource.password:}")
    private String password;

    @Value("${DATABASE_URL:}")
    private String envDatabaseUrl;

    @Bean
    @Primary
    public DataSource dataSource() {
        String dbUrl = rawUrl;
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = envDatabaseUrl;
        }

        // Fallback to embedded H2 database if no SQL instance URL is configured
        if (dbUrl == null || dbUrl.isBlank()) {
            log.info("No cloud SQL datasource configured; activating embedded H2 database for zero-downtime startup.");
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl("jdbc:h2:file:/tmp/intervaidb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE");
            config.setDriverClassName("org.h2.Driver");
            config.setUsername("sa");
            config.setPassword("");
            config.setMaximumPoolSize(5);
            return new HikariDataSource(config);
        }

        // Handle standard cloud postgres:// or postgresql:// URIs
        String user = username;
        String pass = password;
        if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
            try {
                URI uri = new URI(dbUrl);
                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath();
                if (uri.getUserInfo() != null && !uri.getUserInfo().isBlank()) {
                    String[] parts = uri.getUserInfo().split(":", 2);
                    user = parts[0];
                    if (parts.length > 1) {
                        pass = parts[1];
                    }
                }
                dbUrl = "jdbc:postgresql://" + host + ":" + port + path + "?sslmode=require";
                log.info("Converted cloud PostgreSQL URI to JDBC format for host: {}", host);
            } catch (Exception e) {
                log.warn("Failed to parse database URI; falling back to jdbc: prefix: {}", e.getMessage());
                if (!dbUrl.startsWith("jdbc:")) {
                    dbUrl = "jdbc:" + dbUrl;
                }
            }
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(dbUrl);
        if (user != null && !user.isBlank()) config.setUsername(user);
        if (pass != null) config.setPassword(pass);

        if (dbUrl.contains("postgresql")) {
            config.setDriverClassName("org.postgresql.Driver");
        } else if (dbUrl.contains("h2")) {
            config.setDriverClassName("org.h2.Driver");
        }

        // Connection pool tuning for 512MB RAM free-tier instances
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setConnectionTimeout(15000);
        config.setIdleTimeout(300000);
        config.setMaxLifetime(600000);

        return new HikariDataSource(config);
    }
}
