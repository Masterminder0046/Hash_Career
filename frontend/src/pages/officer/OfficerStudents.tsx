import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { officerApi } from '../../services/api';
import { StudentProfile } from '../../types';
import { Search, ChevronRight, GraduationCap, TrendingUp, AlertTriangle, Filter, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OfficerStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: 'student123',
    department: '',
    rollNumber: '',
    batch: '',
    year: '',
    cgpa: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email, and password are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await officerApi.createStudent({
        ...form,
        cgpa: parseFloat(form.cgpa) || 0,
      });
      if (res.data.success) {
        toast.success('Student added successfully!');
        setShowModal(false);
        setForm({
          name: '',
          email: '',
          password: 'student123',
          department: '',
          rollNumber: '',
          batch: '',
          year: '',
          cgpa: '',
        });
        fetch();
      }
    } catch { } finally {
      setSubmitting(false);
    }
  };

  const fetch = async () => {
    const params: any = {};
    if (search) params.search = search;
    if (dept) params.department = dept;
    try {
      const res = await officerApi.getStudents(params);
      if (res.data.success) setStudents(res.data.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [search, dept]);

  const departments = [...new Set(students.map((s) => s.academic?.department))];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Students</h1>
          <p className="text-slate-400 mt-1">View and manage student profiles</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input className="input-field pl-11" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-auto" value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left p-4 text-sm font-medium text-slate-500">Name</th>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Department</th>
                <th className="text-center p-4 text-sm font-medium text-slate-500">CGPA</th>
                <th className="text-center p-4 text-sm font-medium text-slate-500">Skills</th>
                <th className="text-center p-4 text-sm font-medium text-slate-500">Resume Score</th>
                <th className="text-center p-4 text-sm font-medium text-slate-500">Status</th>
                <th className="text-center p-4 text-sm font-medium text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <motion.tr
                  key={s._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-t border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/officer/students/${s._id}`)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                        {(s as any).userId?.name?.charAt(0) || 'S'}
                      </div>
                      <span className="text-sm font-medium">{(s as any).userId?.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{s.academic?.department || 'N/A'}</td>
                  <td className="p-4 text-center">
                    <span className={`text-sm font-medium ${s.academic?.cgpa >= 8 ? 'text-emerald-600' : s.academic?.cgpa >= 6.5 ? 'text-amber-600' : 'text-red-500'}`}>{s.academic?.cgpa || 'N/A'}</span>
                  </td>
                  <td className="p-4 text-center text-sm text-slate-500">{s.skills?.length || 0}</td>
                  <td className="p-4 text-center">
                    <span className={`text-sm font-medium ${(s.resumeScore || 0) >= 70 ? 'text-emerald-600' : (s.resumeScore || 0) >= 40 ? 'text-amber-600' : 'text-red-500'}`}>{s.resumeScore || 0}%</span>
                  </td>
                  <td className="p-4 text-center">
                    {s.isPlacementReady ? <span className="badge-success">Ready</span> : <span className="badge-warning">At Risk</span>}
                  </td>
                  <td className="p-4 text-center"><ChevronRight className="w-4 h-4 text-slate-400 inline" /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card w-full max-w-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold">Add New Student Profile</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Temporary Password *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Roll Number</label>
                  <input
                    type="text"
                    className="input-field"
                    value={form.rollNumber}
                    onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Department</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. CSE, IT, ECE"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Batch</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 2022-2026"
                    value={form.batch}
                    onChange={(e) => setForm({ ...form, batch: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Current Year</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. I, II, III, IV"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    className="input-field"
                    placeholder="e.g. 8.5"
                    value={form.cgpa}
                    onChange={(e) => setForm({ ...form, cgpa: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
