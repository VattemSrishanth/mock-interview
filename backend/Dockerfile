# ==========================================
# Multi-stage Dockerfile for Spring Boot 3
# Optimized for Render Cloud Deployment
# ==========================================

# --- Stage 1: Build JAR ---
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Pre-fetch dependencies to leverage Docker layer caching
COPY pom.xml .
RUN mvn dependency:resolve -B || true

# Copy source and package executable artifact
COPY src ./src
RUN mvn clean package -DskipTests -B

# --- Stage 2: Production Polyglot Execution Runtime ---
FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app

# Prevent interactive prompts during apt-get package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install Python 3 and Node.js for Code Sandbox isolated execution
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    nodejs \
    ca-certificates \
    && (test -e /usr/bin/python || ln -s /usr/bin/python3 /usr/bin/python) \
    && rm -rf /var/lib/apt/lists/*

# Create unprivileged application user safely
RUN (groupadd -r appuser || true) && (useradd -r -g appuser appuser || true)

# Copy artifact from build stage
COPY --from=build --chown=appuser:appuser /app/target/*.jar app.jar

USER appuser

# Render dynamically injects the PORT environment variable (default fallback 8080)
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE ${PORT}

# Container-aware memory tuning to prevent OOM kills on 512MB RAM instances
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT} -jar app.jar"]
