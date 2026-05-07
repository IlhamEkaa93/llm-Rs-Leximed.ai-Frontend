import React, { useState, useEffect } from 'react';
import { Users, Database, Shield, Activity, Server, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardAdmin() {
  const [stats, setStats] = useState({
    users: '0',
    logs: '0',
    knowledge: '0',
    uptime: '0%'
  });
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch("http://localhost:8000/api/dashboard-stats", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Map data dari Laravel ke state frontend
          setStats({
            users: `${data.total_staff || 0} Staf`,
            logs: `${data.total_logs || 0} Aksi`,
            knowledge: `${data.total_documents || 0} Dokumen`,
            uptime: data.system_uptime || '99.9%'
          });
          setDbStatus(true);
        }
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
        setDbStatus(false);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cardData = [
    { label: 'Personil Medis', val: stats.users, icon: <Users size={24} />, color: 'blue' },
    { label: 'Audit Log', val: stats.logs, icon: <Activity size={24} />, color: 'emerald' },
    { label: 'Knowledge Base', val: stats.knowledge, icon: <Database size={24} />, color: 'orange' },
    { label: 'Volt Engine', val: stats.uptime, icon: <Server size={24} />, color: 'purple' },
  ];

  return (
    <div className="space-y-8 animate-fade-in text-left font-sans antialiased">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm"
      >
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Pusat Kendali Administrasi</h1>
        <p className="text-slate-500 mt-2 font-medium">Monitoring infrastruktur DARSI System dan Otoritas Data RS UNS.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cardData.map((s, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6 hover:shadow-md transition-all group"
          >
            <div className={`w-14 h-14 rounded-2xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center group-hover:scale-110 transition-transform`}>
              {s.icon}
            </div>
            <div>
              {loading ? (
                <Loader2 className="animate-spin text-slate-300" size={20} />
              ) : (
                <p className="text-3xl font-black text-slate-900 leading-none">{s.val}</p>
              )}
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Security Infrastructure Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#0f172a] p-10 rounded-[2.5rem] text-white overflow-hidden relative shadow-2xl"
      >
        {/* Decorative background icon */}
        <Shield className="absolute -right-8 -top-8 w-64 h-64 text-white opacity-[0.03] rotate-12" />
        
        <div className="relative z-10 space-y-8">
          <h3 className="text-2xl font-black flex items-center gap-4">
            <Shield className="text-blue-400" size={28} /> Keamanan Infrastruktur Aktif
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-all">
              <div className="space-y-1 text-left">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Core Database</span>
                <span className="text-lg font-bold text-white">Database PostgreSQL</span>
              </div>
              <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${dbStatus ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                <CheckCircle size={14}/> {dbStatus ? 'Connected' : 'Offline'}
              </span>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-all">
              <div className="space-y-1 text-left">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Agent Interface</span>
                <span className="text-lg font-bold text-white">OpenClaw Agent Token</span>
              </div>
              <span className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                <CheckCircle size={14}/> Valid
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}