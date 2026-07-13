import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: typeof LucideIcon;
  color?: string;
  subtitle?: string;
  trend?: { value: number; positive: boolean };
}

export default function StatCard({ title, value, icon: Icon, color = 'indigo', subtitle, trend }: StatCardProps) {
  const colors: Record<string, string> = {
    indigo: 'from-indigo-500/10 to-indigo-600/10 text-indigo-600 dark:text-indigo-400',
    emerald: 'from-emerald-500/10 to-emerald-600/10 text-emerald-600 dark:text-emerald-400',
    amber: 'from-amber-500/10 to-amber-600/10 text-amber-600 dark:text-amber-400',
    rose: 'from-rose-500/10 to-rose-600/10 text-rose-600 dark:text-rose-400',
    purple: 'from-purple-500/10 to-purple-600/10 text-purple-600 dark:text-purple-400',
    cyan: 'from-cyan-500/10 to-cyan-600/10 text-cyan-600 dark:text-cyan-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-card"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          {trend && (
            <p className={`text-xs flex items-center gap-1 ${trend.positive ? 'text-emerald-500' : 'text-red-500'}`}>
              <span>{trend.positive ? '↑' : '↓'}</span>
              {trend.value}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${colors[color] || colors.indigo}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}
