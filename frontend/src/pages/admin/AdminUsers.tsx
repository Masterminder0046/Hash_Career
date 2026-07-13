import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Search, Shield, ShieldOff, Trash2, ChevronRight } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminApi.getDashboard().then((res) => {
      if (res.data.success) {
        setUsers(res.data.data.recentUsers || []);
      }
    }).finally(() => setLoading(false));
  }, []);

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await adminApi.manageUser(userId, { isActive: !currentStatus });
      setUsers(users.map((u) => u._id === userId ? { ...u, isActive: !currentStatus } : u));
      toast.success('User status updated');
    } catch { }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Delete user ${name}?`)) return;
    try {
      await adminApi.deleteUser(userId);
      setUsers(users.filter((u) => u._id !== userId));
      toast.success('User deleted');
    } catch { }
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Users Management</h1>
          <p className="text-slate-400 mt-1">Manage all platform users</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input className="input-field pl-11" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left p-4 text-sm font-medium text-slate-500">Name</th>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Email</th>
                <th className="text-center p-4 text-sm font-medium text-slate-500">Role</th>
                <th className="text-center p-4 text-sm font-medium text-slate-500">Status</th>
                <th className="text-center p-4 text-sm font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-t border-slate-100 dark:border-slate-700/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">{u.name?.charAt(0)}</div>
                      <span className="text-sm font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{u.email}</td>
                  <td className="p-4 text-center"><span className="badge-info capitalize">{u.role?.replace('_', ' ')}</span></td>
                  <td className="p-4 text-center">
                    <span className={`${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => toggleUserStatus(u._id, u.isActive)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title={u.isActive ? 'Deactivate' : 'Activate'}>
                        {u.isActive ? <ShieldOff className="w-4 h-4 text-amber-500" /> : <Shield className="w-4 h-4 text-emerald-500" />}
                      </button>
                      <button onClick={() => handleDelete(u._id, u.name)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
