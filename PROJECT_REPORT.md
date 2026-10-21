# IntervAI Project Report

**Prepared:** 18 October 2026  
**Repository:** `mock-interview`  
**Project type:** Full-stack AI mock interview and interview preparation platform

## 1. Executive summary

IntervAI is a web application for practicing technical and behavioral interviews. Candidates create a session tailored by role, experience, interview track, difficulty, and skills; answer questions in text or with browser speech tools; receive per-answer feedback; and review results and progress. The platform also includes a career coach, profile and practice preferences, a public leaderboard, and an administrator view.

The frontend is a React single-page application. The backend is a Java 21 / Spring Boot REST service with JWT authentication, JPA persistence, and an AI service that can call Google Gemini or OpenAI, with a built-in fallback when a provider key is unavailable or a call fails.

## 2. Product capabilities

### Candidate experience

- Register, sign in, and manage profile details, career goal, target role, experience level, and skills.
- Set a persistent appearance theme: Midnight, Daylight, or Cyberpunk. Older saved Aurora preferences migrate to Cyberpunk.
- Set interview defaults for role, experience, and difficulty. These prefill new practice sessions.
- Create mock interviews for supported engineering roles and tracks such as technical, behavioral / HR, system design, and coding.
- Choose Easy, Medium, or Hard difficulty, question count, and text or voice-oriented mode.
- Read questions aloud with browser speech synthesis and dictate answers with browser speech recognition where the browser supports it.
- Submit answers for evaluation, complete a session, and review scores, feedback, strengths, areas to improve, suggestions, and model answers.
- Review interview history, analytics, skill performance, and the candidate leaderboard.
- Open the AI career coach from the application shell.

### Administrator experience

- View platform statistics, user directory, interview directory, and recent activity.
- Configure Gemini or OpenAI keys through the admin API at runtime.

## 3. User journeys

1. **Account setup:** A candidate registers or signs in. The frontend stores the JWT and user profile in browser local storage; subsequent API calls attach the token as a Bearer credential.
2. **Interview setup:** The candidate chooses role, seniority, track, difficulty, question count, mode, and skills. Profile defaults and the saved difficulty are used to prefill the form.
3. **Question generation:** The backend creates an interview record and asks `AiService` to generate role- and skill-focused questions. Gemini is preferred if its key is configured; OpenAI is used otherwise; fallback question generation is used when neither is configured or a provider call fails.
4. **Interview session:** The candidate starts the session, answers questions, and can use browser speech features when available. Each answer is saved and evaluated.
5. **Results and progress:** The backend stores feedback and skill performance, calculates the completed interview result, and serves history and analytics to the frontend.

## 4. Technology and architecture

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite 5, React Router 6, Tailwind CSS 3 |
| Frontend state and API | React Context, Axios, browser local storage |
| Frontend visualization and interaction | Recharts, Lucide React, Framer Motion, Canvas Confetti, Web Speech APIs |
| Backend | Java 21, Spring Boot 3.3.4, Spring MVC, Spring Security, Spring Data JPA / Hibernate |
| Authentication | Stateless JWT with JJWT and BCrypt password hashing |
| Persistence | H2 file database by default; PostgreSQL driver included |
| AI integrations | Gemini and OpenAI REST APIs, plus internal question / evaluation / coach fallbacks |
| Deployment configuration | Render Docker service for backend; Vercel SPA rewrite configuration for frontend |

The frontend is under `frontend/src`. The backend follows conventional Spring package boundaries under `backend/src/main/java/com/intervai`: controllers, services, repositories, entities, DTOs, configuration, security, and exceptions.

## 5. Frontend routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Product landing page and entry points |
| `/login`, `/register` | Public | Authentication |
| `/dashboard` | Candidate | Summary, recent activity, and practice entry point |
| `/create` | Candidate | Interview configuration and question generation |
| `/interviews/:id/lobby` | Candidate | Session preview and start; includes question narration |
| `/interviews/:id/live` and `/interviews/:id` | Candidate | Live interview answering and evaluation flow |
| `/interviews/:id/result` | Candidate | Completed interview results and feedback |
| `/history` | Candidate | Past interview sessions |
| `/analytics` | Candidate | Score, skill, and performance trends |
| `/profile` | Candidate | Profile and career preferences, plus leaderboard |
| `/settings` | Candidate | Theme, interview defaults, and sign-out |
| `/admin` | Administrator | Platform oversight |

`Sidebar` provides the application shell and navigation. `App.jsx` owns the route table and global AI coach drawer. `AuthContext` and `ThemeContext` provide authentication and appearance state. The Axios client adds JWTs and redirects to login on unauthorized responses.

## 6. Backend API overview

All API routes are under `/api`.

| Area | Routes | Access / purpose |
|---|---|---|
| Authentication | `POST /auth/register`, `POST /auth/login` | Public account creation and token issuance |
| User profile | `GET /users/profile`, `PUT /users/profile` | Authenticated profile and saved role / experience / career / skills |
| Public catalog | `GET /skills/public`, `GET /leaderboard/public` | Public skill list and leaderboard |
| Interviews | `POST /interviews`, `GET /interviews`, `GET /interviews/recent`, `GET /interviews/{id}` | Create and list the current user’s sessions |
| Session actions | `POST /interviews/{id}/start`, `POST /interviews/{id}/answer`, `POST /interviews/{id}/complete`, `GET /interviews/{id}/result`, `DELETE /interviews/{id}` | Start, answer, finish, retrieve, or delete an owned session |
| History | `GET /history` | Authenticated interview history |
| Analytics | `GET /analytics` | Current user’s aggregates and trends |
| AI coach | `POST /ai/coach`, `GET /ai/status` | Coach response and active provider status |
| AI key configuration | `POST /ai/configure-key` | Administrator only; sets Gemini or OpenAI key at runtime |
| Administration | `GET /admin/stats`, `GET /admin/users`, `GET /admin/interviews` | Administrator only |

Request validation uses Jakarta Bean Validation for applicable DTOs. `GlobalExceptionHandler` translates backend errors into API responses. Interview access is scoped to the authenticated user in the service layer; admin routes require `ROLE_ADMIN`.

## 7. Data model

- **User:** identity, email, BCrypt password hash, role and experience preferences, career goal, avatar, streak, roles, skills, timestamps.
- **Interview:** owner, target role, experience, selected skills, track, difficulty, question count, mode, lifecycle status, timestamps, duration, aggregate scores, and summary feedback.
- **InterviewQuestion:** ordered prompt, category, target skill, expected points, and model answer.
- **Answer:** answer text, optional audio URL field, time spent, skipped flag, and timestamp.
- **Feedback:** overall/per-dimension scores, strengths, weaknesses, suggestions, and model answer.
- **Performance:** per-user, per-skill score and evaluation count for analytics.
- **Role / Skill:** lookup entities connected to users and their capabilities.

Relationships are managed with JPA. Interview deletion cascades through its questions, and answer feedback is modeled as a one-to-one relationship.

## 8. AI behavior and scoring

`AiService` implements interview question generation, answer evaluation, and career-coach responses. It attempts Gemini first when a Gemini key is present; otherwise it attempts OpenAI. Provider exceptions are logged and handled by internal fallback logic. If no keys are set, fallback generation, evaluation, and coach behavior allow the app to run without an external AI account.

The persisted evaluation dimensions are technical knowledge, communication, relevance, clarity, and confidence, together with an overall score. The frontend presents these values with narrative feedback and visual summaries. Browser speech recognition is not available in every browser or environment; text entry remains the fallback.

## 9. Local development

### Prerequisites

- Java 21
- Node.js and npm
- No external database or AI key is required for the default local setup.

### Start the backend

From the repository root:

```powershell
cd backend
./mvnw.cmd spring-boot:run
```

The backend listens on `http://localhost:8080` by default. H2 Console is configured at `http://localhost:8080/h2-console`; the default JDBC URL is `jdbc:h2:file:./data/intervaidb`.

### Start the frontend

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Vite serves the application at `http://localhost:5173` and proxies `/api` to `http://localhost:8080`. For a production bundle, run `npm run build`; `npm run preview` serves the generated bundle locally.

## 10. Configuration and deployment

### Backend environment variables

| Variable | Purpose | Default in configuration |
|---|---|---|
| `PORT` | HTTP listen port | `8080` |
| `JWT_SECRET` | JWT signing secret | A repository-configured fallback; set a strong deployment-specific value |
| `JWT_EXPIRATION_MS` | Token lifetime | `86400000` (24 hours) |
| `SPRING_DATASOURCE_URL` | JDBC URL | H2 file database at `./data/intervaidb` |
| `SPRING_DATASOURCE_DRIVER` | JDBC driver | H2 driver |
| `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` | Database credentials | H2 defaults |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Gemini integration | Empty key; model defaults to `gemini-1.5-flash` |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | OpenAI integration | Empty key; model defaults to `gpt-4o-mini` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated origin patterns | `*` |

PostgreSQL support is included. Configure its JDBC URL, credentials, and driver when deploying against PostgreSQL. The repository’s `render.yaml` defines a Docker web service using `backend/Dockerfile`; `frontend/vercel.json` configures SPA history fallback for static hosting.

## 11. Security and operational considerations

- Spring Security is stateless and expects JWTs for protected endpoints. Passwords are encoded with BCrypt.
- The frontend stores the bearer token in local storage. This is simple for the current client but makes token protection dependent on preventing script injection; consider an HttpOnly-cookie design for a higher-security deployment.
- The default configuration permits all CORS origin patterns and includes a default JWT signing secret. Set explicit allowed origins and a high-entropy secret in deployed environments.
- H2 Console is enabled, allows remote web access, and is permitted by the security configuration. Disable or tightly restrict it outside development.
- AI keys entered through the admin endpoint are held in the running service instance and are not persisted to a secret store or database; a restart loses runtime changes.
- The default H2 database is file-backed. Container deployments need persistent storage or an external database if records must survive container replacement.
- Demo accounts are seeded by `DataInitializer` for local demonstration. Do not rely on demo credentials for a public environment.
- Voice input depends on browser speech-recognition support and microphone permission. It is not a server-side transcription service.

## 12. Current scope and boundaries

- Candidate profile and interview preferences are persisted through the profile API. Theme choice and default difficulty are browser-local preferences.
- Email changes, password changes, notification preferences, billing, and account deletion are not exposed as settings features in the current UI/API.
- Runtime AI-provider selection is based on configured keys (Gemini has priority if both are present); the admin key endpoint changes credentials but is not a durable provider-management system.
- The test source tree contains a Spring Boot application test. The project’s Docker build explicitly packages with Maven tests skipped.
- The latest frontend production build completed successfully during the preceding theme work; Vite emitted its standard large-chunk advisory for the main JavaScript bundle.

## 13. Repository map

```text
frontend/
  src/api/             Axios API wrappers
  src/components/      Sidebar, coach drawer, footer, audio visualization
  src/context/         Authentication and theme providers
  src/pages/           Landing, auth, dashboard, interview, analytics, profile, settings, admin
  src/App.jsx          Application shell and route definitions
  src/index.css        Tailwind layers and theme-wide overrides
backend/
  src/main/java/com/intervai/
    config/            Security, CORS, seed data
    controller/        REST endpoints
    dto/                Request and response models
    entity/             JPA domain model
    exception/          API exceptions and global response handling
    repository/         Spring Data repositories
    security/           JWT filter, token provider, principal loading
    service/            Auth, interview, AI, analytics, admin, user logic
  src/main/resources/   Spring configuration
  Dockerfile            Multi-stage backend image
render.yaml             Backend Render service declaration
README.md               Existing setup and product overview
```

