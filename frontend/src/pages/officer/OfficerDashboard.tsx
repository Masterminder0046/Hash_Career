import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { officerApi } from '../../services/api';
import { OfficerDashboard as OfficerDashboardType } from '../../types';
import StatCard from '../../components/common/StatCard';
import { StatsSkeleton } from '../../components/common/LoadingSkeleton';
import { Users, FileText, Brain, AlertTriangle, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#f59e0b', '#10b981', '#ef4444'];

export default function OfficerDashboard() {
  const [data, setData] = useState<OfficerDashboardType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await officerApi.getDashboard();
        if (res.data.success) setData(res.data.data);
      } catch { } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleExport = async () => {
    try {
      const res = await officerApi.exportCsv();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'students.csv';
      a.click();
      toast.success('CSV exported');
    } catch { toast.error('Export failed'); }
  };

  if (loading) return <StatsSkeleton />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Placement Officer Dashboard</h1>
          <p className="text-slate-400 mt-1">Monitor student placement readiness</p>
        </div>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={data?.totalStudents || 0} icon={Users} color="indigo" />
        <StatCard title="Placement Ready" value={data?.placementReady || 0} icon={FileText} color="emerald" subtitle={`${data?.studentsWithResume || 0} with resumes`} />
        <StatCard title="At Risk" value={data?.atRisk || 0} icon={AlertTriangle} color="rose" />
        <StatCard title="Avg Probability" value={`${data?.avgPlacementProbability || 0}%`} icon={Brain} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Company Eligibility</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.companyEligibility?.slice(0, 8) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="company" tick={{ fontSize: 10 }} angle={-45} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="percentage" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Department Analytics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data?.departmentStats || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={100} label={({ _id, count }) => `${_id}: ${count}`}>
                {(data?.departmentStats || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Skill Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data?.skillDistribution?.slice(0, 15) || []} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="skill" width={120} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
