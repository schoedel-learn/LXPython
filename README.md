# LXPython (NeuroLXP)

An Angular-based Learning Experience Platform (LXP) for Python practice with an integrated AI coach, in-browser code execution, and Firebase-backed user data.

## Overview

LXPython is designed as a focused learning workspace where learners can:

- sign in and complete onboarding
- generate lesson guidance with an AI facilitator
- write and run Python code directly in the browser
- receive feedback on execution results
- track progress through persisted chat and memory context
- collaborate in a lightweight forum

## Key Features

- **AI coaching workflow** using OpenAI chat completions with learner context
- **In-browser Python runtime** powered by Pyodide
- **Monaco editor integration** for code editing
- **Firebase authentication** (Google sign-in)
- **Firestore persistence** for profiles, chat history, memory, attempts, and forum content
- **Responsive dashboard UX** with dedicated learning, forum, profile, secrets, and admin sections
- **SSR-ready Angular app** with CI/CD deployment to Firebase Hosting

## Tech Stack

- **Frontend:** Angular 21, TypeScript, Angular Material, Tailwind CSS
- **Editor/Runtime:** Monaco Editor, Pyodide
- **Backend Services:** Firebase Auth + Firestore
- **AI:** OpenAI API (`openai` SDK)
- **Build/Tooling:** Angular CLI, ESLint, Vitest, npm

## Project Structure

```text
src/
  app/
    components/     # UI features (auth, onboarding, dashboard, forum, etc.)
    services/       # Auth, learning agent, execution, forum, memory, attempts
  firebase.ts       # Firebase app/auth/firestore initialization
.github/workflows/  # CI/CD workflow for build + Firebase deploy
```

## Prerequisites

- Node.js 20+
- npm 10+
- Firebase project credentials/config
- OpenAI API key

## Environment Configuration

Copy and configure environment values as needed:

```bash
cp .env.example .env
```

`/.env.example` includes:

- `OPENAI_API_KEY` (required for AI responses)
- `APP_URL` (runtime app URL)
- `DEFAULT_AI_MODEL` (optional model override; default set in project config)

> Important: this app currently initializes OpenAI calls from the frontend runtime. Use only trusted deployment environments and protect secrets appropriately.

## Getting Started

Install dependencies:

```bash
npm ci
```

Run the app locally:

```bash
npm run start
```

Alternative dev command (binds host/port and injects key at serve time):

```bash
npm run dev
```

## Available Scripts

- `npm run start` — start Angular dev server
- `npm run dev` — start dev server on `0.0.0.0:3000` with env define options
- `npm run build` — production build
- `npm run watch` — development build in watch mode
- `npm run lint` — lint source files
- `npm run test -- --watch=false` — run unit tests once
- `npm run serve:ssr:app` — serve built SSR bundle

## Quality Checks

Before opening a PR, run:

```bash
npm run lint
npm run build
npm run test -- --watch=false
```

## Deployment

GitHub Actions workflow (`.github/workflows/deploy.yml`) performs:

1. dependency installation
2. production build
3. Firebase Hosting deploy (preview on PR, live on `main`)

Required GitHub repository secrets include:

- `OPENAI_API_KEY`
- `FIREBASE_SERVICE_ACCOUNT`

## Contributing

Contributions are welcome through pull requests. Please keep changes focused, add/adjust tests when relevant, and ensure lint/build/tests pass.
