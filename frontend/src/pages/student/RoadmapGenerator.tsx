import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { roadmapApi } from '../../services/api';
import { Roadmap } from '../../types';
import { Map, Loader2, CheckCircle, Circle, Clock, Target, BookOpen, ExternalLink, Trash2 } from 'lucide-react';

export default function RoadmapGenerator() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState<Roadmap | null>(null);
  const [duration, setDuration] = useState(30);
  const [targetCompany, setTargetCompany] = useState('');

  const fetchRoadmaps = async () => {
    try {
      const res = await roadmapApi.getAll();
      if (res.data.success) setRoadmaps(res.data.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchRoadmaps(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await roadmapApi.create({ duration, targetCompany: targetCompany || undefined });
      await fetchRoadmaps();
      setDuration(30);
      setTargetCompany('');
    } catch { } finally { setGenerating(false); }
  };

  const handleWeekComplete = async (roadmapId: string, week: number) => {
    try {
      const res = await roadmapApi.updateWeek(roadmapId, week);
      if (res.data.success) {
        setSelected(res.data.data);
        setRoadmaps(roadmaps.map((r) => r._id === roadmapId ? res.data.data : r));
      }
    } catch { }
  };

  const handleDelete = async (id: string) => {
    try {
      await roadmapApi.delete(id);
      setRoadmaps(roadmaps.filter((r) => r._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch { }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Roadmap Generator</h1>
          <p className="text-slate-400 mt-1">AI-generated personalized placement preparation roadmap</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="flex-1">
            <label className="text-sm text-slate-400 mb-1 block">Duration</label>
            <select className="input-field" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
              <option value={30}>30 Days</option>
              <option value={60}>60 Days</option>
              <option value={90}>90 Days</option>
            </select>
          </div>
          <div className="flex-[2]">
            <label className="text-sm text-slate-400 mb-1 block">Target Company (optional)</label>
            <input className="input-field" placeholder="e.g., Google, Microsoft, TCS" value={targetCompany} onChange={(e) => setTargetCompany(e.target.value)} />
          </div>
          <button onClick={handleGenerate} disabled={generating} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Map className="w-4 h-4" />}
            Generate Roadmap
          </button>
        </div>
      </div>

      {roadmaps.length > 0 && !selected && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roadmaps.map((r) => (
            <div key={r._id} className="glass-card p-6 cursor-pointer hover:shadow-xl transition-all" onClick={() => setSelected(r)}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl">
                  <Map className="w-5 h-5 text-indigo-600" />
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-semibold">{r.duration}-Day Roadmap</h3>
              {r.targetCompany && <p className="text-sm text-indigo-500">Target: {r.targetCompany}</p>}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${r.progress}%` }} />
                </div>
                <span className="text-sm font-medium">{r.progress}%</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">{r.completedWeeks.length}/{r.weeks.length} weeks completed</p>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <button onClick={() => setSelected(null)} className="text-sm text-indigo-500 hover:underline">&larr; Back to roadmaps</button>

          <div className="glass-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold">{selected.duration}-Day Preparation Roadmap</h2>
                {selected.targetCompany && <p className="text-sm text-indigo-500">Targeting: {selected.targetCompany}</p>}
              </div>
              <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800/50">
                <p className="text-2xl font-bold text-indigo-600">{selected.progress}%</p>
                <p className="text-xs text-slate-400">Complete</p>
              </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
              <div className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all" style={{ width: `${selected.progress}%` }} />
            </div>
          </div>

          {selected.weeks.map((week, i) => (
            <div key={i} className="glass-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 ${
                    selected.completedWeeks.includes(week.week) ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}>
                    {selected.completedWeeks.includes(week.week) ? <CheckCircle className="w-5 h-5" /> : week.week}
                  </div>
                  <div>
                    <h3 className="font-semibold">{week.title}</h3>
                    <p className="text-xs text-slate-400">{week.topics.length} topics</p>
                  </div>
                </div>
                {!selected.completedWeeks.includes(week.week) && (
                  <button onClick={() => handleWeekComplete(selected._id, week.week)} className="btn-outline text-sm py-2 w-full sm:w-auto text-center">
                    Mark Complete
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-1"><BookOpen className="w-4 h-4" /> Topics</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {week.topics.map((t) => <span key={t} className="badge-info">{t}</span>)}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Resources</h4>
                  <div className="space-y-1">
                    {week.resources.map((r, idx) => (
                      <a key={idx} href={r.url} target="_blank" className="flex items-center gap-1 text-xs text-indigo-500 hover:underline">
                        <ExternalLink className="w-3 h-3" /> {r.title}
                      </a>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Practice Platforms</h4>
                  <div className="space-y-1">
                    {week.practicePlatforms.map((p, idx) => (
                      <a key={idx} href={p.url} target="_blank" className="flex items-center gap-1 text-xs text-indigo-500 hover:underline">
                        <ExternalLink className="w-3 h-3" /> {p.name} - {p.focusArea}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {week.projects.length > 0 && (
                <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                  <h4 className="text-sm font-medium mb-2">Project: {week.projects[0].title}</h4>
                  <p className="text-xs text-slate-500">{week.projects[0].description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {week.projects[0].technologies.map((t) => <span key={t} className="text-xs px-2 py-0.5 bg-white dark:bg-slate-800 rounded-md">{t}</span>)}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Interview Preparation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Topics</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selected.interviewPreparation.topics.map((t) => <span key={t} className="badge-info">{t}</span>)}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Resources</h3>
                <ul className="space-y-1">
                  {selected.interviewPreparation.resources.slice(0, 3).map((r, idx) => (
                    <li key={idx} className="text-xs text-indigo-500">{r.title}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Tips</h3>
                <ul className="space-y-1">
                  {selected.interviewPreparation.tips.slice(0, 3).map((t, idx) => (
                    <li key={idx} className="text-xs text-slate-600 dark:text-slate-400">• {t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
