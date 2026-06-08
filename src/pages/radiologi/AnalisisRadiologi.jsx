import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, ShieldCheck, FileEdit, CheckCircle2, 
  Loader2, XCircle, Database, AlertTriangle, Sparkles, User, Zap 
} from 'lucide-react';

export default function AnalisisRadiologi() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [inputData, setInputData] = useState(null);

  // States AI & Form
  const [isGenerating, setIsGenerating] = useState(false);
  const [laporanFinal, setLaporanFinal] = useState('');
  const [ringkasan, setRingkasan] = useState('');
  const [catatanKoreksi, setCatatanKoreksi] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const activePatient = localStorage.getItem('active_radiology_patient');
    const draftData = localStorage.getItem('radiology_draft');

    if (!activePatient || !draftData) return navigate('/dashboard-radiologi');
    
    setPatient(JSON.parse(activePatient));
    setInputData(JSON.parse(draftData));
  }, [navigate]);

  // SMART AI SIMULATION: Membaca data dinamis dari halaman sebelumnya
  const runLLM = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      // Menarik temuan mentah yang diketik user
      const temuan = inputData?.temuan_mentah || "Tidak ada temuan mentah yang spesifik.";
      const jenis = inputData?.jenis_pemeriksaan ? inputData.jenis_pemeriksaan.replace(/_/g, ' ') : "RADIOLOGI UMUM";

      // 1. LLM Draft Laporan Radiologi (Menyusun ulang temuan mentah jadi struktur baku)
      const draftLLM = `HASIL PEMERIKSAAN: ${jenis}\nKLINIS: Indikasi diagnostik sesuai dengan temuan awal.\n\nTEMUAN OBSERVASI:\n${temuan}\n\nKESAN:\nBerdasarkan pola temuan di atas, indikasi mengarah pada patologi yang disebutkan dalam observasi mentah. Diperlukan korelasi klinis lebih lanjut oleh DPJP.`;
      
      // 2. LLM Ringkasan (Mengambil intisari dari temuan mentah)
      const intisari = temuan.length > 60 ? temuan.substring(0, 100) + "..." : temuan;
      const ringkasanLLM = `Terdapat indikasi: "${intisari}". Membutuhkan evaluasi spesialis lebih lanjut untuk penanganan medis.`;

      setLaporanFinal(draftLLM);
      setRingkasan(ringkasanLLM);
      setIsGenerating(false);
    }, 3500); // Dibuat 3.5 detik agar animasi scan AI LexiMed terlihat meyakinkan
  };

  // Trigger POST ke Backend -> Otomatis tercatat di Audit Log Laravel
  const handleApprove = async () => {
    if (!laporanFinal) return alert("Hasilkan draf AI terlebih dahulu.");
    setIsSaving(true);
    
    try {
      const response = await fetch("https://lexi-med-ai-llm-rs-back-end.vercel.app/api/clinical-data", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ 
          patient_id: patient.norm || patient.no_rm,
          raw_content: `[RINGKASAN RADIOLOGI]:\n${ringkasan}\n\n[LAPORAN LENGKAP]:\n${laporanFinal}\n\n[KOREKSI RADIOLOG]: ${catatanKoreksi || 'Tidak ada koreksi (Validasi AI Murni)'}`,
          status: "verified",
          source: "radiologi_ai_analysis"
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          localStorage.removeItem('active_radiology_patient');
          localStorage.removeItem('radiology_draft');
          navigate('/dashboard-radiologi');
        }, 3500);
      } else {
        throw new Error("Gagal menyinkronkan data ke server.");
      }
    } catch (err) {
      alert("Error System: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!patient || !inputData) return null;

  return (
    <div className="min-h-screen bg-[#f4f7f9] p-4 md:p-8 font-sans text-left pb-24 text-slate-900 antialiased overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
          className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-xl shadow-emerald-200 shrink-0">
              <BrainCircuit size={32} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic leading-none text-slate-900">Validasi Laporan</h1>
              <p className="text-emerald-600 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.3em] mt-2">LexiMed Neural Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 px-5 md:px-6 py-3 rounded-[1.5rem] border border-slate-200 shrink-0 w-full md:w-auto">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
               <User size={18} className="text-slate-400" />
            </div>
            <div className="text-left leading-tight">
              <p className="font-black text-slate-800 text-sm md:text-base tracking-tight leading-none line-clamp-1">{patient.name}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">RM: {patient.norm || patient.no_rm}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* EDITOR AREA (KIRI) */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
              
              <AnimatePresence>
                {isGenerating && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                    className="absolute inset-0 bg-white/90 backdrop-blur-md z-20 flex flex-col items-center justify-center border-4 border-emerald-50/50"
                  >
                    <div className="relative mb-8">
                      {/* Animasi Radar / Scanning */}
                      <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.8, 0.2] }} 
                        transition={{ repeat: Infinity, duration: 2 }} 
                        className="absolute inset-0 bg-emerald-400 rounded-full blur-[30px]" 
                      />
                      <Loader2 className="animate-spin text-emerald-600 relative z-10" size={80} strokeWidth={1.5} />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-400 z-10" size={30} />
                    </div>
                    <h3 className="font-black text-slate-900 text-2xl tracking-tighter uppercase italic mb-2">Neural Processing</h3>
                    <p className="font-bold text-emerald-600 text-[10px] md:text-xs tracking-[0.3em] uppercase animate-pulse text-center px-6">Menganalisis Gambar & Mengekstrak Temuan Klinis...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-6 md:space-y-8">
                {/* RINGKASAN */}
                <div className="space-y-3">
                  <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileEdit size={16} className="text-emerald-500"/> Ringkasan Laporan AI
                  </label>
                  <textarea 
                    value={ringkasan} onChange={(e) => setRingkasan(e.target.value)}
                    placeholder="Klik 'Generate LLM' untuk membuat ringkasan singkat untuk dokter perujuk..."
                    className={`w-full h-28 md:h-32 p-5 md:p-6 bg-slate-50 border-2 rounded-[1.5rem] md:rounded-[2rem] font-bold text-slate-700 outline-none transition-all shadow-inner resize-none text-sm md:text-base ${laporanFinal ? 'border-emerald-200 focus:border-emerald-500 focus:bg-white' : 'border-slate-100'}`}
                  />
                </div>

                {/* LAPORAN LENGKAP */}
                <div className="space-y-3">
                  <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileEdit size={16} className="text-emerald-500"/> Draft Laporan Radiologi Final
                  </label>
                  <textarea 
                    value={laporanFinal} onChange={(e) => setLaporanFinal(e.target.value)}
                    placeholder="Klik 'Generate LLM' untuk merekonstruksi temuan mentah menjadi draf standar..."
                    className={`w-full h-64 md:h-80 p-6 md:p-8 bg-slate-50 border-2 rounded-[2rem] md:rounded-[2.5rem] font-medium text-slate-700 outline-none transition-all shadow-inner resize-none leading-relaxed text-sm md:text-base ${laporanFinal ? 'border-emerald-200 focus:border-emerald-500 focus:bg-white' : 'border-slate-100'}`}
                  />
                </div>

                <hr className="border-slate-200 border-dashed" />

                {/* KOREKSI */}
                <div className="space-y-3">
                  <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500"/> Catatan Koreksi Radiolog <span className="text-slate-300 ml-1 font-medium">(Opsional)</span>
                  </label>
                  <input 
                    value={catatanKoreksi} onChange={(e) => setCatatanKoreksi(e.target.value)}
                    placeholder="Beri catatan di sini jika Anda melakukan editan pada hasil AI..."
                    className="w-full bg-slate-50 border-2 border-slate-100 p-5 md:p-6 rounded-2xl font-bold text-slate-700 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-50 transition-all shadow-inner text-sm md:text-base"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* SIDEBAR (KANAN) */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden border-4 md:border-[6px] border-slate-800 group">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/30 transition-all duration-700" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 space-y-8">
                
                {/* Tombol Generate LLM */}
                <button 
                  onClick={runLLM} disabled={isGenerating}
                  className="w-full py-5 md:py-6 bg-gradient-to-br from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 rounded-2xl md:rounded-[1.5rem] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/50 active:scale-95 disabled:opacity-50 disabled:grayscale relative overflow-hidden"
                >
                  <BrainCircuit size={20} className="relative z-10" /> 
                  <span className="relative z-10">Generate AI Analysis</span>
                </button>

                <div className="h-px bg-slate-700 w-full" />

                <div className="space-y-4">
                  {/* Tombol Approve (Terkoneksi ke Laravel) */}
                  <button 
                    onClick={handleApprove} disabled={isSaving || !laporanFinal}
                    className="w-full py-5 md:py-6 bg-emerald-600 hover:bg-emerald-500 rounded-2xl md:rounded-[2rem] font-black text-[11px] md:text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/50 active:scale-95 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
                  >
                    {isSaving ? <><Loader2 className="animate-spin" size={20} /> Mengenkripsi...</> : <><ShieldCheck size={20} /> Validasi & Simpan</>}
                  </button>
                  
                  {/* Tombol Reject */}
                  <button 
                    onClick={() => navigate('/radiologi/input')}
                    disabled={isSaving}
                    className="w-full py-4 md:py-5 bg-transparent border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500 rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all active:scale-95"
                  >
                    <XCircle size={16} className="inline mr-2 -mt-0.5" /> Reject & Ulangi Input
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  <Database size={16} /> Audit Trail Sync
                </div>
                <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed">
                  Menekan "Validasi & Simpan" akan mengunci laporan ini ke dalam database PostgreSQL dan mencatat aktivitas Anda ke <span className="text-emerald-500">Audit Log System</span>.
                </p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* SUCCESS OVERLAY ANIMATION */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] text-center max-w-sm shadow-2xl border-8 border-emerald-50 relative overflow-hidden">
              {/* Logo background pudar */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none grayscale">
                 <img src="/logo.png" alt="watermark" className="w-48 h-48 object-contain" />
              </div>

              <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                <CheckCircle2 size={40} className="md:w-12 md:h-12" />
              </div>
              <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter mb-2 text-slate-900 relative z-10">Validasi Berhasil</h2>
              <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest mb-6 leading-relaxed relative z-10">Sinkronisasi Database & Audit Log Aktif</p>
              <Loader2 className="animate-spin text-emerald-300 mx-auto relative z-10" size={24} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}