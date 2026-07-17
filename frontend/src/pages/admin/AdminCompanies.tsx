import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { companyApi } from '../../services/api';
import { Company } from '../../types';
import { Search, Plus, Edit3, Trash2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', description: '', industry: '', minCgpa: 6, skillsRequired: '',
    eligibleDepartments: '', salaryMin: 0, salaryMax: 0, location: '',
  });

  const fetch = async () => {
    try {
      const res = await companyApi.getAll({ limit: 100 });
      if (res.data.success) setCompanies(res.data.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      skillsRequired: form.skillsRequired.split(',').map((s) => s.trim()),
      eligibleDepartments: form.eligibleDepartments.split(',').map((s) => s.trim()),
      salary: { min: form.salaryMin, max: form.salaryMax, currency: 'INR' },
    };
    try {
      if (editId) {
        await companyApi.update(editId, data);
        toast.success('Company updated');
      } else {
        await companyApi.create(data);
        toast.success('Company created');
      }
      setShowForm(false);
      setEditId(null);
      resetForm();
      fetch();
    } catch { }
  };

  const handleEdit = (c: Company) => {
    setForm({
      name: c.name, description: c.description, industry: c.industry, minCgpa: c.minCgpa,
      skillsRequired: c.skillsRequired.join(', '), eligibleDepartments: c.eligibleDepartments.join(', '),
      salaryMin: c.salary.min, salaryMax: c.salary.max, location: c.location || '',
    });
    setEditId(c._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this company?')) return;
    try { await companyApi.delete(id); setCompanies(companies.filter((c) => c._id !== id)); toast.success('Deleted'); } catch { }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', industry: '', minCgpa: 6, skillsRequired: '', eligibleDepartments: '', salaryMin: 0, salaryMax: 0, location: '' });
    setEditId(null);
  };

  const filtered = companies.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Companies Management</h1>
          <p className="text-slate-400 mt-1">Manage company database</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Company
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input className="input-field pl-11" placeholder="Search companies..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">{editId ? 'Edit' : 'Add'} Company</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <input className="input-field" placeholder="Company Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <textarea className="input-field h-20" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <input className="input-field" placeholder="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} required />
            <input type="number" step="0.1" className="input-field" placeholder="Min CGPA" value={form.minCgpa} onChange={(e) => setForm({ ...form, minCgpa: parseFloat(e.target.value) || 6 })} />
            <input className="input-field" placeholder="Skills (comma separated)" value={form.skillsRequired} onChange={(e) => setForm({ ...form, skillsRequired: e.target.value })} />
            <input className="input-field" placeholder="Eligible Departments (comma separated)" value={form.eligibleDepartments} onChange={(e) => setForm({ ...form, eligibleDepartments: e.target.value })} />
            <input type="number" className="input-field" placeholder="Min Salary" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: parseInt(e.target.value) || 0 })} />
            <input type="number" className="input-field" placeholder="Max Salary" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: parseInt(e.target.value) || 0 })} />
            <input className="input-field" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">{editId ? 'Update' : 'Create'} Company</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <motion.div key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold">{c.name}</h3>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(c)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><Edit3 className="w-3.5 h-3.5 text-slate-400" /></button>
                <button onClick={() => handleDelete(c._id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-2">{c.industry} • CGPA: {c.minCgpa} • ₹{c.salary?.min?.toLocaleString()}</p>
            <div className="flex flex-wrap gap-1">
              {c.skillsRequired?.slice(0, 4).map((s) => <span key={s} className="text-[10px] px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded">{s}</span>)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
