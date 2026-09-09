# 🏆 GitHub Portfolio Ranker

An AI-powered application that evaluates GitHub profiles, calculates a deterministic developer score, identifies key technical strengths, and recommends career growth paths using the Gemini AI API. 

Built with **Next.js 16**, **Tailwind CSS v4**, and **Supabase**.

---

## ✨ Features

*   **Instant Profile Scoring:** Calculates a deterministic score (out of 100) based on repository count, star history, and language diversity.
*   **Tier Classification:** Automatically categorizes developers into tiers (S-Tier, A-Tier, B-Tier, Novice) with custom dynamic UI styling.
*   **AI Career Matching:** Uses Google's Gemini 3.1 Flash-Lite model to analyze the tech stack and suggest the best-fit engineering roles.
*   **Strengths & Growth Roadmap:** Gemini AI reads your repository data to provide concrete identified strengths and actionable project recommendations.
*   **Data Persistence:** Caches analysis results in Supabase to reduce redundant API calls and track historical data.

---

## 🛠️ Tech Stack

*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **AI Integration:** Google Gemini API (`@google/genai`)
*   **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **External APIs:** GitHub REST API

---