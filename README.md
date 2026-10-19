# SmartLearn Pro

Smart Course Learning, Assessment & Proctored Learning Platform — a MERN-stack LMS.

## 1. Project overview

SmartLearn Pro lets students browse courses, request enrollment, work through
structured modules/lessons (video + tutorial content), take quizzes, sit
proctored final assessments, track progress, and earn certificates.
Administrators manage users, courses, enrollment approvals, quizzes, live
proctoring monitoring, certificate issuance, and platform analytics.

This is a working, modular scaffold — not a static mockup. Every button in
the UI calls a real backend endpoint. Where a feature could not be shipped
as a fully turnkey production integration (see §16 "Known extension
points"), that is stated explicitly rather than faked.

## 2. Features

**Student**: registration + email verification, login, browse/request
enrollment, structured course player (modules → lessons → video/tutorial),
progress tracking, quizzes with timer and scoring, proctored final
assessments (camera/mic/fullscreen/tab-switch monitoring), certificates
with PDF download, real-time notifications, profile.

**Admin**: dashboard with platform stats and charts, student management,
course/module/lesson authoring, enrollment approval queue, quiz + question
authoring (API-complete; see §16 for UI status), live proctoring monitor
with per-session event timeline, certificate review/approval, analytics,
settings.

## 3. Technology stack

- **Frontend**: React 18, Vite, React Router, Tailwind CSS, Axios, Recharts,
  Socket.IO client, lucide-react icons
- **Backend**: Node.js, Express, MongoDB/Mongoose, JWT (HTTP-only cookies),
  bcryptjs, Socket.IO, Nodemailer, pdfkit, Helmet, CORS, express-rate-limit
- **Video/file storage**: designed for Cloudinary/S3 (URL + metadata stored
  in MongoDB); ships with a local `/uploads` fallback for generated
  certificate PDFs only — see §16 for the video-upload extension point

## 4. Architecture

```
Routes → Controllers → Services → Models → MongoDB
```

Business logic lives in `server/services/*` (auth, email, notifications,
progress, proctoring, certificates) so controllers stay thin and testable.
Socket.IO is initialized once in `server/sockets/index.js` and shared with
`notificationService` and `proctorController` for real-time pushes.

```
smartlearn-pro/
  client/            React + Vite frontend
    src/
      components/    Shared UI (Button, Card, AppShell, TutorialContent...)
      pages/auth/    Login, Register, VerifyEmail, ForgotPassword, ResetPassword
      pages/student/ Dashboard, CourseCatalog, CourseDetail, LessonPlayer,
                      Quiz, ProctoredExam, Progress, Certificates, Profile...
      pages/admin/   Dashboard, Users, Courses, CourseManage, Enrollments,
                      Proctoring(+Detail), Certificates, Analytics, Settings
      pages/public/  VerifyCertificate (no auth required)
      context/       AuthContext, NotificationContext
      hooks/         useProctoring (camera/mic/fullscreen/tab/audio signals)
      services/      api.js (axios), socket.js (socket.io-client)
  server/
    config/          db.js, proctoringConfig.js
    controllers/      one per resource
    models/          14 Mongoose schemas + index.js
    routes/          one per resource + index.js
    middleware/       auth (JWT + role check), errorHandler, rateLimiters, validate
    services/         authService, emailService, notificationService,
                       progressService, proctoringService, certificateService
    sockets/          Socket.IO auth + room wiring
    seed/            seed.js — creates admin, students, sample course
    uploads/          generated certificate PDFs land here
```

## 5. Prerequisites

- Node.js 18+
- npm 9+
- A running MongoDB instance (local `mongod` or a hosted URI, e.g. Atlas)
- (Optional) SMTP credentials for real email delivery — without them, the
  app still runs; email sends will fail gracefully and be logged, not thrown

## 6. Installation

```bash
git clone <this-repo>
cd smartlearn-pro

# Backend
cd server
npm install
cp .env.example .env   # then edit values, see §8
npm run seed            # creates admin + sample students + sample course
npm run dev             # http://localhost:5000

# Frontend (separate terminal)
cd ../client
npm install
npm run dev             # http://localhost:5173
```

Vite's dev server proxies `/api` and `/uploads` to `http://localhost:5000`
(see `client/vite.config.js`), so no separate `VITE_API_URL` is needed in
development.

## 7. MongoDB setup

Point `MONGO_URI` in `server/.env` at any reachable MongoDB 5+ instance:

```
MONGO_URI=mongodb://127.0.0.1:27017/smartlearn-pro
```

or an Atlas connection string. No manual schema setup is required —
Mongoose creates collections/indexes on first use.

## 8. Environment variables

See `server/.env.example` for the full list with inline comments. Key ones:

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Sign/verify session tokens — **generate a long random value** |
| `CLIENT_URL` | Used in CORS and in email links (verify/reset URLs) |
| `SMTP_HOST/PORT/USER/PASSWORD`, `EMAIL_FROM` | Outbound email |
| `CLOUDINARY_*` | Optional — only needed once you wire real video uploads (§16) |
| `PROCTOR_RISK_WEIGHTS_JSON` | Optional override of proctoring risk weights |

**Never commit `.env`.** `.gitignore` already excludes it; only
`.env.example` (placeholders) is tracked.

## 9. SMTP setup

Any standard SMTP provider works (SendGrid, Mailgun, Postmark, a personal
Gmail app password, etc.). Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`,
`SMTP_USER`, `SMTP_PASSWORD`, and `EMAIL_FROM`. If SMTP is left unset,
registration/login still work; email sends will log a
`email_failed` entry instead of throwing, so the rest of the app is
unaffected during local development.

## 10. Cloud storage setup (videos)

The `Lesson.video` field stores `{ url, provider, publicId, durationSeconds,
completionThresholdPercent }` — i.e. only metadata, never binary video, in
MongoDB. To go live with real uploads:

1. Add a Cloudinary or S3 SDK call in a new `server/services/storageService.js`
2. Add a `multer`-backed upload route (multer is already a dependency)
3. Save the returned URL into `Lesson.video.url` via the existing
   `PUT /api/courses/modules/:moduleId/lessons/reorder`-style admin routes
   (or add a small `PUT /api/courses/lessons/:lessonId/video` endpoint)

This is left as an integration point rather than shipped with a specific
vendor's API keys hard-wired in.

## 11. Frontend setup

`cd client && npm install && npm run dev`. Runs on port 5173 by default.
Build for production with `npm run build` (outputs to `client/dist`).

## 12. Backend setup

`cd server && npm install && npm run dev` (nodemon) or `npm start`
(plain node). Runs on port 5000 by default; change via `PORT` in `.env`.

## 13. Database seeding

`npm run seed` (from `server/`) creates:

- One admin: `admin@smartlearnpro.local` / `ChangeMe123!`
- Three students, e.g. `asha@smartlearnpro.local` / `ChangeMe123!`
- A full sample course ("Full Stack Web Development") with 7 modules, one
  lesson + one quiz per module, and a proctored final assessment
- One student pre-enrolled and approved for that course, for quick testing

**These are development-only credentials. Rotate them (and `JWT_SECRET`)
before any real deployment.**

## 14. Development commands

| Command | Where | Effect |
|---|---|---|
| `npm run dev` | `server/` | Start API with nodemon (auto-restart) |
| `npm start` | `server/` | Start API without nodemon |
| `npm run seed` | `server/` | Seed the database |
| `npm run dev` | `client/` | Start Vite dev server |
| `npm run build` | `client/` | Production build |
| `npm run preview` | `client/` | Preview the production build locally |

## 15. API overview

All responses follow `{ success, message, data }` (or `{ success: false,
message, errors? }` on failure). Full route list lives in `server/routes/`;
highlights:

```
POST   /api/auth/register            POST   /api/enrollments
GET    /api/auth/verify-email/:token PUT    /api/enrollments/:id/approve
POST   /api/auth/login               PUT    /api/enrollments/:id/reject
POST   /api/auth/forgot-password     GET    /api/quizzes/:id
POST   /api/auth/reset-password      POST   /api/quizzes/:id/submit
GET    /api/courses                  POST   /api/proctor/start
POST   /api/courses (admin)          POST   /api/proctor/event
POST   /api/courses/:id/modules      GET    /api/proctor/sessions (admin)
POST   /api/courses/modules/:id/lessons
POST   /api/progress/video           POST   /api/certificates/generate
GET    /api/certificates/verify/:certificateId   (public)
GET    /api/analytics/admin-dashboard (admin)
```

## 16. Known extension points (honest status, per project ground rules)

- **Video uploads**: metadata model + player are complete; the actual
  Cloudinary/S3 upload call is not wired to specific credentials (§10).
- **Quiz/question authoring UI**: `POST /api/quizzes` is fully implemented
  and used by `seed.js`; the admin course-manager screen does not yet have
  a form for it (flagged directly in that screen's UI).
- **Face/multiple-face detection**: uses the browser-native experimental
  `FaceDetector` API where the browser supports it, with a visible fallback
  message where it doesn't. It is not bundled with a MediaPipe/TensorFlow
  model — those are large binary assets outside the scope of this code
  scaffold. Tab-switch, fullscreen-exit, and audio-anomaly detection are
  fully implemented with standard Web APIs and do not depend on this.
- **Settings UI**: proctoring risk weights/thresholds and certificate
  completion requirements are fully configurable today via `.env` /
  per-course fields and their respective APIs; the `/admin/settings` page
  documents this rather than duplicating a form the API doesn't yet expose.

## 17. Security notes

- Passwords hashed with bcrypt (12 rounds); never stored or logged in
  plaintext.
- JWTs are set as `httpOnly`, `secure` (in production), `sameSite` cookies;
  `Authorization: Bearer` is also accepted for API/testing convenience.
- Every admin-only route re-checks the authenticated user's role
  server-side (`requireRole` middleware) — the frontend never gates access
  by itself.
- Email verification and password-reset tokens are stored as SHA-256
  hashes, never in raw form.
- `helmet`, `cors` (scoped to `CLIENT_URL`), and `express-rate-limit`
  (tighter on `/api/auth/*`) are applied globally.
- Centralized error handler avoids leaking stack traces outside development.
- `logger.js` redacts any key containing "password", "token", "secret", or
  "apiKey" before writing log lines.

## 18. Proctoring limitations

Per the project's ethical requirements, the system:

- Never claims that any single signal (face not visible, tab switch,
  fullscreen exit, audio anomaly) proves cheating. Events are recorded and
  labeled as neutral "potential integrity events."
- Keeps the **proctoring risk score** and the **academic quiz score**
  in entirely separate fields (`ProctorSession.riskScore` vs
  `QuizAttempt.scorePercent`) and never combines them.
- Does not record or store continuous camera/microphone footage — only
  discrete, timestamped events with lightweight metadata.
- Requires explicit browser permission grants (`getUserMedia`) before any
  monitoring begins, and shows the student what's being monitored on an
  instructions screen before the exam starts.
- Ships without a bundled face-detection ML model (see §16) — this is a
  scope limitation of a code scaffold, not a design decision to skip
  visual monitoring outright.

## 19. Troubleshooting

- **"Not authenticated" on every request**: confirm `CLIENT_URL` in
  `server/.env` matches the origin your frontend actually runs on, and that
  cookies aren't being blocked (check `sameSite`/`secure` settings if
  testing over plain HTTP in a non-`development` `NODE_ENV`).
- **Emails never arrive**: check the `email_failed` log lines — most often
  an SMTP credential or port/`SMTP_SECURE` mismatch. The rest of the app
  keeps working either way.
- **Mongo connection errors on boot**: verify `mongod` is running locally,
  or that your Atlas IP allowlist includes your current IP.
- **Camera/mic permission denied on the proctored exam screen**: the
  browser blocks `getUserMedia` outside secure contexts — use `localhost`
  (already secure) or HTTPS in any deployed environment.
- **Large `dist/assets/index-*.js` warning on `npm run build`**: expected
  for a single-bundle app at this stage; consider route-based code
  splitting (`React.lazy`) if you extend the admin/student page counts
  further.
