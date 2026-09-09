'use client';

import { useState } from 'react';
import { analyzeProfile } from './actions';
import { 
  Search, 
  Sparkles, 
  Trophy, 
  Briefcase, 
  CheckCircle2, 
  ArrowUpRight, 
  Star, 
  GitFork, 
  FolderGit2, 
  Loader2, 
  Award
} from 'lucide-react';

const TIER_STYLES: Record<string, { badge: string; glow: string; border: string }> = {
  'S-Tier': {
    badge: 'bg-gradient-to-r from-amber-400 via-rose-500 to-purple-500 text-white shadow-amber-500/20',
    glow: 'from-amber-500/10 via-purple-500/10 to-transparent',
    border: 'border-amber-500/30'
  },
  'A-Tier': {
    badge: 'bg-gradient-to-r from-emerald-400 to-cyan-500 text-neutral-950 font-bold shadow-emerald-500/20',
    glow: 'from-emerald-500/10 via-cyan-500/10 to-transparent',
    border: 'border-emerald-500/30'
  },
  'B-Tier': {
    badge: 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-blue-500/20',
    glow: 'from-sky-500/10 via-blue-500/10 to-transparent',
    border: 'border-sky-500/30'
  },
  'Novice': {
    badge: 'bg-neutral-800 text-neutral-300',
    glow: 'from-neutral-800/20 to-transparent',
    border: 'border-neutral-800'
  }
};

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3776ab',
  Rust: '#dea584',
  Go: '#00add8',
  Java: '#b07219',
  'C++': '#f34b7d',
};

export default function GitHubRanker() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setData(null);

    try {
      const result = await analyzeProfile(input);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze user.');
    } finally {
      setLoading(false);
    }
  };

  const activeTier = data ? TIER_STYLES[data.tier] || TIER_STYLES['Novice'] : null;

  return (
    <main className="min-h-screen bg-[#07090e] text-neutral-100 flex flex-col items-center px-4 py-16 selection:bg-purple-500 selection:text-white relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-purple-600/15 via-indigo-500/10 to-cyan-500/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Header */}
      <div className="relative text-center max-w-2xl mb-10 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-neutral-800 bg-neutral-900/80 backdrop-blur text-neutral-300 mb-4 shadow-inner">
          <Sparkles size={13} className="text-purple-400" />
          Powered by Gemini 2.5 & GitHub Graph Data
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-neutral-200 to-neutral-500 font-sans">
          GitHub Portfolio Ranker
        </h1>
        <p className="mt-3 text-sm sm:text-base text-neutral-400 font-normal">
          Instant deterministic rankings, verified tech stack metrics, and AI career matching.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleAnalyze} className="relative w-full max-w-lg mb-10 z-10">
        <div className="flex items-center bg-neutral-900/80 border border-neutral-800 focus-within:border-neutral-600 rounded-2xl p-1.5 backdrop-blur-xl shadow-2xl transition duration-200">
          <div className="pl-3.5 text-neutral-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Username or https://github.com/torvalds"
            className="w-full bg-transparent px-3 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-neutral-100 to-neutral-200 hover:from-white hover:to-neutral-100 text-neutral-950 text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            {loading ? 'Evaluating...' : 'Evaluate'}
          </button>
        </div>
        {error && <p className="mt-2.5 text-xs text-rose-400 text-center font-medium">{error}</p>}
      </form>

      {/* Evaluation Dashboard Card */}
      {data && (
        <div className={`relative w-full max-w-2xl bg-neutral-900/50 border ${activeTier?.border} backdrop-blur-2xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl z-10 transition-all duration-300`}>
          {/* Header Area */}
          <div className="flex items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
            <div className="flex items-center gap-4">
              <img
                src={data.avatar_url}
                alt={data.username}
                className="w-16 h-16 rounded-2xl border border-neutral-700/60 object-cover shadow-lg ring-2 ring-neutral-800"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight">@{data.username}</h2>
                  <a
                    href={`https://github.com/${data.username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-500 hover:text-neutral-200 transition"
                  >
                    <ArrowUpRight size={16} />
                  </a>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                  {data.bio || 'Public open-source developer.'}
                </p>
              </div>
            </div>

            {/* Visual Tier Chip */}
            <div className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg ${activeTier?.badge}`}>
              {data.tier}
            </div>
          </div>

          {/* Metric Overview Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Score Ring / Number */}
            <div className="bg-neutral-950/60 border border-neutral-800/70 p-4 rounded-2xl flex flex-col justify-between">
              <span className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
                <Trophy size={14} className="text-amber-400" />
                Score
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black tracking-tight text-white">{data.score}</span>
                <span className="text-xs text-neutral-500">/ 100</span>
              </div>
              <div className="w-full h-1 bg-neutral-800 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full transition-all duration-700" 
                  style={{ width: `${data.score}%` }} 
                />
              </div>
            </div>

            {/* AI Best Fit Role */}
            <div className="col-span-1 sm:col-span-2 bg-neutral-950/60 border border-neutral-800/70 p-4 rounded-2xl flex flex-col justify-between">
              <span className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
                <Briefcase size={14} className="text-purple-400" />
                Target Engineering Role
              </span>
              <p className="text-base font-semibold text-purple-300 mt-1 leading-snug">
                {data.job_match}
              </p>
              <span className="text-[11px] text-neutral-500 mt-1">Based on language weights & original repos</span>
            </div>
          </div>

          {/* Languages Breakdown */}
          <div className="bg-neutral-950/40 border border-neutral-800/60 p-4 rounded-2xl space-y-3">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
              Verified Language Distribution
            </span>
            <div className="space-y-2.5">
              {data.top_languages.map((item: any) => {
                const color = LANG_COLORS[item.language] || '#a855f7';
                return (
                  <div key={item.language} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="flex items-center gap-2 text-neutral-300 font-medium">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        {item.language}
                      </span>
                      <span className="text-neutral-500">{item.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${item.percentage}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Insights: Strengths & Recommendations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="bg-neutral-950/40 border border-neutral-800/60 p-4 rounded-2xl space-y-2">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Identified Strengths</span>
              <ul className="space-y-2">
                {(data.strengths || []).map((str: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-neutral-300 leading-relaxed">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-neutral-950/40 border border-neutral-800/60 p-4 rounded-2xl space-y-2">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Growth Roadmap</span>
              <ul className="space-y-2">
                {(data.recommendations || []).map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-neutral-300 leading-relaxed">
                    <Star size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}