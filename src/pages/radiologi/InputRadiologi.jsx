import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ScanLine, UploadCloud, Calendar, Layers, 
  Activity, Save, ArrowRight, User, 
  FileText, ClipboardEdit, Microscope, Info,
  Zap, Database, Image as ImageIcon, 
  BrainCircuit // <-- BrainCircuit ditambahkan di sini
} from 'lucide-react';

export default function InputRadiologi() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  
  const [formData, setFormData] = useState({
    jenis_pemeriksaan: '',
    tanggal: new Date().toISOString().split('T')[0],
    temuan_mentah: ''
  });

  useEffect(() => {
    const activePatient = localStorage.getItem('active_radiology_patient');
    if (!activePatient) return navigate('/dashboard-radiologi');
    setPatient(JSON.parse(activePatient));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (!formData.jenis_pemeriksaan || !formData.temuan_mentah) {
      return alert("Jenis pemeriksaan dan temuan mentah wajib diisi!");
    }
    localStorage.setItem('radiology_draft', JSON.stringify(formData));
    navigate('/radiologi/analisis');
  };

  const autoFill = () => {
    setFormData({
      jenis_pemeriksaan: 'X-RAY_THORAX',
      tanggal: new Date().toISOString().split('T')[0],
      temuan_mentah: 'Tampak perselubungan homogen di hemithorax kanan bawah yang menutupi sinus kostofrenikus. Cor membesar, CTR 60%. Tulang-tulang intak. Trakea tidak deviasi.'
    });
  };

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-left pb-24 text-slate-900 antialiased">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
          className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="flex items-center gap-6 w-full">
             <div className="p-5 bg-cyan-600 text-white rounded-2xl shadow-xl shadow-cyan-200 shrink-0">
                <ScanLine size={32} />
             </div>
             <div className="text-left leading-none">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase italic text-slate-900">Input Radiologi</h1>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-3">Pipeline Diagnostik Digital RS UNS</p>
             </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 px-7 py-4 rounded-[2rem] border border-slate-200 shrink-0 w-full md:w-auto hover:bg-cyan-50 transition-all cursor-pointer group" onClick={autoFill}>
              <div className="text-right leading-tight">
                <p className="text-[10px] text-cyan-600 font-black uppercase tracking-widest mb-1">Subject Profile</p>
                <p className="font-black text-slate-800 text-lg tracking-tight group-hover:text-cyan-700 transition-colors leading-none">{patient.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">RM: {patient.norm}</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm group-hover:scale-110 transition-transform"><User size={24} className="text-cyan-600" /></div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* MAIN FORM AREA (KIRI) */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-8 space-y-8 text-left">
            <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 space-y-10 relative overflow-hidden">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-4 text-left">
                  <label className="text-[10px] font-black text-cyan-700 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                    <Layers size={16} className="text-cyan-500"/> Modalitas Pemeriksaan
                  </label>
                  <select name="jenis_pemeriksaan" value={formData.jenis_pemeriksaan} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-bold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white transition-all shadow-inner cursor-pointer appearance-none">
                    <option value="">-- Pilih Jenis Pemeriksaan --</option>
                    <option value="X-RAY_THORAX">X-Ray Thorax AP/PA</option>
                    <option value="CT_SCAN_KEPALA">CT Scan Kepala</option>
                    <option value="MRI_SPINE">MRI Cervical Spine</option>
                    <option value="USG_ABDOMEN">USG Abdomen</option>
                  </select>
                </div>
                <div className="space-y-4 text-left">
                  <label className="text-[10px] font-black text-cyan-700 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                    <Calendar size={16} className="text-cyan-500"/> Tanggal Pemeriksaan
                  </label>
                  <input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-bold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white transition-all shadow-inner" />
                </div>
              </div>

              <div className="space-y-4 relative z-10 text-left">
                <label className="text-[10px] font-black text-cyan-700 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                  <ImageIcon size={16} className="text-cyan-500"/> Image Acquisition (PACS/DICOM)
                </label>
                <div className="w-full h-52 bg-cyan-50/20 border-2 border-dashed border-cyan-200 rounded-[2.5rem] flex flex-col items-center justify-center text-cyan-600 hover:bg-cyan-50 hover:border-cyan-400 transition-all cursor-pointer group relative overflow-hidden">
                  <div className="p-5 bg-white rounded-full shadow-md mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud size={32} />
                  </div>
                  <p className="font-black text-xs uppercase tracking-widest leading-none text-center px-4">Sinkronisasi PACS Server</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mt-3 leading-none">Drop DICOM image or click to browse</p>
                </div>
              </div>

              <div className="space-y-4 relative z-10 text-left">
                <label className="text-[10px] font-black text-cyan-700 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                  <ClipboardEdit size={16} className="text-cyan-500"/> Clinical Observations / Temuan Mentah
                </label>
                <textarea 
                  name="temuan_mentah" value={formData.temuan_mentah} onChange={handleChange} 
                  rows="8" placeholder="Tuliskan temuan radiologi mentah di sini. AI Llama 3 akan memprosesnya..." 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-8 rounded-[3rem] font-medium text-lg text-slate-700 resize-none outline-none focus:border-cyan-500 focus:bg-white transition-all shadow-inner leading-relaxed"
                />
              </div>

            </div>
          </motion.div>

          {/* ACTION SIDEBAR (KANAN) */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 space-y-6 text-left">
            <div className="bg-[#0f172a] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden border-[6px] border-white group">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-cyan-600/20 rounded-full blur-3xl group-hover:bg-cyan-600/30 transition-all duration-700 pointer-events-none" />
              
              <div className="relative z-10 space-y-10">
                <div className="w-16 h-16 bg-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-900/50 group-hover:rotate-6 transition-transform">
                  <Zap size={32} className="fill-current text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-cyan-400 text-left">Diagnostic<br/>Engine</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed mt-5 text-left">
                    Data temuan mentah akan diproses menggunakan <span className="text-white">Llama 3 Neural Engine</span> untuk ekstraksi kesan klinis secara otomatis.
                  </p>
                </div>
                
                <button 
                  onClick={handleNext}
                  className="w-full py-7 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-cyan-900/40 transition-all active:scale-95 flex items-center justify-center gap-4 group/btn"
                >
                  <BrainCircuit size={20} className="shrink-0" /> 
                  <span className="whitespace-nowrap">Jalankan Analisis AI</span>
                  <ArrowRight size={20} className="shrink-0 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 text-left">
                <div className="flex items-center gap-3 text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em]">
                  <Database size={18} className="text-cyan-500" />
                  <span>Cloud Integration</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight">
                  Sinkronisasi database PostgreSQL aktif. Laporan yang disimpan akan dicatat dalam Audit Trail diagnostik secara real-time.
                </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}