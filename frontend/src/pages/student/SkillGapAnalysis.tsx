import { useState } from 'react';
import { motion } from 'framer-motion';
import { skillGapApi } from '../../services/api';
import { SkillGap } from '../../types';
import { Target, Loader2, BookOpen, TrendingUp, Clock, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

export default function SkillGapAnalysis() {
  const [data, setData] = useState<SkillGap | null>(null);
  const [loading, setLoading] = useState(false);
  const [targetCompany, setTargetCompany] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await skillGapApi.analyze(targetCompany || undefined);
      if (res.data.success) setData(res.data.data);
    } catch { } finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Skill Gap Analysis</h1>
          <p className="text-slate-400 mt-1">Identify missing skills and get a personalized learning path</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input className="input-field" placeholder="Target company (optional)" value={targetCompany} onChange={(e) => setTargetCompany(e.target.value)} />
          </div>
          <button onClick={handleAnalyze} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
            Analyze Gaps
          </button>
        </div>
      </div>

      {data && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card text-center">
              <p className="text-3xl font-bold text-indigo-600">{data.coverage}%</p>
              <p className="text-sm text-slate-400">Skill Coverage</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-3xl font-bold text-amber-600">{data.totalGaps}</p>
              <p className="text-sm text-slate-400">Skill Gaps</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-3xl font-bold text-emerald-600">{data.currentSkills}</p>
              <p className="text-sm text-slate-400">Your Skills</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-3xl font-bold text-purple-600">{data.requiredSkills}</p>
              <p className="text-sm text-slate-400">Required Skills</p>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /> Missing Skills by Priority</h2>
            <div className="space-y-3">
              {data.missingSkills.slice(0, 15).map((s, i) => (
                <div key={s.skill} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-xs font-medium text-indigo-600">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium capitalize">{s.skill}</p>
                      <p className="text-xs text-slate-400">Required by {s.companies.length} companies</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      s.priority >= 5 ? 'bg-red-100 dark:bg-red-900/20 text-red-600' :
                      s.priority >= 3 ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' :
                      'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600'
                    }`}>
                      {s.priority >= 5 ? 'High' : s.priority >= 3 ? 'Medium' : 'Low'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      s.difficulty === 'hard' ? 'bg-red-100 dark:bg-red-900/20 text-red-600' :
                      s.difficulty === 'medium' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' :
                      'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600'
                    }`}>{s.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-500" /> Learning Order</h2>
            <div className="space-y-3">
              {data.learningOrder.slice(0, 10).map((item) => (
                <div key={item.skill} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">{item.order}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium capitalize">{item.skill}</p>
                    <p className="text-xs text-slate-400">Priority: {item.priority}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" /> ~{item.estimatedDays} days
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-500" /> Recommendations</h2>
            <ul className="space-y-2">
              {data.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" /> {rec}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}
