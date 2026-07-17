import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { officerApi, predictionApi } from '../../services/api';
import { StudentProfile, Prediction } from '../../types';
import { ArrowLeft, User, Mail, BookOpen, Award, Github, Linkedin, TrendingUp, Brain } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function OfficerStudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await officerApi.getStudentDetail(id!);
        if (res.data.success) {
          setStudent(res.data.data.student);
          setPredictions(res.data.data.predictions || []);
        }
      } catch { } finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="skeleton h-96 rounded-2xl" />;
  if (!student) return <div className="text-center py-12 text-slate-400">Student not found</div>;

  const chartData = predictions.map((p) => ({
    date: new Date(p.createdAt).toLocaleDateString().slice(0, 5),
    probability: p.probability,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-indigo-500 hover:underline"><ArrowLeft className="w-4 h-4" /> Back</button>

      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
            {(student as any).userId?.name?.charAt(0) || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold truncate">{(student as any).userId?.name}</h1>
            <p className="text-slate-400 truncate">{(student as any).userId?.email}</p>
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex items-center gap-1 text-sm"><BookOpen className="w-4 h-4 text-indigo-500" /> {student.academic?.department}</div>
              <div className="flex items-center gap-1 text-sm"><Award className="w-4 h-4 text-emerald-500" /> CGPA: {student.academic?.cgpa}</div>
              <div className="flex items-center gap-1 text-sm"><TrendingUp className="w-4 h-4 text-purple-500" /> Resume: {student.resumeScore}%</div>
              {student.githubUrl && <a href={student.githubUrl} target="_blank" className="flex items-center gap-1 text-sm text-slate-400 hover:text-indigo-500"><Github className="w-4 h-4" /> GitHub</a>}
              {student.linkedinUrl && <a href={student.linkedinUrl} target="_blank" className="flex items-center gap-1 text-sm text-slate-400 hover:text-indigo-500"><Linkedin className="w-4 h-4" /> LinkedIn</a>}
            </div>
          </div>
          <div className="sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800/50">
            <p className="text-sm text-slate-400">Status</p>
            {student.isPlacementReady ? <span className="badge-success inline-block mt-1">Placement Ready</span> : <span className="badge-warning inline-block mt-1">At Risk</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-3">Skills ({student.skills.length})</h3>
          <div className="flex flex-wrap gap-1.5">
            {student.skills.map((s) => <span key={s} className="badge-info">{s}</span>)}
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-3">Projects ({student.projects.length})</h3>
          <div className="space-y-2">
            {student.projects.map((p, i) => (
              <div key={i} className="text-sm p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-slate-400">{p.technologies?.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-3">Scores</h3>
          <div className="space-y-3">
            {[{ label: 'Coding', value: student.codingScore }, { label: 'Communication', value: student.communicationScore }, { label: 'Attendance', value: student.attendance }].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-sm"><span>{s.label}</span><span className="font-medium">{s.value}%</span></div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1">
                  <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${s.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Prediction History</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="probability" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
