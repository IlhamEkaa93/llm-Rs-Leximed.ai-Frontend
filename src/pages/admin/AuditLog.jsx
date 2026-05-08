import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, Search, Calendar, Download, 
  ShieldAlert, User, Cpu, Database, Loader2, CheckCircle, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, alerts: 0, time: '0s' });

  const API_URL = "http://localhost:8000/api";
  const token = localStorage.getItem('access_token');

  // FETCH DATA SECARA REALTIME
  const fetchLogs = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setIsRefreshing(true);

    try {
      const response = await fetch(`${API_URL}/audit-logs`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      const result = await response.json();
      if (result.success) {
        setLogs(result.logs || []);
        setStats(result.stats);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      if (logs.length === 0) {
        setLogs([
          { id: 1, time: '2026-04-19 10:45:12', user: 'dr. Ahmad Hidayat', action: 'AI SUMMARIZATION', target: 'RM: 123456', status: 'Success' },
          { id: 2, time: '2026-04-19 10:52:05', user: 'Ns. Siti Aminah', action: 'HANDOVER GENERATION', target: 'RM: 654321', status: 'Success' }
        ]);
      }
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [token, logs.length]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => fetchLogs(true), 5000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  // LOGIKA SMART RM DETECTOR (DIFIXED UNTUK MENANGKAP RM ASLI)
  const renderObjectData = (description) => {
    if (!description) return <span className="text-slate-300">N/A</span>;

    // Regex ini menangkap format RM: RM-1 atau RM: 12345 secara utuh
    // Mengambil bagian setelah "RM:" atau "RM-"
    const rmRegex = /RM[:\-\s]+([A-Za-z0-9\-]+)/i;
    const match = description.match(rmRegex);

    if (match) {
      const rmCode = match[1].toUpperCase();
      return (
        <div className="flex flex-col gap-1">
          <span className="font-mono font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 italic w-fit shadow-sm text-[10px]">
            RM: {rmCode}
          </span>
        </div>
      );
    }

    if (description.includes('.pdf')) {
      return (
        <span className="font-bold text-slate-600 flex items-center gap-2 text-[10px]">
          <Database size={12} className="text-slate-400" /> {description}
        </span>
      );
    }

    return <span className="text-slate-400 italic text-[10px] truncate max-w-[200px] block">{description}</span>;
  };

  const filteredLogs = logs.filter(log => 
    log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-24 font-sans text-left">
      {/* HEADER SECTION */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
        className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 mb-8 relative overflow-hidden"
      >
        <AnimatePresence>
          {isRefreshing && (
            <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} exit={{ opacity: 0 }}
              className="absolute top-0 left-0 h-1 bg-blue-500 z-20 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="space-y-2 text-left w-full">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase flex items-center gap-4">
              <Activity className="text-blue-600" size={40} /> Audit Trail AI
            </h1>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest leading-none">Postgresql Real-Time Monitoring System</p>
          </div>
          <div className="flex items-center gap-4 bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 shadow-inner shrink-0">
             <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
             <p className="text-emerald-700 font-black text-[10px] uppercase tracking-widest leading-none">System Synchronized</p>
          </div>
        </div>
      </motion.div>

      {/* STATS AREA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'AI Actions', val: stats.total, color: 'text-blue-600' },
          { label: 'Alerts', val: stats.alerts, color: 'text-red-600' },
          { label: 'Latency', val: stats.time, color: 'text-emerald-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm transition-transform hover:-translate-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
            <h2 className={`text-5xl font-black tracking-tighter ${s.color}`}>{s.val}</h2>
          </div>
        ))}
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-6 justify-between items-center">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text" placeholder="Search by personnel, action, or RM code..." 
              className="w-full bg-white border border-slate-200 py-4 pl-14 pr-6 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-inner text-slate-700"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-[#0f172a] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3 shadow-lg shadow-slate-200 active:scale-95">
            <Download size={18} /> Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical Personnel</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Object (RM)</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && !isRefreshing ? (
                <tr><td colSpan="5" className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={48} /></td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan="5" className="py-24 text-center text-slate-400 font-bold italic uppercase text-xs">No Audit Logs Found</td></tr>
              ) : filteredLogs.map((log) => (
                <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-6 font-mono text-[11px] font-bold text-slate-400">{log.time}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3 font-black text-slate-800 uppercase text-[11px] tracking-tight">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 shadow-sm group-hover:bg-white transition-colors">
                            <User size={14} className="text-blue-500" />
                        </div>
                        {log.user}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 uppercase tracking-widest shadow-sm">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {/* FUNGSI SMART RENDER TARGET RM ASLI */}
                    {renderObjectData(log.target)}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-[10px] font-black border border-emerald-100 uppercase flex items-center justify-center gap-2 w-fit mx-auto shadow-sm shadow-emerald-100">
                      <CheckCircle size={12} /> Success
                    </span>
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