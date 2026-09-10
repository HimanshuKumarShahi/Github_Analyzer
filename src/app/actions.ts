"use server";

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const githubToken = process.env.GITHUB_TOKEN;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseServiceKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
}

if (!geminiApiKey) {
  throw new Error("Missing GEMINI_API_KEY");
}

if (!githubToken) {
  throw new Error("Missing GITHUB_TOKEN");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
});

type LanguageStat = {
  language: string;
  percentage: number;
};

type RoleScore = {
  role: string;
  score: number;
};

type GitHubRepo = {
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  created_at: string;
  fork: boolean;
};

function cleanGitHubUsername(username: string) {
  return username
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/\/.*$/, "")
    .trim();
}

function normalize(value: number, max: number) {
  if (value <= 0) return 0;

  return Math.min(1, Math.log10(value + 1) / Math.log10(max + 1));
}

function detectRoles(
  languages: string[],
  repos: GitHubRepo[],
  metrics: {
    commits: number;
    contributions: number;
    repositories: number;
  },
): RoleScore[] {
  const languageSet = new Set(languages.map((x) => x.toLowerCase()));

  const repoText = repos
    .map((repo) => `${repo.name} ${repo.description || ""}`)
    .join(" ")
    .toLowerCase();

  const roles: RoleScore[] = [
    {
      role: "Full-Stack Developer",
      score: 0,
    },
    {
      role: "Frontend Developer",
      score: 0,
    },
    {
      role: "Backend Developer",
      score: 0,
    },
    {
      role: "React Developer",
      score: 0,
    },
    {
      role: "TypeScript Developer",
      score: 0,
    },
    {
      role: "Python Developer",
      score: 0,
    },
    {
      role: "AI / ML Engineer",
      score: 0,
    },
    {
      role: "DevOps Engineer",
      score: 0,
    },
    {
      role: "Data Engineer",
      score: 0,
    },
    {
      role: "Open Source Developer",
      score: 0,
    },
    {
      role: "Mobile Developer",
      score: 0,
    },
  ];

  const addScore = (role: string, points: number) => {
    const item = roles.find((r) => r.role === role);

    if (item) {
      item.score += points;
    }
  };

  if (languageSet.has("typescript")) {
    addScore("TypeScript Developer", 45);
    addScore("Frontend Developer", 25);
    addScore("Full-Stack Developer", 25);
  }

  if (languageSet.has("javascript")) {
    addScore("Frontend Developer", 30);
    addScore("Full-Stack Developer", 25);
    addScore("React Developer", 20);
  }

  if (
    repoText.includes("react") ||
    repoText.includes("next.js") ||
    repoText.includes("nextjs")
  ) {
    addScore("React Developer", 40);
    addScore("Frontend Developer", 30);
    addScore("Full-Stack Developer", 20);
  }

  if (languageSet.has("python")) {
    addScore("Python Developer", 45);
    addScore("Backend Developer", 25);
    addScore("Data Engineer", 20);
    addScore("AI / ML Engineer", 20);
  }

  if (
    repoText.includes("machine learning") ||
    repoText.includes("machine-learning") ||
    repoText.includes("tensorflow") ||
    repoText.includes("pytorch") ||
    repoText.includes("llm") ||
    repoText.includes("artificial intelligence") ||
    repoText.includes("openai") ||
    repoText.includes("gemini")
  ) {
    addScore("AI / ML Engineer", 50);
  }

  if (
    languageSet.has("go") ||
    languageSet.has("rust") ||
    languageSet.has("java") ||
    languageSet.has("c#") ||
    languageSet.has("ruby") ||
    languageSet.has("php")
  ) {
    addScore("Backend Developer", 35);
    addScore("Full-Stack Developer", 15);
  }

  if (
    repoText.includes("node") ||
    repoText.includes("express") ||
    repoText.includes("nestjs")
  ) {
    addScore("Backend Developer", 30);
    addScore("Full-Stack Developer", 25);
  }

  if (
    repoText.includes("docker") ||
    repoText.includes("kubernetes") ||
    repoText.includes("terraform") ||
    repoText.includes("aws") ||
    repoText.includes("azure") ||
    repoText.includes("devops") ||
    repoText.includes("ci/cd")
  ) {
    addScore("DevOps Engineer", 50);
  }

  if (
    repoText.includes("pandas") ||
    repoText.includes("numpy") ||
    repoText.includes("data analysis") ||
    repoText.includes("data engineering") ||
    repoText.includes("sql")
  ) {
    addScore("Data Engineer", 35);
  }

  if (
    repoText.includes("android") ||
    repoText.includes("ios") ||
    repoText.includes("flutter") ||
    repoText.includes("react native")
  ) {
    addScore("Mobile Developer", 50);
  }

  if (metrics.contributions >= 100 || metrics.commits >= 100) {
    addScore("Open Source Developer", 25);
  }

  if (languageSet.has("typescript") && languageSet.has("python")) {
    addScore("Full-Stack Developer", 30);
  }

  if (languageSet.has("javascript") && languageSet.has("python")) {
    addScore("Full-Stack Developer", 25);
  }

  if (metrics.contributions >= 300) {
    roles.forEach((role) => {
      role.score += 5;
    });
  }

  if (metrics.repositories >= 10) {
    addScore("Full-Stack Developer", 5);
    addScore("Open Source Developer", 5);
  }

  return roles
    .sort((a, b) => b.score - a.score)
    .map((role) => ({
      ...role,
      score: Math.min(100, role.score),
    }));
}

export async function analyzeProfile(username: string) {
  const cleanUsername = cleanGitHubUsername(username);

  if (!cleanUsername) {
    return {
      success: false,
      error: "Please enter a GitHub username or profile URL.",
    };
  }

  if (!/^[a-zA-Z0-9-]+$/.test(cleanUsername)) {
    return {
      success: false,
      error:
        "Invalid GitHub username. Use a valid GitHub username or profile URL.",
    };
  }

  const headers = {
    Authorization: `Bearer ${githubToken}`,
    Accept: "application/vnd.github+json",
  };

  const userRes = await fetch(
    `https://api.github.com/users/${encodeURIComponent(cleanUsername)}`,
    {
      headers,
      cache: "no-store",
    },
  );

  if (!userRes.ok) {
    if (userRes.status === 404) {
      return {
        success: false,
        error: `GitHub user "${cleanUsername}" was not found. Check the username and try again.`,
      };
    }

    if (userRes.status === 403) {
      return {
        success: false,
        error: "GitHub API rate limit reached. Please try again later.",
      };
    }

    return {
      success: false,
      error: `GitHub profile request failed (${userRes.status}). Please try again.`,
    };
  }

  const userData = await userRes.json();

  const reposRes = await fetch(
    `https://api.github.com/users/${encodeURIComponent(
      cleanUsername,
    )}/repos?per_page=100&sort=updated`,
    {
      headers,
      cache: "no-store",
    },
  );

  if (!reposRes.ok) {
  return {
    success: false,
    error: `Unable to fetch GitHub repositories (${reposRes.status}). Please try again.`,
  };
}

  const reposData = await reposRes.json();

  const originalRepos: GitHubRepo[] = Array.isArray(reposData)
    ? reposData.filter((repo: GitHubRepo) => !repo.fork)
    : [];

  let totalStars = 0;
  let totalForks = 0;

  const languageCounts: Record<string, number> = {};

  originalRepos.forEach((repo) => {
    totalStars += repo.stargazers_count || 0;
    totalForks += repo.forks_count || 0;

    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  });

  const totalTagged =
    Object.values(languageCounts).reduce((sum, count) => sum + count, 0) || 1;

  const topLanguages: LanguageStat[] = Object.entries(languageCounts)
    .map(([language, count]) => ({
      language,
      percentage: Math.round((count / totalTagged) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 6);

  let contributions = 0;
  let commits = 0;
  let pullRequests = 0;
  let issues = 0;
  let reviews = 0;

  try {
    const graphqlQuery = `
      query($login: String!) {
        user(login: $login) {
          contributionsCollection {
            totalCommitContributions
            totalPullRequestContributions
            totalIssueContributions
            totalPullRequestReviewContributions
            restrictedContributionsCount
            contributionCalendar {
              totalContributions
            }
          }
        }
      }
    `;

    const graphqlRes = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: {
          login: cleanUsername,
        },
      }),
      cache: "no-store",
    });

    if (graphqlRes.ok) {
      const graphqlData = await graphqlRes.json();

      const collection = graphqlData?.data?.user?.contributionsCollection;

      if (collection) {
        contributions =
          collection.contributionCalendar?.totalContributions || 0;

        commits = collection.totalCommitContributions || 0;

        pullRequests = collection.totalPullRequestContributions || 0;

        issues = collection.totalIssueContributions || 0;

        reviews = collection.totalPullRequestReviewContributions || 0;
      }
    }
  } catch (error) {
    console.error("GitHub GraphQL error:", error);
  }

  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;

  const recentRepositories = originalRepos.filter(
    (repo) => new Date(repo.updated_at).getTime() >= ninetyDaysAgo,
  ).length;

  const metrics = {
    contributions,
    commits,
    repositories: originalRepos.length,
    stars: totalStars,
    forks: totalForks,
    pullRequests,
    issues,
    reviews,
    languages: Object.keys(languageCounts).length,
    recentRepositories,
  };

  const contributionScore = normalize(contributions, 1000) * 25;

  const commitScore = normalize(commits, 500) * 20;

  const repositoryScore = normalize(originalRepos.length, 30) * 15;

  const starScore = normalize(totalStars, 100) * 15;

  const forkScore = normalize(totalForks, 50) * 5;

  const languageScore =
    Math.min(1, Object.keys(languageCounts).length / 6) * 10;

  const activityScore = Math.min(1, recentRepositories / 10) * 10;

  const score = Math.min(
    100,
    Math.round(
      contributionScore +
        commitScore +
        repositoryScore +
        starScore +
        forkScore +
        languageScore +
        activityScore,
    ),
  );

  let tier = "Novice";

  if (score >= 90) {
    tier = "S-Tier";
  } else if (score >= 75) {
    tier = "A-Tier";
  } else if (score >= 55) {
    tier = "B-Tier";
  } else if (score >= 35) {
    tier = "C-Tier";
  }

  const scoreBreakdown = {
    contributions: Math.round(contributionScore),
    commits: Math.round(commitScore),
    repositories: Math.round(repositoryScore),
    stars: Math.round(starScore),
    forks: Math.round(forkScore),
    languages: Math.round(languageScore),
    activity: Math.round(activityScore),
  };

  const roleScores = detectRoles(Object.keys(languageCounts), originalRepos, {
    commits,
    contributions,
    repositories: originalRepos.length,
  });

  const detectedRole = roleScores[0]?.role || "Software Developer";

  let parsedAnalysis = {
    jobRole: detectedRole,
    strengths: [
      "Active GitHub development",
      "Demonstrated technical project work",
    ],
    recommendations: [
      "Build more production-ready projects",
      "Contribute to established open-source projects",
    ],
    careerSummary:
      "Your GitHub profile shows consistent software development activity and a growing technical portfolio.",
  };

  try {
    const prompt = `
You are analyzing a GitHub developer profile.

PROFILE:
Username: ${cleanUsername}
Name: ${userData.name || "Not provided"}
Bio: ${userData.bio || "Not provided"}
Followers: ${userData.followers || 0}
Following: ${userData.following || 0}
Public repositories: ${originalRepos.length}

METRICS:
Contributions: ${contributions}
Commits: ${commits}
Pull Requests: ${pullRequests}
Issues: ${issues}
Reviews: ${reviews}
Stars: ${totalStars}
Forks: ${totalForks}
Languages: ${Object.keys(languageCounts).join(", ")}

TOP LANGUAGES:
${JSON.stringify(topLanguages)}

ROLE SCORES:
${JSON.stringify(roleScores)}

GITHUB SCORE:
${score}/100

TIER:
${tier}

TASK:

Determine the most realistic developer role based ONLY on the GitHub evidence.

Do not always choose Software Engineer.

Possible roles include:
Frontend Developer
Backend Developer
Full-Stack Developer
React Developer
TypeScript Developer
Python Developer
AI / ML Engineer
DevOps Engineer
Data Engineer
Open Source Developer
Mobile Developer

Return ONLY valid JSON:

{
  "jobRole": "specific role, 2-4 words",
  "strengths": [
    "specific evidence-based strength",
    "specific evidence-based strength",
    "specific evidence-based strength"
  ],
  "recommendations": [
    "specific improvement",
    "specific project or skill recommendation",
    "specific career recommendation"
  ],
  "careerSummary": "2-3 sentence evidence-based career summary"
}

Do not exaggerate.
Do not claim skills that are not supported by the GitHub data.
`;

    const geminiRes = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    if (geminiRes.text) {
      const aiResult = JSON.parse(geminiRes.text);

      parsedAnalysis = {
        jobRole: aiResult.jobRole || detectedRole,

        strengths: Array.isArray(aiResult.strengths)
          ? aiResult.strengths
          : parsedAnalysis.strengths,

        recommendations: Array.isArray(aiResult.recommendations)
          ? aiResult.recommendations
          : parsedAnalysis.recommendations,

        careerSummary: aiResult.careerSummary || parsedAnalysis.careerSummary,
      };
    }
  } catch (error) {
    console.error("Gemini analysis failed:", error);

    parsedAnalysis.jobRole = detectedRole;
  }

  const topRepositories = [...originalRepos]
    .sort((a, b) => {
      const scoreA = (a.stargazers_count || 0) * 2 + (a.forks_count || 0);

      const scoreB = (b.stargazers_count || 0) * 2 + (b.forks_count || 0);

      return scoreB - scoreA;
    })
    .slice(0, 6)
    .map((repo) => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description || "",
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      language: repo.language || "Unknown",
    }));

  const finalData = {
    username: cleanUsername,

    profile: {
      name: userData.name || "",
      avatar_url: userData.avatar_url || "",
      bio: userData.bio || "",
      followers: userData.followers || 0,
      following: userData.following || 0,
      public_repos: userData.public_repos || 0,
      html_url: userData.html_url || "",
      created_at: userData.created_at || "",
    },

    avatar_url: userData.avatar_url || "",

    bio: userData.bio || "",

    score,

    tier,

    score_breakdown: scoreBreakdown,

    metrics,

    job_match: parsedAnalysis.jobRole || detectedRole,

    role_scores: roleScores,

    top_languages: topLanguages,

    strengths: parsedAnalysis.strengths,

    recommendations: parsedAnalysis.recommendations,

    career_summary: parsedAnalysis.careerSummary,

    top_repositories: topRepositories,
  };

  const { data: insertedData, error: insertError } = await supabase
    .from("github_analyses")
    .insert([
      {
        username: finalData.username,

        avatar_url: finalData.avatar_url,

        score: finalData.score,

        tier: finalData.tier,

        job_match: finalData.job_match,

        top_languages: finalData.top_languages,
      },
    ])
    .select();

  if (insertError) {
    console.error("SUPABASE INSERT ERROR:", insertError);

    throw new Error(`Supabase insert failed: ${insertError.message}`);
  }

  return {
  success: true,
  data: finalData,
};
}
