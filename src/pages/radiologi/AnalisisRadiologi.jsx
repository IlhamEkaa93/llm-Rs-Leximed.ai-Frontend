import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Loader2, Save, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalisisRadiologi() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [aiOutput, setAiOutput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('radiology_draft');
    if (saved) setDraft(JSON.parse(saved));
  }, []);

  const handleGenerateAI = () => {
    setIsProcessing(true);
    // Simulasi pemanggilan API ke Laravel/LLM
    setTimeout(() => {
      setAiOutput(`LAPORAN RADIOLOGI STANDAR\nModalitas: ${draft.modality}\n\nTEMUAN KLINIS:\nBerdasarkan hasil pembacaan citra, struktur jantung dan paru dalam batas normal. Corak bronkovaskuler tidak menunjukkan adanya peningkatan yang signifikan. CTR (Cardiothoracic Ratio) kurang dari 50%, mengindikasikan tidak ada kardiomegali. Tidak tampak adanya infiltrat, nodul, atau lesi patologis pada kedua lapang paru.\n\nKESAN:\n- Cor dan Pulmo dalam batas normal.\n- Tidak tampak tanda-tanda pneumonia atau kardiomegali.`);
      setIsProcessing(false);
    }, 2500);
  };

  const handleFinalSave = () => {
    setIsSaving(true);
    // Simulasi PATCH ke Laravel untuk ubah status jadi 'verified'
    setTimeout(() => {
      setIsSaving(false);
      alert("Laporan Radiologi Terverifikasi dan Disimpan!");
      localStorage.removeItem('radiology_draft');
      navigate('/dashboard-radiologi');
    }, 1500);
  };

  if (!draft) return <div className="p-10 text-center font-bold text-slate-500">Pilih data dari Dashboard atau Input terlebih dahulu.</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans text-left pb-20">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><BrainCircuit size={28} /></div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Validasi Laporan AI</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Pasien: RM-{draft.norm} | {draft.modality}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kolom Kiri: Input Mentah */}
        <div className="bg-slate-100 p-8 rounded-[2.5rem] border border-slate-200">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileText size={14} /> Temuan Awal (Raw Data)
          </h3>
          <div className="bg-white p-6 rounded-2xl text-slate-700 font-medium leading-relaxed shadow-inner border border-slate-100">
            {draft.findings || "Tidak ada catatan kasar."}
          </div>

          <button 
            onClick={handleGenerateAI}
            disabled={isProcessing}
            className="w-full mt-6 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-indigo-200 transition-all"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <BrainCircuit size={20} />}
            {isProcessing ? 'LLM Menganalisis...' : 'Generate Laporan Baku'}
          </button>
        </div>

        {/* Kolom Kanan: Output AI yang bisa di edit (Human-in-the-loop) */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 size={14} /> Draft Laporan Final
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold">Editable</span>
          </div>

          <textarea 
            className="flex-1 w-full min-h-[300px] p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-800 leading-relaxed resize-none"
            value={aiOutput}
            onChange={(e) => setAiOutput(e.target.value)}
            placeholder="Klik 'Generate Laporan Baku' di sebelah kiri untuk melihat hasil AI..."
          />

          <div className="mt-6 space-y-4">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
              <AlertTriangle className="text-amber-500 shrink-0" size={18} />
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                <b>Human-in-the-loop:</b> Harap periksa kembali hasil generate AI. Anda dapat mengedit teks di atas. Keputusan dan interpretasi final tetap berada di tangan Dokter Radiologi.
              </p>
            </div>
            
            <button 
              onClick={handleFinalSave}
              disabled={!aiOutput || isSaving}
              className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                !aiOutput ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-emerald-600 text-white shadow-xl hover:-translate-y-1'
              }`}
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
              Verifikasi & Simpan Permanen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}