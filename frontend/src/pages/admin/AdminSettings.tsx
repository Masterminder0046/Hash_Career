import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Key, Database, RefreshCw, Upload, FileText, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/api';

export default function AdminSettings() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [retrainStatus, setRetrainStatus] = useState({
    totalRecords: 0,
    modelLoaded: true,
    accuracy: null as number | null,
  });

  const [settings, setSettings] = useState({
    siteName: 'Hash Career',
    allowSignups: true,
    requireVerification: true,
    defaultPassword: 'student123',
    emailNotifications: true,
    maintenanceMode: false,
  });

  // Fetch initial settings & ML status
  useEffect(() => {
    fetchSettings();
    fetchMLStatus();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await adminApi.getSettings();
      if (res.data?.success && res.data?.data) {
        setApiKey(res.data.data.geminiApiKey || '');
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const fetchMLStatus = async () => {
    try {
      const res = await adminApi.getRetrainStatus();
      if (res.data?.success && res.data?.data) {
        setRetrainStatus({
          totalRecords: res.data.data.totalRecords,
          modelLoaded: res.data.data.modelLoaded,
          accuracy: res.data.data.accuracy ? res.data.data.accuracy * 100 : null,
        });
      }
    } catch (err) {
      console.error('Failed to fetch ML status:', err);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const res = await adminApi.updateSettings({ geminiApiKey: apiKey });
      if (res.data?.success) {
        toast.success('Gemini API key saved successfully!');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleUploadCsv = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file first');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('csv', csvFile);

    try {
      const res = await adminApi.uploadHistory(formData);
      if (res.data?.success) {
        toast.success(res.data.message || 'CSV Uploaded & Model Retrained!');
        setCsvFile(null);
        if (res.data.data?.accuracy) {
          setRetrainStatus({
            totalRecords: res.data.data.records_trained,
            modelLoaded: true,
            accuracy: res.data.data.accuracy * 100,
          });
        } else {
          fetchMLStatus();
        }
      }
    } catch (err: any) {
      console.error('CSV upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Settings & Configuration</h1>
        <p className="text-slate-400 mt-1">Configure live integrations, API keys, and retrain ML models.</p>
      </div>

      {/* API Integrations Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-500" /> API Keys & Live AI Integrations
        </h2>
        <p className="text-sm text-slate-400">
          Provide a Google Gemini API Key. If left empty, the application uses an intelligent rule-based fallback analyzer so that resume assessments, interview evaluation, and roadmap generation remain 100% active and based on actual user data.
        </p>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Google Gemini API Key (starts with AIzaSy)</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="Paste your Gemini API key here..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSaveSettings} disabled={loading} className="btn-primary flex items-center gap-2">
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              Save API Key
            </button>
          </div>
        </div>
      </motion.div>

      {/* Machine Learning Model Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-500" /> Historical Data & Model Retraining
        </h2>
        <p className="text-sm text-slate-400">
          Upload real-world historical student placement records to train the Random Forest machine learning classifier. Predictions will dynamically adapt to your college's specific placements profile.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
            <span className="text-xs text-slate-400 uppercase">Training Database Size</span>
            <p className="text-2xl font-bold mt-1 text-indigo-400">{retrainStatus.totalRecords}</p>
            <span className="text-[10px] text-slate-500">Total historical student records</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
            <span className="text-xs text-slate-400 uppercase">Model Status</span>
            <p className="text-2xl font-bold mt-1 text-emerald-400">
              {retrainStatus.modelLoaded ? 'Active & Ready' : 'Fallback Mode'}
            </p>
            <span className="text-[10px] text-slate-500">Placement Prediction Service Status</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
            <span className="text-xs text-slate-400 uppercase">Model Training Accuracy</span>
            <p className="text-2xl font-bold mt-1 text-purple-400">
              {retrainStatus.accuracy ? `${retrainStatus.accuracy.toFixed(1)}%` : 'N/A'}
            </p>
            <span className="text-[10px] text-slate-500">Accuracy score of the latest run</span>
          </div>
        </div>

        {/* CSV Format Helper */}
        <div className="p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-xl space-y-2">
          <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> Expected CSV Format Requirements:
          </span>
          <p className="text-xs text-slate-400">
            Ensure your CSV file contains these headers exactly:
          </p>
          <code className="block text-[11px] bg-slate-900/50 p-2 rounded text-indigo-400 overflow-x-auto">
            cgpa, skills_count, projects_count, internships_count, resume_score, coding_score, communication_score, attendance, certifications_count, placed
          </code>
          <p className="text-[10px] text-slate-500">
            * 'placed' column must contain 1 (Placed) or 0 (Not Placed). Other columns are numeric.
          </p>
        </div>

        {/* Upload Zone */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-700/60 rounded-xl p-6 text-center hover:border-indigo-500/60 transition-colors">
            <input
              type="file"
              accept=".csv"
              id="csv-file-input"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="csv-file-input" className="cursor-pointer space-y-2 block">
              <Upload className="w-10 h-10 mx-auto text-slate-500" />
              <p className="text-sm font-medium">
                {csvFile ? `Selected: ${csvFile.name}` : 'Click to select placement history CSV file'}
              </p>
              <p className="text-xs text-slate-500">Only CSV files up to 5MB are supported</p>
            </label>
          </div>

          {csvFile && (
            <div className="flex justify-end">
              <button
                onClick={handleUploadCsv}
                disabled={uploading}
                className="btn-primary flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Training Model...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Upload & Retrain ML Model
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* General Settings Mock */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-500" /> General Configuration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Site Name</label>
            <input
              className="input-field"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Default Student Password</label>
            <input
              className="input-field"
              value={settings.defaultPassword}
              onChange={(e) => setSettings({ ...settings, defaultPassword: e.target.value })}
            />
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-500" /> Security Policies
        </h2>
        {[
          { label: 'Allow New Registrations', key: 'allowSignups' as const },
          { label: 'Require Email Verification', key: 'requireVerification' as const },
          { label: 'Maintenance Mode', key: 'maintenanceMode' as const },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <span className="text-sm">{item.label}</span>
            <button
              onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key] })}
              className={`w-12 h-6 rounded-full transition-colors ${settings[item.key] ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[item.key] ? 'translate-x-6' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
