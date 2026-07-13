import { useState } from 'react';
import { motion } from 'framer-motion';
import { predictionApi } from '../../services/api';
import { Prediction } from '../../types';
import { Brain, Loader2, TrendingUp, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function PlacementPrediction() {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Prediction[]>([]);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await predictionApi.predict();
      if (res.data.success) {
        setPrediction(res.data.data.prediction);
      }
      const histRes = await predictionApi.getHistory();
      if (histRes.data.success) setHistory(histRes.data.data);
    } catch { } finally { setLoading(false); }
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#f59e0b', '#10b981'];

  const pieData = prediction
    ? [
        { name: 'Probability', value: prediction.probability },
        { name: 'Gap', value: 100 - prediction.probability },
      ]
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Placement Prediction</h1>
          <p className="text-slate-400 mt-1">AI-powered placement probability analysis</p>
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={handlePredict} disabled={loading} className="btn-primary text-lg px-10 py-4 flex items-center gap-3">
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Brain className="w-6 h-6" />}
          {loading ? 'Analyzing...' : 'Predict My Placement'}
        </button>
      </div>

      {prediction && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-8 text-center">
            <h2 className="text-lg font-semibold mb-6">Placement Probability</h2>
            <div className="relative inline-flex">
              <ResponsiveContainer width={250} height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" startAngle={90} endAngle={-270}>
                    <Cell fill="#6366f1" />
                    <Cell fill="#1e293b" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <p className="text-4xl font-bold text-indigo-600">{prediction.probability}%</p>
                  <p className="text-xs text-slate-400 mt-1 capitalize">{prediction.confidence} confidence</p>
                </div>
              </div>
            </div>
            <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
              prediction.confidence === 'high' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' :
              prediction.confidence === 'medium' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' :
              'bg-red-100 dark:bg-red-900/20 text-red-500'
            }`}>
              {prediction.confidence === 'high' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {prediction.confidence.charAt(0).toUpperCase() + prediction.confidence.slice(1)} Confidence
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-500" /> Feature Importance</h2>
            <div className="space-y-3">
              {prediction.featureImportance.sort((a, b) => b.importance - a.importance).slice(0, 6).map((f, i) => (
                <div key={f.feature}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-slate-500">{f.feature.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-medium">{(f.importance * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${f.importance * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 glass-card p-6">
            <h2 className="text-lg font-semibold mb-3">Analysis</h2>
            <p className="text-slate-600 dark:text-slate-400">{prediction.reason}</p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(prediction.inputFeatures).map(([key, value]) => (
                <div key={key} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                  <p className="text-lg font-bold">{typeof value === 'number' ? value.toFixed(1) : value}</p>
                  <p className="text-xs text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {history.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Prediction History</h2>
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div>
                  <p className="text-sm font-medium">{new Date(h.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-400">{h.reason.slice(0, 80)}...</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-indigo-600">{h.probability}%</p>
                  <p className="text-xs text-slate-400 capitalize">{h.confidence}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
