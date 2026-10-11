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
- **Data Persistence**: Spring Data JPA / Hibernate, H2 persistent file storage (Zero-config) with PostgreSQL compatibility
- **Validation**: Jakarta Bean Validation (`@Valid`)
- **AI Core**: Dual AI engine supporting Google Gemini (`gemini-1.5-flash`), OpenAI (`gpt-4o-mini`), and an intelligent built-in heuristic evaluation generator for offline/free testing.

---

## 🔑 Pre-Seeded Demo Credentials

The platform automatically seeds demo accounts with realistic mock interview history and performance metrics on first startup:

| Role | Email | Password | Pre-seeded Features |
|------|-------|----------|---------------------|
| **Student (V Srishanth)** | `srishanth@intervai.com` | `password123` | Frontend focus, 5-day streak, 3 completed interviews, skill metrics |
| **Admin** | `admin@intervai.com` | `admin123` | Platform governance, candidate directory, interview logs |

*Note: You can also register a brand-new account from the Register page.*

---

## 🏃 Running the Application Locally

### 1. Start the Backend (Spring Boot)
```bash
cd backend
./mvnw.cmd spring-boot:run
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
| `JWT_SECRET` | 512-bit HMAC signing key | Pre-configured secure hex |
| `GEMINI_API_KEY` | Google Gemini API Key | Optional (Heuristic fallback active) |
| `OPENAI_API_KEY` | OpenAI API Key | Optional |
| `SPRING_DATASOURCE_URL` | Database connection URL | `jdbc:h2:file:./data/intervaidb` |
