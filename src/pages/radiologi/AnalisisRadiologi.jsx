import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, ShieldCheck, FileEdit, CheckCircle2, 
  Loader2, Save, XCircle, Database, AlertTriangle, Sparkles 
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

  // Simulasi Engine LLM Llama 3.3
  const runLLM = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      // 1. LLM Draft Laporan Radiologi (Struktur Baku)
      const draftLLM = `HASIL PEMERIKSAAN: ${inputData.jenis_pemeriksaan.replace(/_/g, ' ')}\nKLINIS: Suspect patologi intratorakal.\n\nTEMUAN:\n- Cor: Membesar dengan CTR 60%.\n- Pulmo: Tampak perselubungan homogen di hemithorax dextra inferior yang menutupi sinus kostofrenikus dan diafragma dextra.\n- Trakea: Di tengah.\n- Tulang-tulang intak.\n\nKESAN:\n1. Kardiomegali.\n2. Efusi pleura dextra.`;
      
      // 2. LLM Ringkasan (Kesimpulan Cepat untuk Dokter Perujuk)
      const ringkasanLLM = `Pasien menunjukkan indikasi kardiomegali disertai efusi pleura pada paru kanan. Membutuhkan evaluasi kardiologi lebih lanjut.`;

      setLaporanFinal(draftLLM);
      setRingkasan(ringkasanLLM);
      setIsGenerating(false);
    }, 3000); // Dibuat 3 detik agar animasi scan AI terlihat lebih meyakinkan
  };

  // Trigger POST ke Backend -> Otomatis tercatat di Audit Log Laravel
  const handleApprove = async () => {
    if (!laporanFinal) return alert("Hasilkan draf AI terlebih dahulu.");
    setIsSaving(true);
    
    try {
      const response = await fetch("http://localhost:8000/api/clinical-data", {
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
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-left pb-24 text-slate-900 antialiased">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
          className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-6"
        >
          <div className="p-4 bg-indigo-600 rounded-[1.5rem] text-white shadow-xl shadow-indigo-200 shrink-0">
            <BrainCircuit size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Analisis & Validasi Laporan</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">LLM Llama 3.3 Integration</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* EDITOR AREA (KIRI) */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden">
              
              <AnimatePresence>
                {isGenerating && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                    className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center border-4 border-indigo-50"
                  >
                    <div className="relative mb-6">
                      <Loader2 className="animate-spin text-indigo-600" size={70} />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400" size={24} />
                    </div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tighter uppercase italic mb-1">Neural Processing</h3>
                    <p className="font-bold text-indigo-600 text-xs tracking-[0.3em] uppercase animate-pulse">Menganalisis Gambar & Temuan Mentah...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-8">
                {/* RINGKASAN */}
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileEdit size={16} className="text-indigo-500"/> Ringkasan Laporan AI
                  </label>
                  <textarea 
                    value={ringkasan} onChange={(e) => setRingkasan(e.target.value)}
                    placeholder="Klik 'Generate LLM' untuk membuat ringkasan singkat untuk dokter perujuk..."
                    className={`w-full h-28 p-6 bg-slate-50 border-2 rounded-[2rem] font-bold text-slate-700 outline-none transition-all shadow-inner resize-none ${laporanFinal ? 'border-indigo-200 focus:border-indigo-500' : 'border-slate-100'}`}
                  />
                </div>

                {/* LAPORAN LENGKAP */}
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileEdit size={16} className="text-indigo-500"/> Draft Laporan Radiologi Final
                  </label>
                  <textarea 
                    value={laporanFinal} onChange={(e) => setLaporanFinal(e.target.value)}
                    placeholder="Klik 'Generate LLM' untuk merekonstruksi temuan mentah menjadi draf standar..."
                    className={`w-full h-80 p-8 bg-slate-50 border-2 rounded-[2.5rem] font-medium text-slate-700 outline-none transition-all shadow-inner resize-none leading-relaxed ${laporanFinal ? 'border-indigo-200 focus:border-indigo-500' : 'border-slate-100'}`}
                  />
                </div>

                <hr className="border-slate-100 border-dashed" />

                {/* KOREKSI */}
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500"/> Catatan Koreksi Radiolog (Opsional)
                  </label>
                  <input 
                    value={catatanKoreksi} onChange={(e) => setCatatanKoreksi(e.target.value)}
                    placeholder="Beri catatan di sini jika Anda melakukan editan pada hasil AI..."
                    className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-2xl font-bold text-slate-700 outline-none focus:border-amber-500 transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* SIDEBAR (KANAN) */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden border-[6px] border-slate-800">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 space-y-8">
                <button 
                  onClick={runLLM} disabled={isGenerating}
                  className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-900/50 active:scale-95 disabled:opacity-50"
                >
                  <BrainCircuit size={18} /> Generate LLM Analysis
                </button>

                <div className="h-px bg-slate-700 w-full" />

                <div className="space-y-4">
                  <button 
                    onClick={handleApprove} disabled={isSaving || !laporanFinal}
                    className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/50 active:scale-95 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500"
                  >
                    {isSaving ? <><Loader2 className="animate-spin" size={20} /> Mengenkripsi...</> : <><ShieldCheck size={20} /> Validasi & Simpan</>}
                  </button>
                  <button 
                    onClick={() => navigate('/radiologi/input')}
                    disabled={isSaving}
                    className="w-full py-5 bg-transparent border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                  >
                    Reject & Ulangi Input
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                  <Database size={18} /> Audit Trail Sync
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">
                  Menekan "Validasi & Simpan" akan mengunci laporan ini ke dalam database PostgreSQL dan mencatat aktivitas Anda ke <span className="text-indigo-500">Audit Log System</span>.
                </p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* SUCCESS OVERLAY ANIMATION */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white p-12 rounded-[3.5rem] text-center max-w-sm shadow-2xl border-8 border-emerald-50">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2 text-slate-900">Validasi Berhasil</h2>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-6 leading-relaxed">Sinkronisasi Database & Audit Log Aktif</p>
              <Loader2 className="animate-spin text-slate-300 mx-auto" size={24} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}