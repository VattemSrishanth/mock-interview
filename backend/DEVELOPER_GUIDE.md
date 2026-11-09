# IntervAI Backend Developer & Verification Guide

This guide details architecture, local developer workflows, automated test execution, and core REST API contracts for the `intervai-backend` service.

---

## 🚀 Quick Start & Local Execution

### Prerequisites
- **Java**: 21 (JDK 21 LTS)
- **Maven**: Maven 3.9+ (bundled via Maven Wrapper `mvnw.cmd` / `./mvnw`)

### Running Locally with Dev Profile (H2 In-Memory)
```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE="dev"
$env:JWT_SECRET="AxQlNktdZHp7gJmipaqzvL3G0e7x9PYOFCUmKzRNSEs="
.\mvnw.cmd spring-boot:run
```
- Server starts on: **`http://localhost:8080`**
- H2 Web Console: **`http://localhost:8080/h2-console`** (`jdbc:h2:file:./data/intervaidb`, user `sa`, empty password)

---

## 🧪 Automated Testing & Regression Suites

Run automated unit and integration tests using the Maven wrapper:

### Run All Unit & Integration Tests
```powershell
.\mvnw.cmd test
```

### Run Public Endpoints Integration Test
Validates that unauthenticated endpoints (`/api/v1/health`, `/api/interviews/public/tips`) are publicly accessible and return 200 with complete metrics:
```powershell
.\mvnw.cmd test -Dtest=PublicEndpointsIntegrationTest
```

### Run Full Production Security Verification
Validates security headers, CORS origin restrictions, and JWT filter logic:
```powershell
.\mvnw.cmd test -Dtest=ProductionSecurityIntegrationTest
```

### Full Clean Packaging Verification
```powershell
.\mvnw.cmd clean verify
```

---

## 📡 Core API Contract Catalog

### Public Endpoints (No JWT Required)
| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/v1/health` | `GET` | System health, JVM memory metrics, active profile, and database connectivity |
| `/api/interviews/public/tips` | `GET` | Structured preparation rubrics (STAR behavioral, system design, coding, speech delivery) |
| `/api/skills/public` | `GET` | Catalog of engineering tracks and verified skill tags |
| `/api/tts/personas` | `GET` | Realistic interviewer voice personas and calibration settings |
| `/api/auth/register` | `POST` | Register a new candidate account |
| `/api/auth/login` | `POST` | Authenticate and retrieve bearer JWT token |

### Authenticated Endpoints (Bearer JWT Required)
| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/interviews` | `POST` | Create adaptive interview simulation session |
| `/api/interviews/{id}` | `GET` | Retrieve session questions and state |
| `/api/interviews/{id}/answer` | `POST` | Submit question response for real-time 5-D evaluation |
| `/api/interviews/{id}/result` | `GET` | Fetch finalized performance scorecard & radar metrics |
| `/api/ai/coach` | `POST` | Career coach contextual conversation drawer |
| `/api/code/execute` | `POST` | Sandboxed multi-language code runner with validation |

---

## 🐳 Containerization & Packaging

### Build Production JAR
```powershell
.\mvnw.cmd package -DskipTests
```
Artifact generated at: `target/backend-1.0.0.jar`

### Docker Image Build
```powershell
docker build -t intervai-backend:latest .
docker run -p 8080:8080 -e JWT_SECRET="your-32-byte-secret" intervai-backend:latest
```
