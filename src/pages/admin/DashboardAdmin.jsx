import React, { useState, useEffect } from 'react';
import { Users, Database, Shield, Activity, Server, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function DashboardAdmin() {
    const [stats, setStats] = useState({
        users: '0 Staf',
        logs: '0 Aksi',
        knowledge: '0 Dokumen',
        uptime: '99.9%'
    });
    const [loading, setLoading] = useState(true);
    const [dbStatus, setDbStatus] = useState(false);

    const API_URL = "http://localhost:8000/api";
    const token = localStorage.getItem('access_token');

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/dashboard-stats`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.data) {
                const data = response.data;
                setStats({
                    users: `${data.total_staff || 0} Personil`,
                    logs: `${data.total_logs || 0} Aktivitas`,
                    knowledge: `${data.total_documents || 0} Database`,
                    uptime: data.system_uptime || '99.9%'
                });
                setDbStatus(true);
            }
        } catch (error) {
            console.error("Gagal sinkronisasi data:", error);
            setDbStatus(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        // Opsi: Auto-refresh setiap 30 detik untuk kesan Real-time
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const cardData = [
        { label: 'Personil Medis', val: stats.users, icon: <Users size={24} />, color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
        { label: 'Audit Log AI', val: stats.logs, icon: <Activity size={24} />, color: 'emerald', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
        { label: 'Knowledge Base', val: stats.knowledge, icon: <Database size={24} />, color: 'orange', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
        { label: 'Volt Engine', val: stats.uptime, icon: <Server size={24} />, color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
    ];

    return (
        <div className="space-y-8 animate-fade-in text-left font-sans antialiased pb-10">
            {/* Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Pusat Kendali Administrasi</h1>
                    <p className="text-slate-500 mt-2 font-medium">Monitoring infrastruktur LexiMed.ai System dan Otoritas Data RS.</p>
                </div>
                <button 
                    onClick={fetchDashboardData}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    Refresh Data
                </button>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {cardData.map((s, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6 hover:shadow-xl transition-all group relative overflow-hidden"
                    >
                        <div className={`w-16 h-16 rounded-2xl ${s.bgColor} ${s.textColor} flex items-center justify-center group-hover:rotate-12 transition-transform duration-500`}>
                            {s.icon}
                        </div>
                        <div className="relative z-10">
                            {loading ? (
                                <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg" />
                            ) : (
                                <p className="text-3xl font-black text-slate-900 leading-none tracking-tighter">{s.val}</p>
                            )}
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">{s.label}</p>
                        </div>
                        {/* Decorative circle */}
                        <div className={`absolute -right-4 -bottom-4 w-20 h-20 ${s.bgColor} opacity-20 rounded-full group-hover:scale-150 transition-transform duration-700`} />
                    </motion.div>
                ))}
            </div>

            {/* Security Infrastructure Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#0f172a] p-10 rounded-[3rem] text-white overflow-hidden relative shadow-2xl border border-white/5"
            >
                <Shield className="absolute -right-12 -top-12 w-80 h-80 text-white opacity-[0.02] rotate-12 pointer-events-none" />
                
                <div className="relative z-10 space-y-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-2xl font-black flex items-center gap-4">
                            <Shield className="text-blue-400" size={32} /> Keamanan Infrastruktur Aktif
                        </h3>
                        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">System Monitoring Live</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 flex justify-between items-center group hover:bg-white/[0.06] transition-all">
                            <div className="space-y-2 text-left">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Main Engine</span>
                                <span className="text-xl font-bold text-white tracking-tight">Database PostgreSQL 16</span>
                            </div>
                            <div className={`flex items-center gap-3 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${dbStatus ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {dbStatus ? <CheckCircle size={14}/> : <Activity size={14} className="animate-pulse" />}
                                {dbStatus ? 'Connected' : 'Reconnecting...'}
                            </div>
                        </div>

                        <div className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 flex justify-between items-center group hover:bg-white/[0.06] transition-all">
                            <div className="space-y-2 text-left">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">AI Token Protocol</span>
                                <span className="text-xl font-bold text-white tracking-tight">OpenClaw Agent Interface</span>
                            </div>
                            <div className="flex items-center gap-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                                <CheckCircle size={14}/> 
                                Authorized
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}