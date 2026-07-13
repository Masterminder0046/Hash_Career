import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { companyApi } from '../../services/api';
import { Company } from '../../types';
import { Building2, Search, MapPin, DollarSign, GraduationCap, ChevronRight, ExternalLink, Filter } from 'lucide-react';

export default function CompanyDatabase() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const params: any = {};
        if (search) params.search = search;
        if (industry) params.industry = industry;
        const res = await companyApi.getAll(params);
        if (res.data.success) setCompanies(res.data.data);
      } catch { } finally { setLoading(false); }
    };
    fetch();
  }, [search, industry]);

  const industries = [...new Set(companies.map((c) => c.industry))];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Company Database</h1>
          <p className="text-slate-400 mt-1">Explore companies and their placement requirements</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input className="input-field pl-11" placeholder="Search companies..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-auto" value={industry} onChange={(e) => setIndustry(e.target.value)}>
          <option value="">All Industries</option>
          {industries.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company, i) => (
            <motion.div
              key={company._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(`/matching?company=${company._id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl">
                  <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{company.name}</h3>
              <p className="text-sm text-slate-400 mb-3 line-clamp-2">{company.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  Min CGPA: {company.minCgpa}
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  ₹{company.salary.min.toLocaleString()} - ₹{company.salary.max.toLocaleString()}
                </div>
                {company.location && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    {company.location}
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {company.skillsRequired.slice(0, 4).map((skill) => (
                  <span key={skill} className="text-xs px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-md">{skill}</span>
                ))}
                {company.skillsRequired.length > 4 && <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-md">+{company.skillsRequired.length - 4}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
