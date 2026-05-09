import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pill, Activity, Loader2, BrainCircuit, 
  Search, RefreshCw, UserCheck, Eye, Database, Clock, 
  Heart, Thermometer, Droplets, Sparkles, ShieldCheck, FileText, ClipboardList
} from 'lucide-react';

export default function DataRekamMedis() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('diagnosa');
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [pemeriksaanAwal, setPemeriksaanAwal] = useState(null); 
  const [isRefreshing, setIsRefreshing] = useState(false);

  const API_URL = "https://lexi-med-ai-llm-rs-back-end.vercel.app/api";
  const token = localStorage.getItem('access_token');

  const loadInitialData = useCallback(async () => {
    setIsRefreshing(true);
    const savedPatient = localStorage.getItem('active_patient');
    
    if (savedPatient) {
      try {
        const parsedPatient = JSON.parse(savedPatient);
        const norm = parsedPatient.norm || parsedPatient.no_rm || parsedPatient.patient_id;
        
        // Ambil data detail profil terbaru agar Gender/Umur/Title REAL
        await fetchPatientDetail(norm, parsedPatient);
        
        // Ambil riwayat & vital sign secara paralel agar lebih cepat
        await Promise.all([
          fetchVerifiedHistory(norm),
          fetchPemeriksaanAwal(norm)
        ]);
      } catch (e) {
        console.error("Gagal sinkronisasi data:", e);
      }
    }
    setLoading(false);
    setIsRefreshing(false);
  }, [token]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 1. Ambil detail pasien dari tabel patients (Agar Umur/Gender/Title Akurat)
  const fetchPatientDetail = async (norm, fallbackData) => {
    try {
      const res = await fetch(`${API_URL}/patients/${norm}`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      const result = await res.json();
      
      if (res.ok && result.data) {
        const d = result.data;
        const isMale = d.gender === 'Laki-Laki' || d.gender === 'L';
        setPatient({
          ...d,
          norm: d.no_rm,
          displayGender: isMale ? 'Laki-Laki' : 'Perempuan',
          displayAge: d.age || fallbackData.age || '0',
          displayTitle: d.title || (isMale ? 'Tn.' : 'Ny.')
        });
      } else {
        // Jika API Detail gagal, gunakan data dari localStorage sebagai Fallback
        const isMale = fallbackData.gender === 'Laki-Laki' || fallbackData.gender === 'L';
        setPatient({
          ...fallbackData,
          displayGender: isMale ? 'Laki-Laki' : 'Perempuan',
          displayAge: fallbackData.age || '0',
          displayTitle: fallbackData.title || (isMale ? 'Tn.' : 'Ny.')
        });
      }
    } catch (e) {
      console.error("Gagal fetch detail pasien");
    }
  };

  // 2. Ambil TTV terbaru dari asisten
  const fetchPemeriksaanAwal = async (norm) => {
    try {
      const res = await fetch(`${API_URL}/clinical-data/${norm}`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      const result = await res.json();
      if (res.ok) {
        setPemeriksaanAwal(result);
      } else {
        setPemeriksaanAwal(null);
      }
    } catch (e) {
      console.error("Kesalahan jaringan saat mengambil TTV");
    }
  };

  // 3. Ambil Histori (Data yang SUDAH diverifikasi dokter)
  const fetchVerifiedHistory = async (norm) => {
    try {
      const res = await fetch(`${API_URL}/patients/${norm}/history`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      setHistory([]);
    }
  };

  if (loading) return (
    <div className="flex flex-col h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">
        Membangun Koneksi PostgreSQL...
      </p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 text-left font-sans antialiased">
      
      {/* 1. HEADER PROFIL - REAL DATA */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
        className="bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-slate-200 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-center gap-5 z-10 w-full xl:w-auto">
          {/* Avatar Inisial Pasien */}
          <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg ring-4 ${patient?.displayGender === 'Laki-Laki' ? 'bg-blue-600 ring-blue-50' : 'bg-pink-500 ring-pink-50'}`}>
            {patient?.name?.charAt(0)?.toUpperCase() || 'P'}
          </div>
          
          <div className="text-center md:text-left space-y-1.5 w-full">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 italic uppercase tracking-tight truncate">
              <span className="text-blue-600 not-italic">{patient?.displayTitle}</span> {patient?.name} 
              <span className="text-slate-300 font-medium text-base ml-2 tracking-tighter hidden sm:inline-block">
                (RM: {patient?.norm})
              </span>
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
              <span className={`px-3 py-1 rounded-full ${patient?.displayGender === 'Laki-Laki' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                {patient?.displayGender}
              </span>
              <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block"></span>
              <span className="bg-slate-100 px-3 py-1 rounded-full">{patient?.displayAge} Tahun</span>
              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-black border border-emerald-100 uppercase italic flex items-center gap-1">
                <Database size={10} /> PostgreSQL Verified
              </span>
            </div>
          </div>
        </div>
        
        {/* --- ACTION BUTTONS (DIPERKECIL AGAR LEBIH RAPI & PAS) --- */}
        <div className="flex flex-wrap xl:flex-nowrap gap-2 z-10 w-full xl:w-auto mt-4 xl:mt-0 justify-center md:justify-start">
          
          <button 
            onClick={loadInitialData} 
            className="flex-1 sm:flex-none bg-slate-50 text-slate-600 px-4 py-2.5 rounded-full font-black text-[10px] sm:text-[11px] uppercase hover:bg-slate-100 hover:text-slate-800 transition-all flex items-center justify-center gap-1.5 border border-slate-200"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-500" : "text-slate-400"} /> 
            <span className="hidden sm:block">REFRESH</span>
          </button>
          
          <button 
            onClick={() => navigate('/input-klinis')} 
            className="flex-1 sm:flex-none bg-[#0f172a] text-white px-5 py-2.5 rounded-full font-black text-[10px] sm:text-[11px] uppercase tracking-wider shadow-md shadow-slate-900/20 hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <BrainCircuit size={14} className="text-blue-400" /> UPDATE DATA
          </button>

          <button 
            onClick={() => navigate('/ringkasan')} 
            className="flex-1 sm:flex-none bg-emerald-500 text-white px-5 py-2.5 rounded-full font-black text-[10px] sm:text-[11px] uppercase tracking-wider shadow-md shadow-emerald-500/30 hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Sparkles size={14} className="text-emerald-100" /> RINGKASAN AI
          </button>

           <button 
            onClick={() => navigate('/resume')} 
            className="flex-1 sm:flex-none bg-indigo-500 text-white px-5 py-2.5 rounded-full font-black text-[10px] sm:text-[11px] uppercase tracking-wider shadow-md shadow-indigo-500/30 hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <ClipboardList size={14} className="text-indigo-100" /> RESUME MEDIS
          </button>

        </div>
      </motion.div>

      {/* 2. VITAL SIGNS - REAL MAPPING */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
        {[
          { label: 'Tekanan Darah', val: pemeriksaanAwal?.blood_pressure || '---/--', unit: 'mmHg', icon: <Activity className="text-blue-500" /> },
          { label: 'Denyut Nadi', val: pemeriksaanAwal?.heart_rate || '--', unit: 'bpm', icon: <Heart className="text-red-500" /> },
          { label: 'Suhu Tubuh', val: pemeriksaanAwal?.temperature || '--', unit: '°C', icon: <Thermometer className="text-orange-500" /> },
          { label: 'Saturasi O2', val: pemeriksaanAwal?.oxygen_saturation || '--', unit: '%', icon: <Droplets className="text-cyan-500" /> },
        ].map((item, i) => (
          <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-5 sm:p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col items-center justify-center transition-all group hover:border-blue-300 hover:shadow-md">
            <div className="mb-3 p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">{item.icon}</div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{item.label}</span>
            <div className="font-black text-2xl sm:text-3xl text-slate-900 tracking-tighter">
              {item.val} <small className="text-[10px] font-bold text-slate-400 uppercase ml-1">{item.unit}</small>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. NAVIGATION TABS (DIPERKECIL JUGA BIAR MATCH) */}
      <div className="flex gap-2 bg-slate-100/80 p-1.5 rounded-full w-full md:w-fit mx-auto border border-slate-200 backdrop-blur-sm overflow-x-auto snap-x hide-scrollbar">
        {['diagnosa', 'radiologi', 'obat'].map((t) => (
          <button 
            key={t} 
            onClick={() => setActiveTab(t)} 
            className={`px-5 py-2.5 rounded-full font-black text-[10px] sm:text-[11px] uppercase tracking-widest transition-all whitespace-nowrap snap-center ${
              activeTab === t 
              ? 'bg-white text-blue-600 shadow-md shadow-blue-100/50' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            {t === 'diagnosa' ? 'Diagnosa & Catatan' : t === 'radiologi' ? 'Hasil Radiologi' : 'Terapi Obat'}
          </button>
        ))}
      </div>

      {/* 4. TAB CONTENT */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            transition={{ duration: 0.2 }}
            className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden"
          >
            
            {/* --- TAB DIAGNOSA --- */}
            {activeTab === 'diagnosa' && (
              <div className="p-5 sm:p-8 md:p-10">
                {/* GEJALA AWAL DARI ASISTEN / KLINIS TERKINI */}
                {pemeriksaanAwal && pemeriksaanAwal.raw_content && pemeriksaanAwal.raw_content !== "Data belum tersedia" ? (
                  <motion.div initial={{ scale: 0.98 }} animate={{ scale: 1 }} className="mb-12 bg-blue-50/50 border-l-8 border-blue-500 p-6 md:p-8 rounded-[2rem] shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200"><UserCheck size={20} /></div>
                      <h4 className="font-black text-blue-900 uppercase text-xs tracking-widest">Catatan Medis Terkini</h4>
                    </div>
                    <p className="text-blue-900/80 font-medium text-lg italic leading-relaxed whitespace-pre-wrap">
                      "{pemeriksaanAwal.raw_content}"
                    </p>
                    <div className="mt-6 pt-5 border-t border-blue-200/60 flex flex-wrap items-center justify-between gap-3 text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">
                       <div className="flex items-center gap-2">
                         <Clock size={14} /> Diupdate: {new Date(pemeriksaanAwal.updated_at || pemeriksaanAwal.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                       </div>
                       <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-100/50 px-4 py-1.5 rounded-full border border-emerald-200">
                         <ShieldCheck size={12} /> Verified Data
                       </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="mb-12 bg-slate-50 border-l-8 border-slate-300 p-8 rounded-3xl flex items-center gap-4 border-dashed border-2">
                     <Clock className="text-slate-400 animate-pulse" size={28} />
                     <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em]">Belum ada Catatan Klinis. Silakan Update Data Klinis.</p>
                  </div>
                )}

                <h3 className="text-lg font-black text-slate-900 uppercase mb-8 flex items-center gap-3 tracking-tight">
                    <Database className="text-emerald-500" size={22} /> Histori Rekam Medis
                </h3>

                {/* TIMELINE HISTORI */}
                <div className="space-y-10 pl-2 md:pl-4">
                  {history.length > 0 ? history.map((item, idx) => (
                    <div key={idx} className="relative pl-8 md:pl-12 pb-10 border-l-2 border-dashed border-slate-200 last:border-0 text-left group">
                      <div className="absolute left-[-11px] top-0 w-5 h-5 bg-emerald-500 rounded-full ring-4 ring-emerald-50 shadow-md group-hover:bg-blue-500 group-hover:ring-blue-50 transition-colors"></div>
                      <div className="flex items-center gap-3 mb-4 text-xs font-bold text-slate-400">
                         <span className="text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                           Visit Verified
                         </span>
                         <span>{new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} WIB</span>
                      </div>
                      <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100 text-slate-700 font-medium shadow-sm hover:shadow-md transition-all whitespace-pre-wrap leading-relaxed">
                         {item.ai_summary || item.raw_content}
                      </div>
                    </div>
                  )) : (
                    <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem] opacity-60">
                        <Search className="text-slate-300 mx-auto mb-4" size={60} />
                        <p className="text-slate-500 font-black uppercase text-xs tracking-[0.3em]">Belum ada riwayat kunjungan yang diverifikasi.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- TAB RADIOLOGI (DENGAN STRUKTUR UI LAPORAN MEDIS) --- */}
            {activeTab === 'radiologi' && (
              <div className="p-6 sm:p-8 md:p-10 text-left">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div className="flex items-center gap-4">
                       <div className="p-3.5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200"><Eye size={28} /></div>
                       <div>
                          <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight italic">Radiology Report</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">PACS Integration Module</p>
                       </div>
                    </div>
                    <span className="hidden md:flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100 text-[10px] font-black uppercase tracking-widest">
                       <Database size={12} /> LIS / DICOM Sync
                    </span>
                 </div>
                 
                 {/* Pengecekan Data Radiologi (Jika sudah ada endpoint, ganti condition-nya) */}
                 {pemeriksaanAwal?.radiology_result ? (
                    <div className="bg-white border border-indigo-100 rounded-[2rem] p-6 md:p-8 shadow-sm">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                            <h4 className="font-black text-indigo-900 uppercase tracking-widest text-sm">Pemeriksaan Radiologi</h4>
                            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase border border-indigo-100">
                               Verified by Radiologist
                            </span>
                        </div>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                           {pemeriksaanAwal.radiology_result}
                        </p>
                    </div>
                 ) : (
                    <div className="py-20 md:py-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
                       <div className="w-20 h-20 bg-indigo-100/50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Eye className="text-indigo-400" size={32} />
                       </div>
                       <h3 className="font-black text-slate-700 uppercase tracking-widest text-sm mb-2">Belum Ada Hasil Radiologi</h3>
                       <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed px-4">
                         Menunggu sinkronisasi berkas DICOM dan ekspertise dari Unit Radiologi RS UNS.
                       </p>
                    </div>
                 )}
              </div>
            )}

            {/* --- TAB OBAT (TERINTEGRASI AI) --- */}
            {activeTab === 'obat' && (
              <div className="p-6 sm:p-8 md:p-10 text-left">
                 <div className="flex items-center gap-4 mb-10">
                    <div className="p-3.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200"><Pill size={28} /></div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Pharmaceutical Plan</h3>
                 </div>
                 
                 {(() => {
                    // Cek apakah data sudah diverifikasi dokter (masuk ke tabel history)
                    const summaryText = history.length > 0 ? history[0].ai_summary : null;
                    
                    if (!summaryText) {
                       return (
                          <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem]">
                              <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em]">
                                Instalasi Farmasi: Menunggu Verifikasi Final Dokter.
                              </p>
                          </div>
                       );
                    }

                    // Logika Ekstraktor Obat Otomatis dari Teks AI
                    const extractMeds = (text) => {
                        const keywords = ['mg', 'sirup', 'tablet', 'kapsul', 'injeksi', 'infus', 'ml', 'gram'];
                        const clauses = text.split(/[.,]|\bserta\b/i);
                        let meds = clauses
                            .filter(s => keywords.some(kw => s.toLowerCase().includes(kw)))
                            .map(s => {
                                let clean = s.replace(/^(meliputi|dengan|pemberian|terapi|penggantian|penambahan)\s+/i, '').trim();
                                return clean.charAt(0).toUpperCase() + clean.slice(1);
                            })
                            .filter(s => s.length > 5);
                        
                        if (meds.length === 0) return ["Edukasi Pasien & Modifikasi Gaya Hidup", "Terapi Simtomatik Sesuai Anjuran"];
                        return meds;
                    };

                    const obatList = extractMeds(summaryText);

                    return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {obatList.map((tx, i) => (
                              <div key={i} className="bg-white p-6 rounded-[2rem] border border-blue-100 flex items-center gap-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-default group">
                                 <div className="p-3.5 bg-blue-50 rounded-2xl text-blue-600 shrink-0 group-hover:scale-110 transition-transform"><Sparkles size={20}/></div>
                                 <span className="font-black text-slate-800 text-sm md:text-base tracking-tight leading-relaxed">{tx}</span>
                              </div>
                           ))}
                        </div>
                    );
                 })()}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}