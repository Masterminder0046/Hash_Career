import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { interviewApi } from '../../services/api';
import { Interview } from '../../types';
import { Video, Mic, MicOff, Loader2, Send, CheckCircle, ChevronRight, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const interviewTypes = ['hr', 'technical', 'java', 'python', 'react', 'node', 'sql', 'dbms', 'os', 'cn', 'dsa', 'aptitude'];

export default function MockInterview() {
  const [state, setState] = useState<'select' | 'active' | 'complete'>('select');
  const [type, setType] = useState('technical');
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [overallScore, setOverallScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [history, setHistory] = useState<Interview[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    interviewApi.getHistory().then((res) => {
      if (res.data.success) setHistory(res.data.data);
    }).catch(() => {});
  }, []);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setAnswer((prev) => prev + ' ' + transcript);
        setListening(false);
      };
      recognition.onerror = () => setListening(false);
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
    } else {
      toast.error('Speech recognition not supported in this browser');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await interviewApi.start(type);
      if (res.data.success) {
        setInterviewId(res.data.data.interviewId);
        setCurrentQuestion(res.data.data.question);
        setQuestionIndex(0);
        setTotalQuestions(res.data.data.totalQuestions);
        setState('active');
        setAnswer('');
        setEvaluation(null);
      }
    } catch { } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return toast.error('Please provide an answer');
    setLoading(true);
    try {
      const res = await interviewApi.submitAnswer({
        interviewId: interviewId!,
        answer: answer.trim(),
        questionIndex,
      });
      if (res.data.success) {
        if (res.data.data.completed) {
          setReport(res.data.data.report);
          setOverallScore(res.data.data.overallScore);
          setState('complete');
        } else {
          setEvaluation(res.data.data.evaluation);
          setCurrentQuestion(res.data.data.nextQuestion);
          setQuestionIndex(res.data.data.nextQuestionNumber - 1);
          setAnswer('');
        }
      }
    } catch { } finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">AI Mock Interview</h1>
          <p className="text-slate-400 mt-1">Practice with AI-powered interviews using text or voice</p>
        </div>
      </div>

      {state === 'select' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Select Interview Type</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {interviewTypes.map((t) => (
                <button key={t} onClick={() => setType(t)} className={`p-3 rounded-xl text-sm font-medium transition-all capitalize ${type === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>{t}</button>
              ))}
            </div>
            <button onClick={handleStart} disabled={loading} className="btn-primary mt-6 w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
              Start Interview
            </button>
          </div>

          {history.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4">Past Interviews</h2>
              <div className="space-y-3">
                {history.map((h) => (
                  <div key={h._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium capitalize">{h.type} Interview</p>
                      <p className="text-xs text-slate-400">{new Date(h.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-indigo-600">{h.overallScore}/10</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${h.overallScore >= 7 ? 'bg-emerald-100 text-emerald-600' : h.overallScore >= 5 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-500'}`}>{h.overallScore >= 7 ? 'Good' : h.overallScore >= 5 ? 'Average' : 'Needs Work'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {state === 'active' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-400">Question {questionIndex + 1} of {totalQuestions}</span>
              <span className="badge-info capitalize">{type}</span>
            </div>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl mb-6">
              <p className="text-lg font-medium">{currentQuestion}</p>
            </div>
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} className="input-field h-32 resize-none mb-4" placeholder="Type your answer here..." />
            <div className="flex gap-3">
              <button onClick={listening ? stopListening : startListening} className={`btn-secondary flex items-center gap-2 ${listening ? 'bg-red-100 dark:bg-red-900/20 text-red-500' : ''}`}>
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {listening ? 'Stop' : 'Use Voice'}
              </button>
              <button onClick={handleSubmit} disabled={loading || !answer.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Answer
              </button>
            </div>
          </div>

          {evaluation && (
            <div className="glass-card p-6 animate-fade-in">
              <h2 className="text-lg font-semibold mb-4">Instant Feedback</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                {['grammar', 'technicalAccuracy', 'confidence', 'completeness', 'communication'].map((key) => (
                  <div key={key} className="text-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-lg font-bold text-indigo-600">{evaluation[key] || 0}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{evaluation.feedback}</p>
              {evaluation.suggestions?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1">Suggestions:</p>
                  <ul className="space-y-1">
                    {evaluation.suggestions.map((s: string, i: number) => (
                      <li key={i} className="text-xs text-slate-500">• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {state === 'complete' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
          <div className="glass-card p-8 text-center">
            <div className="inline-flex p-4 bg-emerald-100 dark:bg-emerald-900/20 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Interview Complete!</h2>
            <p className="text-5xl font-bold text-indigo-600 mb-2">{overallScore}/10</p>
            <p className="text-slate-400">Overall Score</p>
          </div>

          {report && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-card p-6">
                <h3 className="font-semibold text-emerald-600 mb-3">Strengths</h3>
                <ul className="space-y-2">
                  {report.strengths.map((s: string, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" /> {s}</li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-6">
                <h3 className="font-semibold text-amber-600 mb-3">Areas to Improve</h3>
                <ul className="space-y-2">
                  {report.weaknesses.map((w: string, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> {w}</li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-6">
                <h3 className="font-semibold text-indigo-600 mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {report.recommendations.map((r: string, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2"><ChevronRight className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" /> {r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="text-center">
            <button onClick={() => setState('select')} className="btn-primary">Practice Again</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
