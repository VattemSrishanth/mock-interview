# ==========================================
# Multi-stage Dockerfile for Spring Boot 3
# Optimized for Render Cloud Deployment
# ==========================================

# --- Stage 1: Build JAR ---
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Pre-fetch dependencies to leverage Docker layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source and package executable artifact
COPY src ./src
RUN mvn clean package -DskipTests

# --- Stage 2: Minimal Production JRE Runtime ---
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Create unprivileged application user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Prepare writable storage directory for H2 database fallback
RUN mkdir -p /app/data && chown -R appuser:appuser /app

# Copy artifact from build stage
COPY --from=build --chown=appuser:appuser /app/target/*.jar app.jar

USER appuser

# Render dynamically injects the PORT environment variable (default fallback 8080)
ENV PORT=8080
EXPOSE ${PORT}

# Container-aware memory tuning to prevent OOM kills on 512MB RAM instances
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT} -jar app.jar"]
