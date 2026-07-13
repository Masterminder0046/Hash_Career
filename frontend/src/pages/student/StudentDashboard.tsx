import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authApi, predictionApi, resumeApi, notificationApi } from '../../services/api';
import { StudentProfile, Prediction, Notification } from '../../types';
import StatCard from '../../components/common/StatCard';
import { StatsSkeleton, CardSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Brain, FileText, Building2, Target, TrendingUp,
  BookOpen, Zap, Award, ChevronRight, Bell,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const quickActions = [
  { label: 'Analyze Resume', icon: FileText, path: '/resume', color: 'from-indigo-500 to-blue-600' },
  { label: 'Match Companies', icon: Building2, path: '/matching', color: 'from-purple-500 to-pink-600' },
  { label: 'Placement Prediction', icon: Brain, path: '/prediction', color: 'from-emerald-500 to-teal-600' },
  { label: 'Practice Interview', icon: Zap, path: '/interview', color: 'from-amber-500 to-orange-600' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, predRes, notifRes] = await Promise.all([
          authApi.getProfile(),
          predictionApi.predict().catch(() => null),
          notificationApi.getAll().catch(() => null),
        ]);
        if (profileRes.data.success) setProfile(profileRes.data.data.profile);
        if (predRes?.data.success) setPrediction(predRes.data.data.prediction);
        if (notifRes?.data.success) setNotifications(notifRes.data.data.notifications || []);
      } catch (err) { } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="space-y-6"><StatsSkeleton /><CardSkeleton /></div>;

  const chartData = [
    { name: 'Resume', score: profile?.resumeScore || 0 },
    { name: 'Coding', score: profile?.codingScore || 0 },
    { name: 'Communication', score: profile?.communicationScore || 0 },
    { name: 'Attendance', score: profile?.attendance || 0 },
  ];

  const radarData = [
    { name: 'CGPA', value: (profile?.academic.cgpa || 0) / 10 * 100 },
    { name: 'Skills', value: Math.min(100, (profile?.skills.length || 0) * 10) },
    { name: 'Projects', value: Math.min(100, (profile?.projects.length || 0) * 20) },
    { name: 'Experience', value: Math.min(100, (profile?.experiences.length || 0) * 30) },
  ];
  const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#f59e0b'];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, {user?.name}! Ready for placements?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Resume Score" value={`${profile?.resumeScore || 0}%`} icon={FileText} color="indigo" />
        <StatCard title="Profile Completion" value={`${profile?.profileCompletion || 0}%`} icon={TrendingUp} color="emerald" subtitle={profile?.isPlacementReady ? 'Placement Ready' : 'Incomplete'} />
        <StatCard title="Skills" value={profile?.skills.length || 0} icon={Award} color="purple" subtitle="Technical skills" />
        <StatCard title="Placement Probability" value={prediction ? `${prediction.probability}%` : 'N/A'} icon={Brain} color="amber" subtitle={prediction?.confidence || ''} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Performance Overview</h2>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="rgba(148, 163, 184, 0.15)" />
              <PolarAngleAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Radar name="Performance" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <button key={action.path} onClick={() => navigate(action.path)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm flex-1 text-left">{action.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-500" /> Recent Notifications
            </h3>
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400">No new notifications</p>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 3).map((n) => (
                  <div key={n._id} className="text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="font-medium text-slate-700 dark:text-slate-300">{n.title}</p>
                    <p className="text-slate-400 mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Score Breakdown</h2>
          <div className="space-y-4">
            {chartData.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">{item.name}</span>
                  <span className="font-medium">{item.score}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Placement Prediction Factors</h2>
          {prediction?.featureImportance?.slice(0, 6).map((f, i) => (
            <div key={f.feature} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize text-slate-500">{f.feature.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-medium">{Math.round(f.importance * 100)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${f.importance * 100}%` }} />
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-slate-400">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Run placement prediction to see factors</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
