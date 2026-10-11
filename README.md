# SkillToSeat

> **Learn. Practice. Launch.**  
> An all-in-one student placement preparation and career management platform.

SkillToSeat enables students to master placement concepts through curated lectures, practice topic assessments with automated scoring and instant explanations, discover verified job openings, and systematically manage their placement application pipeline.

---

## 📸 Interface Gallery

| **Student Dashboard** | **Topic Quiz Runner** |
| :---: | :---: |
| ![Student Dashboard](docs/screenshots/02-student-dashboard.png) | ![Topic Assessment Runner](docs/screenshots/04-topic-quiz.png) |
| *Metrics, consistency streak, 7-day activity, and curriculum* | *Topic-based assessments with automated scoring and explanations* |

| **Authentication & Onboarding** | **Curated Lecture & YouTube Player** |
| :---: | :---: |
| ![Sign In Screen](docs/screenshots/01-sign-in.png) | ![Curated Lecture View](docs/screenshots/03-lesson-and-quiz.png) |
| *Neo-Brutalist split canvas with warm off-white and lime accents* | *Embedded YouTube lecture with concept tags and instant quiz* |

| **Verified Job Openings** | **Application Pipeline Tracker** |
| :---: | :---: |
| ![Job Openings](docs/screenshots/05-job-listings.png) | ![Application Tracker](docs/screenshots/06-application-tracker.png) |
| *Search and filter open roles, direct application links* | *Track applications across all 7 interview and hiring milestones* |

| **Admin Content Management** |
| :---: |
| ![Admin Management Portal](docs/screenshots/07-admin-management.png) |
| *Full CRUD over Lectures, Open Jobs, Tests, Categories, and Topics Hub* |

---

## ⚡ Key Features

### 1. Curated Learning Lectures
- Browse and filter placement lectures by Category and Topic.
- Embedded, responsive YouTube video player with key conceptual summaries.
- One-click completion marking with real-time student progress tracking.
- Admin CRUD: Title, description, category, topic, YouTube video ID, duration, and display order.

### 2. Topic-Based Practice Tests & Automated Scoring
- Practice quizzes grouped by core placement topics (Data Structures, Algorithms, System Design, etc.).
- Dynamic question builder supporting 2 to 6 options per question.
- **Security Masking**: Questions are delivered without `answerIndex` or `explanation` to prevent client-side inspection.
- Automated scoring with instant pass/retake feedback, percentage grades, and detailed server explanations upon submission.
- Tracks attempts, best scores, and logs completion into the student's daily activity streak.

### 3. Open Job Roles & Listings
- Search and filter opportunities by keyword, category, and employment type (Full-time, Internship, etc.).
- Active status filtering: Closed roles are automatically hidden from student view.
- External application links for direct company applications.
- One-click saving of roles directly into the student's Application Tracker.

### 4. Comprehensive Application Tracker
- Structured pipeline with all **7 key statuses**:
  - `Saved`
  - `Applied`
  - `Assessment`
  - `Interview`
  - `Offer`
  - `Rejected`
  - `Withdrawn`
- Status filter pills with real-time application count badges.
- In-place status transitions, direct external links, and removal safeguards.

### 5. Student Dashboard
- **Progress Metrics**: Overall lecture completion percentage, active streak counter, tracked applications, and verified open roles.
- **Weekly Consistency Chart**: 7-day interactive activity graph tracking lectures and quiz attempts.
- **Recent Quiz Performance**: Highlights passed assessments, attempt counts, and best scores.
- **Curriculum Path**: Quick access to recommended lectures to continue learning momentum.

### 6. Admin Content Management
- Dedicated admin portal accessible to users with the `ADMIN` role.
- Full CRUD management across:
  - **Lectures**: Video ID, duration, category, topic, ordering.
  - **Open Jobs**: Title, company, location, type, apply URL, and toggle Open/Closed status.
  - **Topic Quizzes**: Title, topic, category, description, and multi-option question builder.
  - **Categories**: Name, description, and sequencing.
  - **Topics Hub**: Aggregated view of topics with lecture & quiz counts and quick-add actions.

---

## 🎨 Visual Design System (Neo-Brutalist)
- **Palette**: Warm off-white canvas (`#f8f7f2`) with a subtle dot grid, near-black typography and borders (`#121212`), and vivid electric lime (`#ccff00`) accents.
- **Components**: High-contrast outlined cards and buttons with hard offset shadows (`3px 3px 0px #121212`), interactive micro-press motions, and custom badges.
- **Theme Awareness**: Built-in Light / Dark mode toggle persisted via `localStorage` with full color contrast compliance.
- **Typography**: Space Grotesk for compact, punchy headings and Plus Jakarta Sans for legible interface copy.
- **Responsive**: Fully optimized for mobile viewports and desktop workstations.

---

## 🛠 Technology Stack

- **Frontend**: React 18, Vite, React Router 6, Recharts, Vanilla Neo-Brutalist CSS.
- **Backend**: Node.js, Express, Mongoose, JWT (HTTP-only secure cookies), bcryptjs.
- **Database**: MongoDB Atlas with automatic fallback to embedded in-memory MongoDB for zero-friction local development.
- **Security**: Cookie-based authentication, password hashing with salt rounds, strict schema validations, role-based access control (`STUDENT` vs `ADMIN`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm 10+
- MongoDB Atlas cluster (optional; embedded in-memory database automatically runs if Atlas is unreachable)

### Installation
1. Clone the repository and navigate to the project root:
   ```bash
   cd placement-platform
   ```

2. Install dependencies for all workspaces:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Ensure `server/.env` exists (copied from `server/.env.example`).
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/placement-platform
   JWT_SECRET=your_jwt_secret_key_here
   ADMIN_EMAIL=admin@skilltoseat.internal
   ADMIN_PASSWORD=AdminPassword123!
   STUDENT_EMAIL=student@skilltoseat.internal
   STUDENT_PASSWORD=StudentPassword123!
   ```

4. Start development servers:
   ```bash
   npm run dev
   ```
   - Client: `http://localhost:5173`
   - Server: `http://localhost:5000`
   - Health Check: `http://localhost:5000/api/health`

### Demo Credentials
Upon initial boot, seed accounts are provisioned:
- **Admin**: `admin@skilltoseat.internal` / `AdminPassword123!`
- **Student**: `student@skilltoseat.internal` / `StudentPassword123!`

---

## 🧪 Testing & Verification

Run the end-to-end API test suite to verify authentication, lecture completion, quiz scoring security masking, job listings, and application tracking:
```bash
cd server
node test_features.mjs
```
