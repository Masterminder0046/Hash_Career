import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { officerApi } from '../../services/api';
import { OfficerDashboard } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#f59e0b', '#10b981'];

export default function OfficerAnalytics() {
  const [data, setData] = useState<OfficerDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    officerApi.getDashboard().then((res) => {
      if (res.data.success) setData(res.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Analytics</h1>
        <p className="text-slate-400 mt-1">Detailed placement analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Department Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.departmentStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgCgpa" fill="#6366f1" name="Avg CGPA" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgResumeScore" fill="#8b5cf6" name="Avg Resume Score" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Company Eligibility</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.companyEligibility?.slice(0, 10) || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="company" width={100} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="percentage" fill="#d946ef" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Most Missing Skills</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data?.mostMissingSkills?.slice(0, 15) || []} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="skill" width={120} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
