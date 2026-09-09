'use server';

import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeProfile(username: string) {
  const cleanUsername = username
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/\/.*$/, '')
    .trim();

  const headers = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  };

  const userRes = await fetch(`https://api.github.com/users/${cleanUsername}`, { headers });
  if (!userRes.ok) throw new Error('User not found on GitHub.');
  const userData = await userRes.json();

  const reposRes = await fetch(`https://api.github.com/users/${cleanUsername}/repos?per_page=100`, { headers });
  const repos = await reposRes.json();
  const originalRepos = Array.isArray(repos) ? repos.filter((r: any) => !r.fork) : [];

  let totalStars = 0;
  const languageCounts: Record<string, number> = {};

  originalRepos.forEach((repo: any) => {
    totalStars += repo.stargazers_count || 0;
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  });

  const totalTagged = Object.values(languageCounts).reduce((a, b) => a + b, 0) || 1;
  const topLanguages = Object.entries(languageCounts)
    .map(([lang, count]) => ({ language: lang, percentage: Math.round((count / totalTagged) * 100) }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 4);

  const score = Math.min(
    100,
    Math.round(originalRepos.length * 3 + totalStars * 4 + Object.keys(languageCounts).length * 3)
  );

  let tier = 'Novice';
  if (score >= 85) tier = 'S-Tier';
  else if (score >= 65) tier = 'A-Tier';
  else if (score >= 40) tier = 'B-Tier';

  const prompt = `Analyze this GitHub profile:
- Top Languages: ${JSON.stringify(topLanguages)}
- Stars: ${totalStars}
- Score: ${score}/100

Respond ONLY with a valid JSON object matching this schema:
{
  "jobRole": "2-4 words job title",
  "strengths": ["Key technical strength 1", "Key technical strength 2"],
  "recommendations": ["Project/Skill recommendation 1", "Project/Skill recommendation 2"]
}`;

  let parsedAnalysis = {
    jobRole: 'Software Engineer',
    strengths: ['Consistent project commits', 'Clear language focus'],
    recommendations: ['Build full-stack production projects', 'Contribute to open-source libraries'],
  };

  try {
    const geminiRes = await ai.models.generateContent({
      model: 'gemini 3.1 flash-lite',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    if (geminiRes.text) {
      parsedAnalysis = JSON.parse(geminiRes.text);
    }
  } catch {
    // Fallback stays in place if JSON parsing or AI call fails
  }

  const finalData = {
    username: cleanUsername,
    avatar_url: userData.avatar_url,
    bio: userData.bio || '',
    score,
    tier,
    job_match: parsedAnalysis.jobRole || 'Software Engineer',
    top_languages: topLanguages,
    strengths: parsedAnalysis.strengths || [],
    recommendations: parsedAnalysis.recommendations || [],
  };

  await supabase.from('github_analyses').insert([
    {
      username: finalData.username,
      avatar_url: finalData.avatar_url,
      score: finalData.score,
      tier: finalData.tier,
      job_match: finalData.job_match,
      top_languages: finalData.top_languages,
    },
  ]);

  return finalData;
}