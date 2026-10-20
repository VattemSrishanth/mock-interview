# IntervAI - AI-Powered Mock Interview Platform

An enterprise-grade, full-stack AI interview preparation platform designed for software engineers, students, and job seekers. Practice realistic interviews with real-time speech-to-text, adaptive follow-up questioning, 5-dimensional evaluation rubrics, and personalized performance analytics.

---

## 🚀 Architecture & Tech Stack

### Frontend (`/frontend`)
- **Core**: React 18, Vite 5, React Router DOM 6
- **Styling**: Tailwind CSS 3, Glassmorphism, Dark Mode Theme
- **State & Data**: React Context (`AuthContext`), Axios with JWT Interceptor
- **Audio & Speech**: Web Speech Recognition API, SpeechSynthesis TTS, Animated Audio Waveform
- **Visualizations**: Recharts (Radar, Area, Bar charts), Canvas Confetti
- **Icons**: Lucide React

### Backend (`/backend`)
- **Framework**: Java 21, Spring Boot 3.3.4
- **Security**: Spring Security 6, Stateless JWT Authentication, Password Hashing (BCrypt)
- **Data Persistence**: Spring Data JPA / Hibernate, H2 persistent file storage for local development, PostgreSQL for production
- **Validation**: Jakarta Bean Validation (`@Valid`)
- **AI Core**: Dual AI engine supporting Google Gemini (`gemini-1.5-flash`), OpenAI (`gpt-4o-mini`), and an intelligent built-in heuristic evaluation generator for offline/free testing.

---

## Local Development Demo Credentials

The `dev` profile seeds these demo accounts with mock interview history. Production never creates these fixed-password accounts:

| Role | Email | Password | Pre-seeded Features |
|------|-------|----------|---------------------|
| **Student (V Srishanth)** | `srishanth@intervai.com` | `password123` | Frontend focus, 5-day streak, 3 completed interviews, skill metrics |
| **Admin** | `admin@intervai.com` | `admin123` | Platform governance, candidate directory, interview logs |

*Note: You can also register a brand-new account from the Register page.*

---

## 🏃 Running the Application Locally

### 1. Start the Backend (Spring Boot)
```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE="dev"
$env:JWT_SECRET=(openssl rand -base64 32)
.\mvnw.cmd spring-boot:run
```
- The backend will start on **`http://localhost:8080`**.
- H2 Console (optional debugging): `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/intervaidb`)

### 2. Start the Frontend (Vite)
```bash
cd frontend
npm run dev
```
- The frontend will launch at **`http://localhost:5173`**.
- Vite proxies `/api` requests directly to `http://localhost:8080`.

---

## 🌟 Key Application Features

1. **Adaptive AI Mock Interviews**:
   - Customizable by Role (Frontend, Backend, Full Stack, DevOps, Data Engineer, etc.)
   - Experience Level (Fresher, Junior, Mid-Level, Senior)
   - Track (Technical Core, Behavioral STAR, System Design, Coding)
   - Difficulty (Easy, Medium, Hard) and Question Count (3, 5, 8)
2. **Audio & Voice Interaction**:
   - Natural speech synthesis reads questions aloud.
   - Microphone speech-to-text transcribes answers in real-time.
   - Animated dynamic waveform indicators.
3. **Instant 5-Dimensional AI Evaluation**:
   - Technical Depth
   - Communication & STAR Clarity
   - Problem Solving
   - Relevance & Completeness
   - Confidence & Poise
4. **Interactive AI Career Coach**:
   - Real-time chat drawer accessible anywhere in the app.
   - Pre-filled strategic prompts & suggested action items.
   - In-app AI Key settings to toggle between Gemini and OpenAI models.
5. **Comprehensive Analytics & History**:
   - Skill proficiency bars and chronological progression charts.
   - Strengths and targeted improvement areas.
   - Audit and replay past interview transcripts.
6. **Administrator Dashboard**:
   - Platform-wide statistics and candidate directories.
   - Session oversight and hiring bar calibration.

---

## 🛡️ Security & Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Required canonical Base64 encoding of 32 random bytes (`openssl rand -base64 32`) | None; required for every profile |
| `CORS_ALLOWED_ORIGINS` | Comma-separated exact frontend origins; production must use the deployed frontend origin | `http://localhost:5173,http://127.0.0.1:5173` in the `dev` profile |
| `ADMIN_EMAIL` | Optional initial production administrator email | None |
| `ADMIN_PASSWORD` | Optional initial production administrator password (at least 16 characters) | None |
| `GEMINI_API_KEY` | Google Gemini API Key | Optional (Heuristic fallback active) |
| `OPENAI_API_KEY` | OpenAI API Key | Optional |
| `SPRING_DATASOURCE_URL` | JDBC database URL; required in `prod` | H2 file URL in `dev` |
| `SPRING_DATASOURCE_USERNAME` | Database username; required in `prod` | `sa` in `dev` |
| `SPRING_DATASOURCE_PASSWORD` | Database password; required in `prod` | Empty in `dev` |
| `SPRING_DATASOURCE_DRIVER` | JDBC driver class; required in `prod` | H2 driver in `dev` |

### Render PostgreSQL setup

The Render Blueprint configures the backend web service only; it does not create a PostgreSQL instance or incur database charges. Create or select a PostgreSQL database in the Render Dashboard, preferably in the same region as the backend, then add the database settings to the backend service's Environment page:

| Variable | Value |
|----------|-------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<internal-host>:5432/<database-name>` |
| `SPRING_DATASOURCE_USERNAME` | Database username from Render |
| `SPRING_DATASOURCE_PASSWORD` | Database password from Render |
| `SPRING_DATASOURCE_DRIVER` | `org.postgresql.Driver` |

Use the database's **internal** connection details for a Render-hosted backend in the same region. Build the JDBC URL from the internal host, port, and database name; put the username and password in their separate environment variables. Do not commit connection values or put credentials in the URL. The `prod` profile requires these settings and will not fall back to H2. Set the existing `JWT_SECRET` and `CORS_ALLOWED_ORIGINS` values as well, then save and deploy the backend service.

Hibernate uses the project's existing `ddl-auto=update` setting to create/update mapped tables without dropping existing tables. Back up a production database before deploying schema changes. There is no Flyway/Liquibase migration history in this repository. Existing data in a local H2 file is not copied to PostgreSQL; migrating it requires a separate, planned export/import with backups and validation.

Render Postgres provides separate internal and external connection URLs; prefer the internal URL for same-region Render services. See [Render's PostgreSQL connection guide](https://render.com/docs/postgresql-creating-connecting) for database setup and connection details.

## Automated verification

Run the backend regression suite and package build from the repository root:

```powershell
cd backend
.\mvnw.cmd clean verify
```

Run the frontend regression tests and production build:

```powershell
cd frontend
npm ci
npm test
npm run build
```

The GitHub Actions workflow runs these backend and frontend checks on pushes and pull requests. The backend Docker build also runs Maven verification before producing the runtime image.
