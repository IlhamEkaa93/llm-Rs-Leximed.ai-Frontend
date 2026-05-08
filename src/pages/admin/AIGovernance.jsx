import React, { useState } from 'react';
import { 
  ShieldCheck, Star, AlertTriangle, Save, 
  ThumbsUp, ThumbsDown, BrainCircuit, Activity,
  GanttChartSquare, Info, ShieldAlert, Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIGovernance() {
  const [guardrails, setGuardrails] = useState({
    noHateSpeech: true,
    medicalDisclaimer: true,
    piiRedaction: true,
    factChecking: true
  });

  const [rating, setRating] = useState(0);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 text-left font-sans antialiased pb-24">
      
      {/* HEADER SECTION */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
        className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm mb-10 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-12"><Cpu size={200} /></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase italic leading-none">
            AI <span className="text-indigo-600">Governance</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" /> Guardrail & Quality Control System
          </p>
        </div>
        <div className="bg-indigo-50 px-6 py-4 rounded-2xl border border-indigo-100 hidden md:block">
           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest text-center">Neural Core v3.3</p>
           <p className="font-black text-slate-700 text-sm mt-1">Llama 3.3 Active</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT: POIN 24 - AI GUARDRAIL CONFIG */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-6 space-y-8">
          <div className="bg-[#0f172a] p-10 rounded-[3.5rem] shadow-2xl border-[6px] border-white text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex items-center gap-5 mb-10">
              <div className="p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-900/40">
                <ShieldAlert size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">AI Guardrail</h2>
                <p className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest">Aturan Keamanan Output (Poin 24)</p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              {[
                { key: 'strictMedical', label: 'Strict Medical Accuracy', desc: 'Hanya memberikan jawaban berdasarkan database klinis.' },
                { key: 'disclaimer', label: 'Mandatory Disclaimer', desc: 'Sertakan disclaimer medis pada setiap output AI.' },
                { key: 'pii', label: 'PII Data Redaction', desc: 'Otomatis menyensor Nama, Alamat, dan NIK pasien.' },
                { key: 'hallucination', label: 'Fact-Check Engine', desc: 'Verifikasi silang temuan dengan knowledge base.' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all group">
                  <div className="pr-4">
                    <p className="font-black text-sm uppercase tracking-wide group-hover:text-indigo-400 transition-colors">{item.label}</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              ))}
            </div>

            <button className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] mt-10 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3">
              <Save size={18} /> Update Safety Protocol
            </button>
          </div>
        </motion.div>

        {/* RIGHT: POIN 30 - QUALITY EVALUATION */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-6 space-y-8">
          <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-10">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-amber-500 text-white rounded-2xl shadow-xl shadow-amber-200">
                <Star size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">AI Evaluation</h2>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Validasi Kualitas Output (Poin 30)</p>
              </div>
            </div>

            {/* PREVIEW SAMPLE */}
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 relative overflow-hidden group">
              <Info className="absolute top-4 right-4 text-slate-300" size={20} />
              <p className="text-[10px] font-black text-indigo-600 uppercase mb-4 flex items-center gap-2">
                <Activity size={12} /> Last AI Instance Output
              </p>
              <p className="text-slate-700 font-bold leading-relaxed italic">
                "Berdasarkan analisis RAG, pasien dengan RM-001 menunjukkan korelasi klinis terhadap diagnosa Efusi Pleura masif, diperlukan tindakan torakosintesis segera..."
              </p>
            </div>

            {/* RATING SECTION */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Skor Akurasi Medis (Llama 3.3)</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button 
                      key={num} 
                      onClick={() => setRating(num)}
                      className={`flex-1 py-5 rounded-2xl font-black text-lg transition-all border-2 ${rating === num ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Catatan Validator / Peneliti</label>
                <textarea 
                  placeholder="Ketik catatan evaluasi untuk kebutuhan dataset jurnal atau disertasi..." 
                  className="w-full p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] h-40 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-700 shadow-inner"
                />
              </div>

              <button className="w-full py-6 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 group">
                <GanttChartSquare size={18} className="group-hover:rotate-12 transition-transform" /> Submit to Research Database
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}