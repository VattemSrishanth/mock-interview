# ==========================================
# Root Dockerfile for Spring Boot 3 Backend
# Supports Render Deployments from Repo Root
# ==========================================

# --- Stage 1: Build JAR ---
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cap Maven heap to 512MB to prevent OOM kills on Render build instances
ENV MAVEN_OPTS="-Xmx512m -XX:+TieredCompilation -XX:TieredStopAtLevel=1"

# Pre-fetch dependencies
COPY backend/pom.xml .
RUN mvn dependency:resolve -B || true

# Copy source and package executable artifact
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# --- Stage 2: Production Polyglot Execution Runtime ---
FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app

ENV DEBIAN_FRONTEND=noninteractive

# Install Python 3 and Node.js for Code Sandbox isolated execution
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    nodejs \
    ca-certificates \
    && (test -e /usr/bin/python || ln -s /usr/bin/python3 /usr/bin/python) \
    && rm -rf /var/lib/apt/lists/*

# Copy artifact from build stage
COPY --from=build /app/target/*.jar app.jar

ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE ${PORT}

ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT} -jar app.jar"]
