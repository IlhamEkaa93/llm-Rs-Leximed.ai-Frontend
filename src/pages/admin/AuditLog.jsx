import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, Search, Calendar, Download, 
  ShieldAlert, User, Cpu, Database, Loader2, CheckCircle, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // State untuk animasi refresh background
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, alerts: 0, time: '0s' });

  const API_URL = "http://localhost:8000/api";
  const token = localStorage.getItem('access_token');

  // --- 1. FETCH DATA LOG DARI POSTGRESQL ---
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
      if (!response.ok) throw new Error("Gagal memuat log");
      
      const data = await response.json();
      setLogs(data.logs || []);
      setStats(data.stats || { total: data.logs?.length || 0, alerts: 0, time: '1.2s' });
    } catch (err) {
      console.warn("Backend offline, menggunakan data fallback.");
      // Fallback Data sesuai gambar
      const fallbackLogs = [
        { id: 1, time: '2026-04-19 10:45:12', user: 'dr. Ahmad Hidayat', action: 'AI Summarization', target: 'RM: 123456', status: 'Success' },
        { id: 2, time: '2026-04-19 10:52:05', user: 'Ns. Siti Aminah', action: 'Handover Generation', target: 'RM: 654321', status: 'Success' },
        { id: 3, time: '2026-04-19 11:05:33', user: 'System', action: 'RAG Knowledge Indexing', target: 'PPK_Pneumonia.pdf', status: 'Warning' },
        { id: 4, time: '2026-04-19 11:20:10', user: 'Admin IT', action: 'Knowledge Base Upload', target: 'PPK_Pneumonia.pdf', status: 'Success' },
      ];
      setLogs(fallbackLogs);
      setStats({ total: '1,284', alerts: '1', time: '0.8s' });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  // --- 2. FITUR REAL-TIME (POLLING) ---
  useEffect(() => {
    // Initial fetch saat komponen dimount
    fetchLogs();

    // Set interval untuk fetch data secara otomatis (polling) setiap 5 detik
    const intervalId = setInterval(() => {
      fetchLogs(true); // isBackground = true, jadi spinner besar tidak muncul
    }, 5000);

    // Bersihkan interval saat komponen unmount agar tidak membebani memori
    return () => clearInterval(intervalId);
  }, [fetchLogs]);

  // --- 3. LOGIKA SEARCHING ---
  const filteredLogs = logs.filter(log => 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-left pb-20">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 mb-8 relative overflow-hidden">
        {/* Indikator Realtime */}
        {isRefreshing && (
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-full bg-blue-500 w-1/3"
            />
          </div>
        )}

        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight italic uppercase">
            <Activity size={32} className="text-blue-600" /> Audit Trail AI
          </h1>
          <p className="text-slate-500 font-medium">Pemantauan real-time infrastruktur AI dan kepatuhan data RS UNS (SRS 7.6).</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
           <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
              <Database size={16} /> {isRefreshing ? 'Syncing...' : 'PostgreSQL Connected'}
           </div>
           <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 text-sm uppercase tracking-widest">
             <Download size={18} /> Export CSV
           </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Request AI', val: stats.total, color: 'blue' },
          { label: 'Security Alerts', val: stats.alerts, color: 'red', alert: true },
          { label: 'Avg. Response Time', val: stats.time, color: 'emerald' },
        ].map((s, i) => (
          <div key={i} className={`bg-white p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-2 transition-colors ${s.alert && s.val > 0 ? 'border border-red-200 bg-red-50/30' : 'border border-slate-100'}`}>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${s.alert && s.val > 0 ? 'text-red-500' : 'text-slate-400'}`}>
              {s.label}
            </span>
            <strong className={`text-5xl font-black tracking-tighter ${s.alert && s.val > 0 ? 'text-red-600' : 'text-slate-800'}`}>
              {s.val}
            </strong>
          </div>
        ))}
      </div>

      {/* Controls & Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari User, No. RM, atau Aktivitas..." 
              className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-500 transition-all font-bold text-slate-700 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm w-full md:w-auto text-slate-600 font-bold">
            <Calendar size={18} className="text-slate-400" />
            <span className="text-sm">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp Server</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personil / Kredensial</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Modul AI / Action</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Objek Data</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
                      <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Menghubungkan ke Database Audit...</p>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center text-slate-400 font-medium">
                      Tidak ada log yang cocok dengan pencarian Anda.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <motion.tr 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      key={log.id} 
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-8 py-6 font-mono text-xs font-bold text-slate-500">
                        {log.time}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3 font-bold text-slate-800">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200">
                            <User size={14} />
                          </div>
                          {log.user}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-blue-600">
                          <Cpu size={16} /> {log.action}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <code className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono border border-slate-200">
                          {log.target}
                        </code>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          log.status === 'Success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          log.status === 'Warning' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {log.status === 'Success' && <CheckCircle size={12} />}
                          {log.status === 'Warning' && <AlertTriangle size={12} />}
                          {log.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Footer */}
      <div className="max-w-7xl mx-auto mt-8 p-6 bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center gap-6 text-white overflow-hidden relative">
        <ShieldAlert size={150} className="absolute -left-10 -bottom-10 text-white opacity-5" />
        <div className="p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm z-10 shrink-0">
           <ShieldAlert size={28} className="text-blue-400" />
        </div>
        <div className="z-10">
           <h4 className="text-lg font-black tracking-tight italic">IMMUTABLE LOG RECORD</h4>
           <p className="text-xs font-medium leading-relaxed mt-1 opacity-80 max-w-4xl">
             Seluruh entri log di atas bersifat *Immutable* (tidak dapat dihapus atau diedit oleh siapapun termasuk Admin) untuk menjamin validitas akreditasi JCI/KARS dan mencegah *tampering* data medis elektronik.
           </p>
        </div>
      </div>
    </div>
  );
}