"use client";

import { useRef, useState } from "react";
import {
  Search,
  Sparkles,
  XCircle,
  Trophy,
  Briefcase,
  CheckCircle2,
  ArrowUpRight,
  Star,
  GitFork,
  FolderGit2,
  Loader2,
  Users,
  GitCommitHorizontal,
  GitPullRequest,
  Bug,
  Code2,
  Download,
  MapPin,
  Building2,
} from "lucide-react";

import { analyzeProfile } from "./actions";

const TIER_STYLES: Record<
  string,
  {
    badge: string;
    border: string;
    text: string;
  }
> = {
  "S-Tier": {
    badge: "from-amber-300 via-orange-400 to-pink-500",
    border: "border-amber-400/30",
    text: "text-amber-300",
  },

  "A-Tier": {
    badge: "from-emerald-300 via-cyan-400 to-blue-500",
    border: "border-emerald-400/30",
    text: "text-emerald-300",
  },

  "B-Tier": {
    badge: "from-blue-300 via-indigo-400 to-purple-500",
    border: "border-blue-400/30",
    text: "text-blue-300",
  },

  "C-Tier": {
    badge: "from-slate-300 to-slate-500",
    border: "border-slate-400/30",
    text: "text-slate-300",
  },

  Novice: {
    badge: "from-neutral-500 to-neutral-700",
    border: "border-neutral-700",
    text: "text-neutral-400",
  },
};

const METRICS = [
  {
    key: "contributions",
    label: "Contributions",
    icon: GitCommitHorizontal,
  },
  {
    key: "commits",
    label: "Commits",
    icon: GitCommitHorizontal,
  },
  {
    key: "public_repos",
    label: "Public repos",
    icon: FolderGit2,
  },
  {
    key: "stars",
    label: "Stars",
    icon: Star,
  },
  {
    key: "forks",
    label: "Forks",
    icon: GitFork,
  },
  {
    key: "pull_requests",
    label: "Pull requests",
    icon: GitPullRequest,
  },
  {
    key: "issues",
    label: "Issues",
    icon: Bug,
  },
  {
    key: "languages",
    label: "Languages",
    icon: Code2,
  },
];

function ScoreRing({ score, tier }: { score: number; tier: string }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;

  const tierStyle = TIER_STYLES[tier] || TIER_STYLES.Novice;

  return (
    <div className="relative flex h-52 w-52 items-center justify-center">
      <svg
        className="-rotate-90"
        width="180"
        height="180"
        viewBox="0 0 180 180"
      >
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-neutral-800"
        />

        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          className="transition-all duration-1000"
        />

        <defs>
          <linearGradient
            id="scoreGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute text-center">
        <p className="text-5xl font-black tracking-tighter">{score}</p>

        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          / 100
        </p>

        <p className={`mt-1 text-xs font-bold uppercase ${tierStyle.text}`}>
          {tier}
        </p>
      </div>
    </div>
  );
}

export default function GitHubRanker() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const reportRef = useRef<HTMLDivElement>(null);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();

    if (!input.trim()) return;

    setLoading(true);
    setError("");

    try {
      const result = await analyzeProfile(input);
      setData(result);
    } catch (err: any) {
      setError(err?.message || "Failed to analyze GitHub profile.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadPDF() {
    if (!data) return;

    try {
      const { jsPDF } = await import("jspdf");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const margin = 15;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      let y = 20;

      const addTitle = (text: string) => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(18);
        pdf.text(text, margin, y);
        y += 10;
      };

      const addSection = (text: string) => {
        if (y > pageHeight - 35) {
          addNewPage();
        }

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text(text, margin, y);
        y += 7;
      };

      const addText = (text: string, size = 9, bold = false) => {
        pdf.setFont("helvetica", bold ? "bold" : "normal");

        pdf.setFontSize(size);

        const lines = pdf.splitTextToSize(text, pageWidth - margin * 2);

        lines.forEach((line: string) => {
          if (y > pageHeight - 25) {
            addNewPage();
          }

          pdf.text(line, margin, y);
          y += 5;
        });

        y += 1;
      };

      const addNewPage = () => {
        pdf.addPage();
        y = 20;
      };

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("GitHub Developer Intelligence Report", margin, y);
      y += 12;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(15);
      pdf.text(`@${data.username}`, margin, y);
      y += 8;

      if (data.profile?.name) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.text(data.profile.name, margin, y);
        y += 7;
      }

      if (data.profile?.bio) {
        addText(data.profile.bio, 9, false);
      }

      y += 6;

      // --------------------------------------------------
      // SCORE
      // --------------------------------------------------

      addSection("GitHub Profile Score");

      y += 2;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(28);
      pdf.text(`${data.score}/100`, margin, y);

      y += 12;

      addText(`Tier: ${data.tier}`, 10, true);

      y += 6;

      // --------------------------------------------------
      // CAREER MATCH
      // --------------------------------------------------

      addSection("Best Career Match");

      addText(data.job_match || "Software Developer", 14, true);

      y += 3;

      // --------------------------------------------------
      // PROFILE METRICS
      // --------------------------------------------------

      addSection("Profile Metrics");

      const metrics = [
        `Contributions: ${data.metrics?.contributions ?? 0}`,
        `Commits: ${data.metrics?.commits ?? 0}`,
        `Public Repositories: ${data.metrics?.repositories ?? 0}`,
        `Stars: ${data.metrics?.stars ?? 0}`,
        `Forks: ${data.metrics?.forks ?? 0}`,
        `Pull Requests: ${data.metrics?.pullRequests ?? 0}`,
        `Issues: ${data.metrics?.issues ?? 0}`,
        `Reviews: ${data.metrics?.reviews ?? 0}`,
        `Languages: ${data.metrics?.languages ?? 0}`,
        `Recent Repositories: ${data.metrics?.recentRepositories ?? 0}`,
      ];

      metrics.forEach((metric) => {
        addText(`• ${metric}`);
      });

      y += 3;

      // --------------------------------------------------
      // SCORE BREAKDOWN
      // --------------------------------------------------

      addSection("Score Breakdown");

      const breakdown = data.score_breakdown;

      if (breakdown) {
        addText(`Contributions: ${breakdown.contributions}/25`);

        addText(`Commits: ${breakdown.commits}/20`);

        addText(`Repositories: ${breakdown.repositories}/15`);

        addText(`Stars: ${breakdown.stars}/15`);

        addText(`Forks: ${breakdown.forks}/5`);

        addText(`Languages: ${breakdown.languages}/10`);

        addText(`Activity: ${breakdown.activity}/10`);
      }

      y += 3;

      // --------------------------------------------------
      // TECHNICAL STACK
      // --------------------------------------------------

      addSection("Technical Stack");

      if (data.top_languages && data.top_languages.length > 0) {
        data.top_languages.forEach(
          (language: { language: string; percentage: number }) => {
            addText(`• ${language.language}: ${language.percentage}%`);
          },
        );
      } else {
        addText("No language data available.");
      }

      y += 3;

      // --------------------------------------------------
      // TOP REPOSITORIES
      // --------------------------------------------------

      addSection("Top Repositories");

      if (data.top_repositories && data.top_repositories.length > 0) {
        data.top_repositories.forEach((repo: any) => {
          addText(repo.name, 10, true);

          if (repo.description) {
            addText(repo.description);
          }

          addText(
            `Stars: ${repo.stars ?? 0} | Forks: ${
              repo.forks ?? 0
            } | Language: ${repo.language ?? "Unknown"}`,
          );

          y += 2;
        });
      } else {
        addText("No repositories available.");
      }

      // --------------------------------------------------
      // STRENGTHS
      // --------------------------------------------------

      addSection("Strengths");

      if (data.strengths && data.strengths.length > 0) {
        data.strengths.forEach((strength: string) => {
          addText(`• ${strength}`);
        });
      }

      y += 3;

      // --------------------------------------------------
      // RECOMMENDATIONS
      // --------------------------------------------------

      addSection("Recommendations");

      if (data.recommendations && data.recommendations.length > 0) {
        data.recommendations.forEach((recommendation: string) => {
          addText(`• ${recommendation}`);
        });
      }

      y += 3;

      // --------------------------------------------------
      // CAREER SUMMARY
      // --------------------------------------------------

      if (data.career_summary) {
        addSection("Career Summary");

        addText(data.career_summary);
      }

      // --------------------------------------------------
      // CREATOR FOOTER
      // --------------------------------------------------

      // Make sure footer is always at the bottom
      // of the current page.
      if (y > pageHeight - 35) {
        addNewPage();
      }

      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

      pdf.setFont("helvetica", "normal");

      pdf.setFontSize(8);

      pdf.text("Created by Himanshu Kumar Shahi", margin, pageHeight - 14);

      pdf.text("GitHub: github.com/HimanshuKumarShahi", margin, pageHeight - 9);

      // --------------------------------------------------
      // DOWNLOAD
      // --------------------------------------------------

      pdf.save(`${data.username}-github-report.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);

      alert("Could not generate the PDF. Please try again.");
    }
  }

  const tierStyle = TIER_STYLES[data?.tier] || TIER_STYLES.Novice;

  return (
    <main className="min-h-screen overflow-hidden bg-transparent text-neutral-100">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-[140px]" />

        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/70 px-4 py-2 text-xs text-neutral-400 backdrop-blur">
            <Sparkles size={14} className="text-purple-400" />
            AI-powered GitHub intelligence
          </div>

          <h1 className="text-5xl font-black tracking-[-0.05em] sm:text-7xl">
            Know your
            <span className="block bg-gradient-to-r from-white via-purple-200 to-cyan-300 bg-clip-text text-transparent">
              GitHub potential.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-neutral-400 sm:text-base">
            Analyze your GitHub profile, measure your engineering activity,
            discover your strongest career roles, and generate a professional
            developer report.
          </p>
        </section>

        {/* Search */}
        <form onSubmit={handleAnalyze} className="mx-auto mt-10 max-w-2xl">
          <div className="flex items-center rounded-2xl border border-neutral-800 bg-neutral-900/80 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl focus-within:border-neutral-600">
            <Search size={19} className="ml-3 text-neutral-500" />

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="GitHub username or profile URL"
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-neutral-600"
            />

            <button
              type="submit"
              disabled={loading}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}

              {loading ? "Analyzing" : "Analyze profile"}
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-4 text-left shadow-lg shadow-red-950/20 backdrop-blur-xl"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-500/15">
                <XCircle size={18} className="text-red-400" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-red-300">
                  Analysis failed
                </p>

                <p className="mt-1 text-sm leading-5 text-red-200/80">
                  {error}
                </p>
              </div>
            </div>
          )}
        </form>

        {/* REPORT */}
        {data && (
          <div ref={reportRef} className="mt-14 space-y-5">
            {/* Profile */}
            <section
              className={`rounded-3xl border ${tierStyle.border} bg-neutral-900/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8`}
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                  <img
                    src={data.profile.avatar_url}
                    alt={data.username}
                    crossOrigin="anonymous"
                    className="h-20 w-20 rounded-2xl border border-neutral-700 object-cover"
                  />

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-black">
                        {data.profile.name}
                      </h2>

                      <a
                        href={data.profile.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-500 transition hover:text-white"
                      >
                        <ArrowUpRight size={16} />
                      </a>
                    </div>

                    <p className="text-sm text-neutral-500">@{data.username}</p>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-400">
                      {data.profile.bio}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-neutral-500">
                      {data.profile.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={13} />
                          {data.profile.location}
                        </span>
                      )}

                      {data.profile.company && (
                        <span className="flex items-center gap-1">
                          <Building2 size={13} />
                          {data.profile.company}
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <Users size={13} />
                        {data.profile.followers} followers
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={downloadPDF}
                  className="flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-xs font-bold transition hover:bg-neutral-700"
                >
                  <Download size={15} />
                  Download PDF
                </button>
              </div>
            </section>

            {/* Main score */}
            <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <div
                className={`rounded-3xl border ${tierStyle.border} bg-neutral-900/60 p-7 backdrop-blur-xl`}
              >
                <div className="flex justify-center">
                  <ScoreRing score={data.score} tier={data.tier} />
                </div>

                <div className="mt-3 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                    Developer score
                  </p>

                  <p className="mt-3 text-sm leading-6 text-neutral-400">
                    Based on contribution activity, repositories, commits,
                    stars, languages, forks and recent activity.
                  </p>
                </div>
              </div>

              {/* Job match */}
              <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-neutral-900/70 to-neutral-900/70 p-7 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  <Briefcase size={15} className="text-purple-400" />
                  Best career matches
                </div>

                <h3 className="mt-5 text-3xl font-black tracking-tight">
                  {data.job_match}
                </h3>

                <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-400">
                  {data.career_summary}
                </p>

                <div className="mt-7 space-y-3">
                  {data.role_scores.map((role: any) => (
                    <div key={role.role} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-300">{role.role}</span>

                        <span className="text-neutral-500">{role.score}%</span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-700"
                          style={{
                            width: `${role.score}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Metrics */}
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {METRICS.map((metric) => {
                const Icon = metric.icon;

                return (
                  <div
                    key={metric.key}
                    className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 backdrop-blur"
                  >
                    <Icon size={17} className="text-neutral-500" />

                    <p className="mt-4 text-2xl font-black">
                      {data.metrics[metric.key]?.toLocaleString() || 0}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      {metric.label}
                    </p>
                  </div>
                );
              })}
            </section>

            {/* Score breakdown */}
            <section className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-xl sm:p-7">
              <div className="flex items-center gap-2">
                <Trophy size={17} className="text-amber-400" />

                <h3 className="font-bold">Score breakdown</h3>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(data.score_breakdown).map(
                  ([key, value]: any) => (
                    <div
                      key={key}
                      className="rounded-2xl bg-neutral-950/60 p-4"
                    >
                      <div className="flex justify-between">
                        <span className="text-xs capitalize text-neutral-500">
                          {key.replace(/_/g, " ")}
                        </span>

                        <span className="text-sm font-bold">+{value}</span>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                          style={{
                            width: `${Math.min(100, Number(value) * 4)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            </section>

            {/* Languages */}
            <section className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-xl sm:p-7">
              <div className="flex items-center gap-2">
                <Code2 size={17} className="text-cyan-400" />

                <h3 className="font-bold">Technical stack</h3>
              </div>

              <div className="mt-6 space-y-4">
                {data.top_languages.map((item: any) => (
                  <div key={item.language}>
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="font-medium text-neutral-300">
                        {item.language}
                      </span>

                      <span className="text-neutral-500">
                        {item.percentage}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
                        style={{
                          width: `${item.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Repositories */}
            <section className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-xl sm:p-7">
              <h3 className="font-bold">Top repositories</h3>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {data.top_repositories.map((repo: any) => (
                  <a
                    key={repo.name}
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-2xl border border-neutral-800 bg-neutral-950/50 p-5 transition hover:border-neutral-600"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold group-hover:text-purple-300">
                          {repo.name}
                        </h4>

                        <p className="mt-2 text-xs leading-5 text-neutral-500">
                          {repo.description || "No description provided."}
                        </p>
                      </div>

                      <ArrowUpRight
                        size={15}
                        className="shrink-0 text-neutral-600"
                      />
                    </div>

                    <div className="mt-4 flex gap-4 text-xs text-neutral-500">
                      {repo.language && <span>{repo.language}</span>}

                      <span className="flex items-center gap-1">
                        <Star size={12} />
                        {repo.stars}
                      </span>

                      <span className="flex items-center gap-1">
                        <GitFork size={12} />
                        {repo.forks}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </section>

            {/* AI Insights */}
            <section className="grid gap-5 md:grid-cols-2">
              <div className="rounded-3xl border border-emerald-500/10 bg-neutral-900/50 p-6">
                <h3 className="font-bold">What you're good at</h3>

                <div className="mt-5 space-y-3">
                  {data.strengths.map((item: string) => (
                    <div
                      key={item}
                      className="flex gap-3 rounded-xl bg-neutral-950/50 p-3 text-sm text-neutral-300"
                    >
                      <CheckCircle2
                        size={17}
                        className="mt-0.5 shrink-0 text-emerald-400"
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-cyan-500/10 bg-neutral-900/50 p-6">
                <h3 className="font-bold">How to improve</h3>

                <div className="mt-5 space-y-3">
                  {data.recommendations.map((item: string) => (
                    <div
                      key={item}
                      className="flex gap-3 rounded-xl bg-neutral-950/50 p-3 text-sm text-neutral-300"
                    >
                      <Sparkles
                        size={17}
                        className="mt-0.5 shrink-0 text-cyan-400"
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
