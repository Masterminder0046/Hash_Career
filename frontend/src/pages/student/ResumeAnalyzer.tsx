import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { resumeApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Upload, FileText, Download, RefreshCw, AlertTriangle, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ResumeAnalyzer() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [hasResume, setHasResume] = useState(false);

  const handleUpload = async (f: File) => {
    setFile(f);
    setUploading(true);
    const formData = new FormData();
    formData.append('resume', f);
    try {
      const res = await resumeApi.upload(formData);
      if (res.data.success) {
        setHasResume(true);
        toast.success('Resume uploaded');
      }
    } catch { } finally { setUploading(false); }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await resumeApi.analyze();
      if (res.data.success) {
        setAnalysis(res.data.data);
        toast.success('Analysis complete');
      }
    } catch { } finally { setAnalyzing(false); }
  };

  const scoreData = analysis ? [
    { name: 'ATS Score', score: analysis.atsScore || 0 },
    { name: 'Resume Score', score: analysis.resumeScore || 0 },
  ] : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Resume Analyzer</h1>
          <p className="text-slate-400 mt-1">Upload your resume for AI-powered analysis and suggestions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 text-center">
            <input type="file" ref={fileRef} className="hidden" accept=".pdf,.docx" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-10 hover:border-indigo-500 transition-colors cursor-pointer" onClick={() => fileRef.current?.click()}>
              <Upload className="w-12 h-12 mx-auto text-indigo-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{file ? file.name : 'Upload Your Resume'}</h3>
              <p className="text-sm text-slate-400">PDF or DOCX (Max 10MB)</p>
              {uploading && <div className="flex items-center justify-center gap-2 mt-4 text-indigo-500"><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</div>}
            </div>
          </motion.div>

          {hasResume && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">AI Analysis</h2>
                <button onClick={handleAnalyze} disabled={analyzing} className="btn-primary flex items-center gap-2">
                  {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {analyzing ? 'Analyzing...' : 'Analyze with AI'}
                </button>
              </div>

              {analysis && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-center">
                      <p className="text-3xl font-bold text-indigo-600">{analysis.atsScore || 0}</p>
                      <p className="text-sm text-slate-400 mt-1">ATS Score</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                      <p className="text-3xl font-bold text-purple-600">{analysis.resumeScore || 0}</p>
                      <p className="text-sm text-slate-400 mt-1">Resume Score</p>
                    </div>
                  </div>

                  {analysis.missingKeywords?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-amber-600 flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4" /> Missing Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missingKeywords.map((k: string) => <span key={k} className="badge-warning">{k}</span>)}
                      </div>
                    </div>
                  )}

                  {analysis.weakSections?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-red-600 flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4" /> Weak Sections</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.weakSections.map((s: string) => <span key={s} className="badge-danger">{s}</span>)}
                      </div>
                    </div>
                  )}

                  {analysis.professionalSuggestions?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-emerald-600 flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4" /> Suggestions</h3>
                      <ul className="space-y-1">
                        {analysis.professionalSuggestions.map((s: string, i: number) => (
                          <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                            <span className="text-emerald-500 mt-1">•</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.betterSummary && (
                    <div>
                      <h3 className="text-sm font-medium text-indigo-600 mb-2">Improved Summary</h3>
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                        <p className="text-sm text-slate-600 dark:text-slate-400">{analysis.betterSummary}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h3 className="font-semibold mb-4">Score Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scoreData.length > 0 ? scoreData : [{ name: 'Upload & Analyze', score: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs><linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#a855f7" /></linearGradient></defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h3 className="font-semibold mb-3">Quick Tips</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>• Use action verbs (developed, implemented, designed)</li>
              <li>• Quantify achievements with numbers</li>
              <li>• Keep it to 1-2 pages</li>
              <li>• Include relevant keywords from job descriptions</li>
              <li>• Proofread for grammar and spelling</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
