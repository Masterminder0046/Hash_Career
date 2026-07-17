import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { authApi } from '../../services/api';
import { StudentProfile as StudentProfileType } from '../../types';
import toast from 'react-hot-toast';
import { User, Mail, BookOpen, Award, Github, Linkedin, Plus, Trash2, Save } from 'lucide-react';

export default function StudentProfile() {
  const [profile, setProfile] = useState<StudentProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await authApi.getProfile();
        if (res.data.success) setProfile(res.data.data.profile);
      } catch { } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authApi.updateProfile(profile);
      if (res.data.success) {
        setProfile(res.data.data.profile);
        toast.success('Profile updated');
      }
    } catch { } finally { setSaving(false); }
  };

  const addSkill = () => {
    if (newSkill && profile) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    if (profile) setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) });
  };

  if (loading) return <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-20 w-full" />)}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">My Profile</h1>
          <p className="text-slate-400 mt-1">Manage your academic and personal details</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><User className="w-5 h-5 text-indigo-500" /> Personal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400">Phone</label>
                <input className="input-field mt-1" value={profile?.phone || ''} onChange={(e) => setProfile(profile ? { ...profile, phone: e.target.value } : null)} placeholder="Phone number" />
              </div>
              <div>
                <label className="text-sm text-slate-400">Bio</label>
                <input className="input-field mt-1" value={profile?.bio || ''} onChange={(e) => setProfile(profile ? { ...profile, bio: e.target.value } : null)} placeholder="Short bio" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-500" /> Academic Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-slate-400">CGPA</label>
                <input type="number" step="0.01" min="0" max="10" className="input-field mt-1" value={profile?.academic.cgpa || ''} onChange={(e) => setProfile(profile ? { ...profile, academic: { ...profile.academic, cgpa: parseFloat(e.target.value) || 0 } } : null)} />
              </div>
              <div>
                <label className="text-sm text-slate-400">Department</label>
                <input className="input-field mt-1" value={profile?.academic.department || ''} onChange={(e) => setProfile(profile ? { ...profile, academic: { ...profile.academic, department: e.target.value } } : null)} />
              </div>
              <div>
                <label className="text-sm text-slate-400">Graduation Year</label>
                <input type="number" className="input-field mt-1" value={profile?.academic.graduationYear || ''} onChange={(e) => setProfile(profile ? { ...profile, academic: { ...profile.academic, graduationYear: parseInt(e.target.value) || 2025 } } : null)} />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-indigo-500" /> Skills</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {profile?.skills.map((skill) => (
                <span key={skill} className="badge-info flex items-center gap-1">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} className="input-field flex-1" placeholder="Add skill" onKeyDown={(e) => e.key === 'Enter' && addSkill()} />
              <button onClick={addSkill} className="btn-secondary"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass-card p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto flex items-center justify-center text-3xl font-bold text-white">
              {profile?.userId?.name?.charAt(0) || 'S'}
            </div>
            <h3 className="text-lg font-semibold mt-4">{profile?.userId?.name}</h3>
            <p className="text-sm text-slate-400">{profile?.academic.department}</p>
            <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <p className="text-2xl font-bold text-indigo-600">{profile?.profileCompletion || 0}%</p>
              <p className="text-xs text-slate-400">Profile Complete</p>
            </div>
            <div className="mt-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${profile?.profileCompletion || 0}%` }} />
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Github className="w-4 h-4" /> Profiles</h3>
            <div className="space-y-3">
              <input className="input-field text-sm" value={profile?.githubUrl || ''} onChange={(e) => setProfile(profile ? { ...profile, githubUrl: e.target.value } : null)} placeholder="GitHub URL" />
              <input className="input-field text-sm" value={profile?.linkedinUrl || ''} onChange={(e) => setProfile(profile ? { ...profile, linkedinUrl: e.target.value } : null)} placeholder="LinkedIn URL" />
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold mb-2">Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Projects</span><span>{profile?.projects.length || 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Certificates</span><span>{profile?.certificates.length || 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Achievements</span><span>{profile?.achievements.length || 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Placement Ready</span><span className={profile?.isPlacementReady ? 'text-emerald-500' : 'text-amber-500'}>{profile?.isPlacementReady ? 'Yes' : 'No'}</span></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
