import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, FileText, AlertCircle, 
  ArrowRight, Loader2, Zap, User, 
  CheckCircle2, Database, ShieldCheck 
} from 'lucide-react';

export default function HandoverShift() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  
  // States untuk Form Klinis
  const [kondisi, setKondisi] = useState('');
  const [intervensi, setIntervensi] = useState('');
  const [catatanKhusus, setCatatanKhusus] = useState('');
  
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  useEffect(() => {
    // 1. Validasi Sesi & Ambil data pasien aktif dari LocalStorage[cite: 1]
    const savedPatient = localStorage.getItem('active_patient');
    const token = localStorage.getItem('access_token');

    if (!savedPatient || !token) {
      alert("Sesi tidak valid atau pasien belum dipilih.");
      navigate('/dashboardperawat');
    } else {
      setPatient(JSON.parse(savedPatient));
    }
  }, [navigate]);

  const handleGenerateAI = async () => {
    if (!kondisi) return alert("Isi kondisi pasien untuk dirapikan AI.");
    
    setIsProcessingAI(true);
    try {
      // 2. Integrasi ke API Laravel untuk memproses AI (Llama 3)
      const response = await fetch("http://localhost:8000/api/clinical-data", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ 
          patient_id: patient.norm,
          raw_content: `KONDISI: ${kondisi}. INTERVENSI: ${intervensi}.`,
          source: "manual" 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal sinkronisasi AI.");
      }

      const data = await response.json();
      
      // Update UI dengan hasil ringkasan AI (Human-in-the-loop)
      // Kita asumsikan API mengembalikan field 'ai_summary'
      if (data.data && data.data.ai_summary) {
        setKondisi(data.data.ai_summary);
        alert("AI Llama 3 Berhasil merapikan catatan medis Anda.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleLanjutkan = () => {
    if (!kondisi) return alert("Kondisi pasien wajib diisi.");

    // Simpan draf ke LocalStorage untuk tahap finalisasi[cite: 1]
    const draftHandover = {
      patient: patient,
      content: kondisi,
      additionalNotes: catatanKhusus,
      intervensi: intervensi
    };

    localStorage.setItem('pending_handover', JSON.stringify(draftHandover));
    navigate('/simpan-handover'); 
  };

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-left">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
              <Activity className="text-blue-600" size={32} /> 
              Handover Shift AI
            </h1>
            <p className="text-slate-500 font-medium italic">Otomatisasi dokumentasi SBAR menggunakan Llama 3.3</p>
          </div>

          <div className="flex items-center gap-4 bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
             <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <User size={24} />
             </div>
             <div>
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest leading-none mb-1">Pasien Terpilih</p>
                <p className="font-bold text-slate-800 text-lg leading-none">{patient.name}</p>
                <p className="text-xs font-mono font-bold text-slate-500 mt-1 uppercase tracking-tighter">NORM: {patient.norm}</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* FORM INPUT SECTION (KIRI) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-8">
              
              <div className="space-y-4">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={18} className="text-blue-500" />
                  1. Kondisi Klinis & Vital Sign
                </label>
                <textarea 
                  className="w-full h-40 p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                  placeholder="Contoh: Kesadaran CM, TD 120/80, Pasien mengeluh sesak napas..."
                  value={kondisi}
                  onChange={(e) => setKondisi(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={18} className="text-emerald-500" />
                  2. Intervensi Keperawatan Terakhir
                </label>
                <textarea 
                  className="w-full h-32 p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                  placeholder="Contoh: Pemberian nebulizer Combivent jam 08:00, Ganti cairan infus RL..."
                  value={intervensi}
                  onChange={(e) => setIntervensi(e.target.value)}
                />
              </div>

              <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 space-y-4">
                <label className="text-amber-800 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle size={18} /> Catatan Penting untuk Shift Berikutnya
                </label>
                <textarea 
                  className="w-full h-24 p-5 bg-white border border-amber-200 rounded-2xl focus:ring-4 focus:ring-amber-100 outline-none transition-all font-medium text-amber-900 placeholder:text-amber-200"
                  placeholder="Contoh: Monitoring ketat balance cairan, Pasien rencana rontgen jam 14:00..."
                  value={catatanKhusus}
                  onChange={(e) => setCatatanKhusus(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ACTION PANEL (KANAN) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0f172a] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Zap size={120} />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-[10px] font-black uppercase tracking-widest">
                  DARSI Engine Active
                </div>
                <h3 className="text-xl font-black italic">Optimize with AI</h3>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">
                  Klik tombol di bawah untuk merapikan inputan Anda menjadi format terminologi medis standar (SBAR/SOAP) secara otomatis.
                </p>
                <button 
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${
                    isProcessingAI 
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                  }`}
                  onClick={handleGenerateAI} 
                  disabled={isProcessingAI}
                >
                  {isProcessingAI ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Zap size={20} className="fill-current text-yellow-400" />
                  )}
                  {isProcessingAI ? "Processing..." : "Rapikan Data AI"}
                </button>
              </div>
            </div>

            <button 
              className="w-full py-6 bg-slate-900 hover:bg-black text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl transition-all hover:-translate-y-1 active:scale-95 shadow-slate-200"
              onClick={handleLanjutkan}
            >
              Finalisasi Laporan <ArrowRight size={20} />
            </button>

            <div className="flex items-center justify-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>PostgreSQL Synchronized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}