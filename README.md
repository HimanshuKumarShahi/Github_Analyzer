# GitHub Developer Intelligence

![alt text](./public/image.png)
![alt text](./public/image-1.png)

> Analyze a GitHub profile, measure developer activity, identify technical strengths, and generate an AI-powered developer profile.

GitHub Developer Intelligence is a GitHub profile analyzer and developer ranking platform built with Next.js, GitHub API, Google Gemini, and Supabase.

Enter a GitHub username and get a structured developer intelligence report containing:

- GitHub activity score
- Developer tier
- Developer role detection
- Contribution metrics
- Technical stack
- Top repositories
- Career strengths
- AI-generated recommendations
- Career summary
- Downloadable PDF report
- Analysis history stored in Supabase

---

## Features

### GitHub Profile Analysis

Enter a GitHub username or profile URL and the application analyzes publicly available GitHub data.

The analyzer retrieves:

- GitHub profile information
- Public repositories
- Repository stars
- Repository forks
- Programming languages
- Contributions
- Commits
- Pull requests
- Issues
- Pull request reviews
- Recent repository activity

---

## Developer Score

Every profile receives a score from `0–100`.

The score is calculated using deterministic backend logic rather than allowing AI to decide the final score.

### Current scoring weights

| Metric | Weight |
|---|---:|
| Contributions | 25% |
| Commits | 20% |
| Repositories | 15% |
| Stars | 15% |
| Languages | 10% |
| Recent Activity | 10% |
| Forks | 5% |
| **Total** | **100%** |

Logarithmic normalization is used for several GitHub metrics so that profiles with extremely high repository stars or repository counts do not completely dominate the score.

### Developer tiers

| Score | Tier |
|---:|---|
| 90–100 | S |
| 75–89 | A |
| 55–74 | B |
| 35–54 | C |
| 0–34 | Novice |

The score is intended as a developer activity/intelligence indicator.

It is **not** a formal measure of programming ability, professional seniority, employability, or job performance.

---

# 1. Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| Next.js 16.3.4 | Full-stack React framework |
| React 19.2.8 | UI and application state |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling and responsive design |
| Lucide React | Icons |
| Aceternity UI | Animated UI/background components |
| Geist Font | Application typography |

---

## Backend

| Technology | Purpose |
|---|---|
| Next.js Server Actions | Server-side application logic |
| GitHub REST API | Profile and repository data |
| GitHub GraphQL API | Contribution statistics |
| Google Gemini API | AI-powered developer analysis |

---

## Database

| Technology | Purpose |
|---|---|
| Supabase | Backend database platform |
| PostgreSQL | Persistent data storage |

---

## Report Generation

| Technology | Purpose |
|---|---|
| jsPDF | Client-side PDF report generation |

---
## Deployment

| Technology | Purpose |
|---|---|
| Vercel | Production hosting and deployment |
| GitHub | Source code and version control |

---

# 2. High-Level Architecture

```text
┌─────────────────────────────────────────────┐
│                   USER                      │
│                                             │
│        GitHub Username / Profile URL        │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│                NEXT.JS APP                  │
│                                             │
│        React + TypeScript + Tailwind        │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│             SERVER ACTION                  │
│                                             │
│     Validate Input + Fetch GitHub Data      │
└──────────────┬───────────────┬──────────────┘
               │               │
               ▼               ▼
       ┌──────────────┐ ┌───────────────┐
       │ GitHub REST  │ │ GitHub GraphQL │
       │     API      │ │      API       │
       └──────┬───────┘ └───────┬───────┘
              │                 │
              └────────┬────────┘
                       ▼
             ┌───────────────────┐
             │  Data Processing  │
             │  & Normalization  │
             └─────────┬─────────┘
                       │
                       ▼
             ┌───────────────────┐
             │ Deterministic     │
             │ Score Calculation  │
             └─────────┬─────────┘
                       │
                       ▼
             ┌───────────────────┐
             │ Developer Role    │
             │ Detection         │
             └─────────┬─────────┘
                       │
                       ▼
             ┌───────────────────┐
             │   Google Gemini   │
             │   AI Analysis     │
             └─────────┬─────────┘
                       │
                       ▼
             ┌───────────────────┐
             │ Final Analysis    │
             │ Result             │
             └──────┬────────┬───┘
                    │        │
             ┌──────▼───┐    │
             │ Supabase │    │
             │ Database │    │
             └──────────┘    │
                             ▼
                   ┌──────────────────┐
                   │ Results Dashboard│
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │     jsPDF        │
                   │  PDF Generation  │

```

# AI-Powered Developer Intelligence

Google Gemini is used to interpret the collected GitHub information and generate contextual insights.

The AI receives structured GitHub data and produces:

- Developer role
- Strengths
- Recommendations
- Career summary

Example roles include:

- Full-Stack Developer
- Frontend Developer
- Backend Developer
- React Developer
- TypeScript Developer
- Python Developer
- AI/ML Developer
- DevOps Developer
- Data Developer
- Open Source Developer
- Mobile Developer

The application combines:

```text
GitHub Data
     ↓
Deterministic Metrics
     ↓
Developer Score
     ↓
Role Detection
     ↓
Gemini Analysis
     ↓
Developer Intelligence Report

```
```
Simple input
    ↓
Clear loading state
    ↓
High-impact score
    ↓
Detailed metrics
    ↓
Technical stack
    ↓
Repository intelligence
    ↓
AI insights
```