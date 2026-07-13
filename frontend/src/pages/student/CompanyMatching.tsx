import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { matchingApi } from '../../services/api';
import { CompanyMatch } from '../../types';
import { GitCompare, CheckCircle, XCircle, AlertTriangle, Target, ChevronDown, ChevronUp, Building2, TrendingUp } from 'lucide-react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

export default function CompanyMatching() {
  const [matches, setMatches] = useState<CompanyMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'eligible' | 'not-eligible'>('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await matchingApi.getMatches();
        if (res.data.success) setMatches(res.data.data);
      } catch { } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = matches.filter((m) => {
    if (filter === 'eligible') return m.eligible;
    if (filter === 'not-eligible') return !m.eligible;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Company Matching</h1>
          <p className="text-slate-400 mt-1">See how well your profile matches with companies</p>
        </div>
      </div>

      <div className="flex gap-3">
        {(['all', 'eligible', 'not-eligible'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}>{f === 'all' ? 'All' : f === 'eligible' ? 'Eligible' : 'Not Eligible'}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((match, i) => (
            <motion.div
              key={match.company._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card overflow-hidden"
            >
              <div className="p-6 cursor-pointer" onClick={() => setExpanded(expanded === match.company._id ? null : match.company._id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${match.eligible ? 'bg-emerald-100 dark:bg-emerald-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                      {match.eligible ? <CheckCircle className="w-6 h-6 text-emerald-600" /> : <XCircle className="w-6 h-6 text-red-500" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{match.company.name}</h3>
                      <p className="text-sm text-slate-400">{match.company.industry}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-2xl font-bold">{match.matchScore}%</p>
                      <p className="text-xs text-slate-400">Match Score</p>
                    </div>
                    {expanded === match.company._id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {match.matchedSkills.slice(0, 5).map((s) => (
                    <span key={s} className="badge-success">{s}</span>
                  ))}
                  {match.missingSkills.slice(0, 3).map((s) => (
                    <span key={s} className="badge-warning">{s}</span>
                  ))}
                </div>

                {(match.eligible ? match.reasons : match.rejectReasons).slice(0, 2).map((r, idx) => (
                  <p key={idx} className={`text-xs mt-2 ${match.eligible ? 'text-emerald-600' : 'text-red-500'}`}>{r}</p>
                ))}
              </div>

              {expanded === match.company._id && (
                <div className="px-6 pb-6 border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4 animate-slide-up">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-slate-500">Salary Range</h4>
                      <p className="font-semibold">₹{match.company.salary.min.toLocaleString()} - ₹{match.company.salary.max.toLocaleString()}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-slate-500">Min CGPA Required</h4>
                      <p className="font-semibold">{match.company.minCgpa}</p>
                    </div>
                  </div>

                  {match.missingSkills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-amber-600 mb-2">Missing Skills to Improve</h4>
                      <div className="flex flex-wrap gap-2">
                        {match.missingSkills.map((s) => <span key={s} className="badge-warning">{s}</span>)}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium mb-2">Selection Rounds</h4>
                    <div className="space-y-2">
                      {match.company.selectionProcess.rounds.map((round, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-xs font-medium text-indigo-600">{idx + 1}</div>
                          <div>
                            <p className="text-sm font-medium">{round.name}</p>
                            <p className="text-xs text-slate-400">{round.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm italic text-slate-500">{match.summary}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
