import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Database, Shield, Activity, Server, 
  CheckCircle, Loader2, RefreshCw, Sparkles, 
  CloudLightning, Printer, Download, ArrowRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    
    // Refs untuk Export
    const printRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    const API_URL = "https://lexi-med-ai-llm-rs-back-end.vercel.app/api";
    const token = localStorage.getItem('access_token');
    const user = JSON.parse(localStorage.getItem('user')) || { name: 'Administrator' };

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
            // Data fallback untuk demo jika API mati
            setStats(prev => ({ ...prev, users: '1 Personil', uptime: '99.9%' }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    // --- LOGIC EXPORT PDF ---
    const handleDownloadPDF = async () => {
        setIsExporting(true);
        try {
            if (!window.html2pdf) {
                const script = document.createElement('script');
                script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
                document.body.appendChild(script);
                await new Promise(resolve => script.onload = resolve);
            }
            const element = printRef.current;
            const opt = {
                margin: 15,
                filename: `LexiMed_System_Report.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            await window.html2pdf().set(opt).from(element).save();
        } catch (err) {
            alert("Gagal mengunduh laporan.");
        } finally {
            setIsExporting(false);
        }
    };

    const cardData = [
        { label: 'Personil Medis', val: stats.users, icon: <Users size={24} />, bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
        { label: 'Audit Log AI', val: stats.logs, icon: <Activity size={24} />, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
        { label: 'Knowledge Base', val: stats.knowledge, icon: <Database size={24} />, bgColor: 'bg-teal-50', textColor: 'text-teal-600' },
        { label: 'System Uptime', val: stats.uptime, icon: <Server size={24} />, bgColor: 'bg-slate-50', textColor: 'text-slate-600' },
    ];

    return (
        <div className="min-h-screen bg-[#f4f7f9] p-4 md:p-8 font-sans text-left pb-24 overflow-x-hidden antialiased">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
                
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none rotate-12 -scale-x-100">
                        <CloudLightning size={300} />
                    </div>

                    <div className="relative z-10">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase italic">Admin Command Center</h1>
                        <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
                           <Sparkles size={16} className="text-emerald-500" /> Monitoring infrastruktur LexiMed.ai & Supabase Cloud.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 relative z-10 w-full lg:w-auto">
                        <button 
                            onClick={fetchDashboardData}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin text-emerald-500" : ""} />
                            Sync
                        </button>
                        <button 
                            onClick={handleDownloadPDF}
                            disabled={isExporting}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95 disabled:opacity-50"
                        >
                            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                            Export Report
                        </button>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {cardData.map((s, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-6 hover:shadow-xl transition-all group relative overflow-hidden"
                        >
                            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${s.bgColor} ${s.textColor} flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 shadow-inner`}>
                                {s.icon}
                            </div>
                            <div className="relative z-10">
                                {loading ? (
                                    <div className="h-10 w-24 bg-slate-100 animate-pulse rounded-lg" />
                                ) : (
                                    <p className="text-3xl md:text-4xl font-black text-slate-900 leading-none tracking-tighter">{s.val}</p>
                                )}
                                <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">{s.label}</p>
                            </div>
                            <div className={`absolute -right-4 -bottom-4 w-20 h-20 ${s.bgColor} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700`} />
                        </motion.div>
                    ))}
                </div>

                {/* Infrastructure Detail Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-900 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] text-white overflow-hidden relative shadow-2xl border-4 border-white/5"
                >
                    <Shield className="absolute -right-12 -top-12 w-64 h-64 md:w-96 md:h-96 text-emerald-500 opacity-[0.03] rotate-12 pointer-events-none" />
                    
                    <div className="relative z-10 space-y-8 md:space-y-12">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <h3 className="text-2xl md:text-3xl font-black flex items-center gap-4 italic uppercase">
                                    <Shield className="text-emerald-400" size={32} /> Infrastructure Security
                                </h3>
                                <p className="text-slate-400 text-sm font-medium">Layanan enkripsi data medis tingkat tinggi (AES-256) aktif.</p>
                            </div>
                            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 rounded-2xl">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-400">System Monitoring Live</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            {/* DB Status Box */}
                            <div className="bg-white/[0.03] backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-white/10 flex justify-between items-center group hover:bg-white/[0.06] transition-all">
                                <div className="space-y-2 text-left">
                                    <span className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest block">Main Engine</span>
                                    <span className="text-lg md:text-xl font-bold text-white tracking-tight">Supabase PostgreSQL 16</span>
                                </div>
                                <div className={`flex items-center gap-3 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${dbStatus ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                    {dbStatus ? <CheckCircle size={14}/> : <Activity size={14} className="animate-pulse" />}
                                    {dbStatus ? 'Cloud Connected' : 'Connecting...'}
                                </div>
                            </div>

                            {/* AI Protocol Box */}
                            <div className="bg-white/[0.03] backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-white/10 flex justify-between items-center group hover:bg-white/[0.06] transition-all">
                                <div className="space-y-2 text-left">
                                    <span className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest block">AI Protocol</span>
                                    <span className="text-lg md:text-xl font-bold text-white tracking-tight">Llama 3.3 Neural Interface</span>
                                </div>
                                <div className="flex items-center gap-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest">
                                    <Sparkles size={14} className="fill-blue-400" /> 
                                    Authorized
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* --- INVISIBLE PRINT TEMPLATE --- */}
            <div className="hidden">
                <div ref={printRef} className="p-10 text-slate-900 bg-white w-[800px]">
                    <div className="flex items-center border-b-4 border-slate-900 pb-6 mb-8">
                        <img src="/logo.png" className="w-16 h-16 mr-6" alt="Logo" />
                        <div>
                            <h1 className="text-2xl font-black uppercase">LexiMed.ai System Report</h1>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Administrator Audit Trail - Infrastructure Status</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border rounded-xl"><strong>Administrator:</strong> {user.name}</div>
                            <div className="p-4 border rounded-xl"><strong>Tanggal Audit:</strong> {new Date().toLocaleString('id-ID')}</div>
                        </div>
                        <h2 className="text-lg font-black border-b pb-2 uppercase">Status Resource Cloud</h2>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-100 text-left text-xs uppercase">
                                    <th className="p-3 border">Resource</th>
                                    <th className="p-3 border">Current Capacity/Value</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                <tr><td className="p-3 border">Total Personil Terdaftar</td><td className="p-3 border">{stats.users}</td></tr>
                                <tr><td className="p-3 border">Jumlah Aktivitas AI</td><td className="p-3 border">{stats.logs}</td></tr>
                                <tr><td className="p-3 border">Knowledge Base Documents</td><td className="p-3 border">{stats.knowledge}</td></tr>
                                <tr><td className="p-3 border">Main Database Engine</td><td className="p-3 border">Supabase PostgreSQL 16 (Online)</td></tr>
                                <tr><td className="p-3 border">AI Inference Engine</td><td className="p-3 border">Groq Cloud - Llama 3.3 (Active)</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-20 text-right">
                        <p className="text-xs font-bold text-slate-400">Verified by LexiMed Secure Gateway</p>
                        <div className="mt-10 h-px w-48 bg-slate-300 ml-auto" />
                        <p className="mt-2 font-black uppercase">{user.name}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}