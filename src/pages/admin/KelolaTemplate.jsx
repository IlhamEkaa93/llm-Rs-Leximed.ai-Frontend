import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, Layout, Save, Plus, 
  Trash2, ClipboardList, Database, Loader2, CheckCircle, ShieldAlert 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function KelolaTemplate() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const token = localStorage.getItem('access_token');

  // --- 1. FETCH DATA DARI POSTGRESQL ---
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/templates`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json" 
        }
      });
      
      if (!response.ok) throw new Error("Gagal memuat database");
      
      const data = await response.json();
      setTemplates(data);
      if (data.length > 0) setActiveTemplate(data[0]);
    } catch (err) {
      console.warn("Backend offline. Memuat data fallback standar RS UNS.");
      // Fallback Data sesuai Standar Medis
      const fallback = [
        { id: 1, name: 'Template Resume Medis RJ', type: 'Resume', prompt: 'Buatkan resume medis formal dan komprehensif...', structure: ['identitas', 'ringkasan'] },
        { id: 2, name: 'Template Ringkasan Pulang RI', type: 'Resume', prompt: 'Fokus pada instruksi pulang dan kriteria pemulangan...', structure: ['identitas', 'penunjang'] },
        { id: 3, name: 'Template Handover Perawat', type: 'Handover', prompt: 'Gunakan format SBAR (Situation, Background, Assessment, Recommendation) baku...', structure: ['identitas', 'ringkasan', 'penunjang'] },
      ];
      setTemplates(fallback);
      setActiveTemplate(fallback[0]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  // --- 2. LOGIKA UPDATE STRUKTUR (CHECKBOX) ---
  const toggleStructure = (item) => {
    if (!activeTemplate) return;
    const currentStructure = activeTemplate.structure || [];
    const newStructure = currentStructure.includes(item)
      ? currentStructure.filter(i => i !== item)
      : [...currentStructure, item];
    
    setActiveTemplate({ ...activeTemplate, structure: newStructure });
  };

  // --- 3. SIMPAN KE BACKEND VOLT (LARAVEL) ---
  const handleSaveConfig = async () => {
    if (!activeTemplate) return;
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/templates/${activeTemplate.id}`, {
        method: "PUT", // Atau POST jika membuat baru
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(activeTemplate)
      });

      if (response.ok) {
        alert("Konfigurasi Template Berhasil Disinkronisasi ke PostgreSQL RS UNS.");
        setTemplates(templates.map(t => t.id === activeTemplate.id ? activeTemplate : t));
      } else {
         const errorData = await response.json();
         throw new Error(errorData.message || "Gagal menyimpan ke database.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-left">
      
      {/* Header Utama */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 mb-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight italic uppercase">
            <Layout size={32} className="text-amber-500" /> Konfigurasi Template AI
          </h1>
          <p className="text-slate-500 font-medium">Otorisasi struktur data LLM untuk standardisasi dokumen medis digital RS UNS.</p>
        </div>
        <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-amber-200 active:scale-95">
          <Plus size={20} /> Buat Template Baru
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sisi Kiri: Daftar Template */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 overflow-hidden flex flex-col h-[700px]">
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 mb-6 w-fit">
               <Database size={14} /> HIS PostgreSQL Link
            </div>
            
            <h3 className="text-xl font-black text-slate-800 mb-6">Daftar Template Aktif</h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {loading && templates.length === 0 ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
              ) : templates.map((t) => (
                <div 
                  key={t.id} 
                  className={`flex justify-between items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    activeTemplate?.id === t.id 
                    ? 'border-blue-500 bg-blue-50 shadow-md scale-100' 
                    : 'border-slate-100 bg-white hover:border-slate-300 scale-95 opacity-80 hover:opacity-100'
                  }`}
                  onClick={() => setActiveTemplate(t)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${activeTemplate?.id === t.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                      <ClipboardList size={20} />
                    </div>
                    <div>
                      <h4 className={`font-black ${activeTemplate?.id === t.id ? 'text-blue-900' : 'text-slate-700'}`}>{t.name}</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipe: {t.type} • ID: {t.id}</span>
                    </div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Template">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sisi Kanan: Editor Struktur & Prompt */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTemplate?.id || 'empty'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="lg:col-span-8"
          >
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-8 md:p-10 space-y-8">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-6">
                <div>
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                     Konfigurasi Engine: <span className="text-blue-600 underline decoration-blue-200 italic">{activeTemplate?.name || 'Pilih Template'}</span>
                   </h3>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Atur parameter parsing data untuk asisten AI (Volt/Glow).</p>
                </div>
                <button 
                  className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl ${
                    isSaving || !activeTemplate 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-[#0f172a] text-white hover:bg-blue-600 hover:-translate-y-1 active:scale-95 shadow-blue-900/20'
                  }`} 
                  onClick={handleSaveConfig} 
                  disabled={isSaving || !activeTemplate}
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {isSaving ? "Menyimpan..." : "Update Template"}
                </button>
              </div>
              
              {/* Checkbox Structure Builder */}
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Struktur Dokumen Final</h4>
                
                {[
                  { id: 'identitas', title: 'Blok Identitas Pasien', desc: 'Ambil otomatis Nama, No. RM, dan DOB dari database utama.' },
                  { id: 'ringkasan', title: 'Ringkasan Penyakit (LLM Engine)', desc: 'Gunakan Llama 3.3 untuk merangkum SOAP menjadi narasi klinis.' },
                  { id: 'penunjang', title: 'Filter Hasil Penunjang Abnormal', desc: 'Otomatis mengekstrak hasil Lab/Rad yang berada di luar range normal.' }
                ].map((item) => (
                  <label key={item.id} className={`flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all border-2 ${
                    activeTemplate?.structure?.includes(item.id) ? 'bg-white border-blue-500 shadow-md' : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'
                  }`}>
                    <div className="relative mt-1">
                      <input 
                        type="checkbox" className="sr-only peer"
                        checked={activeTemplate?.structure?.includes(item.id) || false} 
                        onChange={() => toggleStructure(item.id)} 
                        disabled={!activeTemplate}
                      />
                      <div className="w-6 h-6 border-2 border-slate-300 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                         {activeTemplate?.structure?.includes(item.id) && <CheckCircle size={16} className="text-white" />}
                      </div>
                    </div>
                    <div>
                      <strong className={`block text-lg font-black ${activeTemplate?.structure?.includes(item.id) ? 'text-blue-900' : 'text-slate-700'}`}>{item.title}</strong>
                      <p className="text-sm font-medium text-slate-500 mt-1">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* AI Prompt Textarea */}
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                   <label className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                     <FileText size={18} className="text-blue-500"/> Instruksi Sistem (System Prompt)
                   </label>
                   <span className="bg-slate-900 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest font-mono">
                     Llama-3-70b-Versatile
                   </span>
                </div>
                <textarea 
                  className="w-full h-48 p-6 bg-slate-50 border-2 border-slate-200 rounded-[24px] text-slate-800 text-lg leading-relaxed focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none font-medium placeholder:text-slate-300"
                  value={activeTemplate?.prompt || ""}
                  onChange={(e) => setActiveTemplate({...activeTemplate, prompt: e.target.value})}
                  placeholder="Contoh: Bertindaklah sebagai Dokter Spesialis, buat resume yang ringkas..." 
                  disabled={!activeTemplate}
                />
                <div className="flex items-start gap-3 bg-amber-50 p-5 rounded-2xl border border-amber-100">
                   <ShieldAlert size={20} className="text-amber-500 shrink-0" />
                   <span className="text-xs font-bold text-amber-800 leading-relaxed">
                     <b>Peringatan Modifikasi:</b> Mengubah instruksi prompt ini akan langsung berdampak pada gaya bahasa dan format output dari seluruh hasil ringkasan medis yang dihasilkan oleh AI untuk template ini.
                   </span>
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Compliance */}
      <div className="max-w-7xl mx-auto mt-10 bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 text-slate-500 shadow-sm">
         <CheckCircle size={24} className="text-emerald-500 shrink-0" />
         <span className="text-xs font-bold uppercase tracking-widest leading-relaxed">
           Konfigurasi template ini diaudit secara berkala sesuai standar SRS 7.6. Pastikan instruksi klinis telah divalidasi oleh Komite Medik RS UNS.
         </span>
      </div>
    </div>
  );
}