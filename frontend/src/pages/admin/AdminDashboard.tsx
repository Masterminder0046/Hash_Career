import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../../services/api';
import type { AdminDashboard as AdminDashboardType } from '../../types';
import StatCard from '../../components/common/StatCard';
import { Users, Building2, Brain, Bell, BarChart3, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard().then((res) => {
      if (res.data.success) setData(res.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>;

  const stats = data?.stats;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">System-wide management and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} color="indigo" />
        <StatCard title="Companies" value={stats?.totalCompanies || 0} icon={Building2} color="emerald" />
        <StatCard title="Predictions" value={stats?.totalPredictions || 0} icon={Brain} color="purple" />
        <StatCard title="Unread Notifications" value={stats?.unreadNotifications || 0} icon={Bell} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Users by Role</h2>
          <div className="grid grid-cols-3 gap-4">
            {[{ label: 'Students', value: stats?.totalStudents || 0, color: 'text-indigo-600' },
              { label: 'Officers', value: stats?.totalOfficers || 0, color: 'text-purple-600' },
              { label: 'Admins', value: stats?.totalAdmins || 0, color: 'text-emerald-600' }
            ].map((item) => (
              <div key={item.label} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-sm text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">System Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            {[{ label: 'Interviews', value: stats?.totalInterviews || 0 },
              { label: 'Roadmaps', value: stats?.totalRoadmaps || 0 },
              { label: 'Students', value: stats?.totalStudents || 0 },
              { label: 'Companies', value: stats?.totalCompanies || 0 },
            ].map((item) => (
              <div key={item.label} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
                <span className="text-sm text-slate-400">{item.label}</span>
                <span className="font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {data?.recentUsers && data.recentUsers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Users</h2>
          <div className="space-y-3">
            {data.recentUsers.map((u: any) => (
              <div key={u._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">{u.name?.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                </div>
                <span className="text-xs capitalize badge-info">{u.role?.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
