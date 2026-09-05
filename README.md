# Rankify — Web Edition (React + Tailwind CSS)

Rankify is an IIT JEE exam preparation companion built for serious aspirants targeting top All India Ranks.

## Netlify Deployment Instructions

This project is pre-configured for one-click deployment on **Netlify**:

1. **Push to GitHub**:
   - Push this repository to your GitHub account.
2. **Import to Netlify**:
   - Go to [Netlify](https://app.netlify.com/) -> **Add new site** -> **Import an existing project** -> Choose your GitHub repository.
3. **Build Settings** (Automatically detected via `netlify.toml`):
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. **Deploy**:
   - Click **Deploy Site**. Netlify will run `npm run build` and publish the single-page application.
   - SPA routing is pre-configured with `_redirects` and `netlify.toml` (`/* /index.html 200`).

## Local Development

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

## Features

- **IIT JEE Syllabus Hub**:
  - Full Physics, Chemistry, and Mathematics curriculum across Class 11 & Class 12.
  - Interactive 4-pillar chapter tracking:
    - **Revision**: Clickable counter (`1x Rev`, `2x Rev`, `3x Rev`, etc.) with reset option.
    - **Notes**: Completed state toggle.
    - **DPP**: Completed state toggle.
    - **Test**: Completed state toggle.
  - Search, subject filters, and High-Weightage chapter indicators.
- **Study Sprints & Pomodoro Timer**:
  - Dual modes: Configurable Pomodoro (Focus / Break cycles) & Stopwatch Count-Up.
  - Presets (25/5m Standard, 50/10m Deep Study, 90/15m Mock Exam Block).
  - Study Session logging (subject, category, duration, notes).
- **Exam Countdown & Milestones**:
  - Live seconds-accurate countdown to JEE Main & JEE Advanced.
  - Class 11 vs Class 12 mastery split and high-weightage checklist.
- **Formula Vault**:
  - Searchable formula cards with equations, key terms, application tips, and 1-click clipboard copy.
- **Daily Tasks & Routine Drills**:
  - Priority task manager with 1-click AIR routine templates (12-Hour Drill, Full Mock Test Day, Formula Booster, Backlog Sprint).
- **Ranker Toolkit**:
  - **Error Book**: Log mock test mistakes by category (Conceptual, Calculation, Misread, Formula, Time Pressure).
  - **Backlog Manager**: Target dates and urgency levels.
  - **JEE Marks & Rank Predictor**: Input marks out of 300 to predict NTA Percentile, AIR bracket, and top NIT/IIT eligibility.
  - **Scientific Arithmetic Scratchpad**: Quick calculations without leaving the app.
- **Analytics & Diagnostic Insights**:
  - Study time asymmetry across PCM, revision funnel, error classification, and task consistency.
- **Offline & Persistence**:
  - 100% offline-compatible with automatic `localStorage` synchronization and JSON Backup / Restore support.
