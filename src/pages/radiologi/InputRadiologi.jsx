import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, Search, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InputRadiologi() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ norm: '', modality: 'X-Ray Thorax', findings: '' });

  const handleSimpanDraft = (e) => {
    e.preventDefault();
    // Simulasi simpan draft ke localStorage (seharusnya POST ke API Laravel)
    localStorage.setItem('radiology_draft', JSON.stringify(formData));
    navigate('/radiologi/analisis');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 font-sans text-left pb-20">
      <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-200">
        <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
          <FilePlus className="text-indigo-600" /> Input Temuan Radiologi
        </h2>

        <form onSubmit={handleSimpanDraft} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor RM Pasien</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-indigo-500 font-bold" placeholder="RM-XXXX" onChange={e => setFormData({...formData, norm: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modalitas Pemeriksaan</label>
              <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-indigo-500 font-bold" onChange={e => setFormData({...formData, modality: e.target.value})}>
                <option value="X-Ray Thorax">X-Ray Thorax</option>
                <option value="CT-Scan Kepala">CT-Scan Kepala</option>
                <option value="MRI Tulang Belakang">MRI Tulang Belakang</option>
                <option value="USG Abdomen">USG Abdomen</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temuan Kasar (Raw Findings)</label>
            <textarea 
              className="w-full h-40 bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 outline-none focus:border-indigo-500 font-medium text-slate-700 resize-none leading-relaxed"
              placeholder="Ketik temuan kasar secara cepat (misal: corak bronkovaskuler normal, tidak tampak infiltrat, CTR <50%...)"
              onChange={e => setFormData({...formData, findings: e.target.value})}
              required
            />
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500"/> Data dienkripsi AES-256
            </p>
            <button type="submit" className="w-full sm:w-auto px-10 py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3">
              Kirim ke Llama 3.3 <Zap size={18} className="text-yellow-400 fill-current" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}