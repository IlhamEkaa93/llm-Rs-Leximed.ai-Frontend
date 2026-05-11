import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ScanLine, UploadCloud, Calendar, Layers, 
  User, ClipboardEdit, 
  Zap, Database, Image as ImageIcon, 
  BrainCircuit, ArrowRight, X
} from 'lucide-react';

export default function InputRadiologi() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  
  // State untuk menyimpan URL gambar yang diunggah (Hanya untuk UI/Visual)
  const [previewImage, setPreviewImage] = useState(null);
  
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

  // Handler untuk mengubah gambar inputan file menjadi URL agar bisa ditampilkan
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation(); // Mencegah klik menyebar ke kotak input file
    setPreviewImage(null);
  };

  const handleNext = () => {
    if (!formData.jenis_pemeriksaan || !formData.temuan_mentah) {
      return alert("Jenis pemeriksaan dan temuan mentah wajib diisi!");
    }
    
    // Simpan data teks ke localStorage (Gambar sengaja tidak disimpan karena fokus ke AI teks)
    localStorage.setItem('radiology_draft', JSON.stringify(formData));
    
    // FIX: Memperbaiki path navigasi agar sesuai dengan struktur React Router kamu
    navigate('/analisis-radiologi');
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
    <div className="min-h-screen bg-[#f4f7f9] p-4 md:p-8 font-sans text-left pb-24 text-slate-900 antialiased overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* HEADER SECTION */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
          className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 w-full text-center sm:text-left">
             <div className="p-4 md:p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-200 shrink-0">
                <ScanLine size={32} />
             </div>
             <div className="leading-none">
                <h1 className="text-2xl md:text-4xl font-black tracking-tight uppercase italic text-slate-900">Input Radiologi</h1>
                <p className="text-emerald-600 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.3em] mt-2 md:mt-3">Pipeline Diagnostik Digital LexiMed.ai</p>
             </div>
          </div>

          {/* Patient Card (Click to AutoFill) */}
          <div 
            onClick={autoFill}
            title="Klik untuk Auto-Fill Data (Demo)"
            className="flex items-center justify-between sm:justify-start gap-4 bg-slate-50 px-5 md:px-7 py-4 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 shrink-0 w-full lg:w-auto hover:bg-emerald-50 hover:border-emerald-200 transition-all cursor-pointer group shadow-sm" 
          >
              <div className="text-left sm:text-right leading-tight">
                <p className="text-[9px] md:text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1 flex items-center sm:justify-end gap-1">
                  Subject Profile <Zap size={10} className="hidden sm:block fill-emerald-600" />
                </p>
                <p className="font-black text-slate-800 text-base md:text-lg tracking-tight group-hover:text-emerald-700 transition-colors leading-none line-clamp-1">{patient.name}</p>
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mt-1 md:mt-1.5">RM: {patient.norm || patient.no_rm}</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                <User size={24} className="text-emerald-600" />
              </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start">
          
          {/* MAIN FORM AREA (KIRI) */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-8 space-y-8 text-left">
            <div className="bg-white p-6 sm:p-10 md:p-14 rounded-[2rem] md:rounded-[3.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 space-y-8 md:space-y-10 relative overflow-hidden">
              
              {/* Background Accent */}
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none -scale-x-100"><ScanLine size={300} /></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10">
                <div className="space-y-3 text-left">
                  <label className="text-[9px] md:text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                    <Layers size={16} className="text-emerald-500"/> Modalitas Pemeriksaan
                  </label>
                  <div className="relative">
                    <select name="jenis_pemeriksaan" value={formData.jenis_pemeriksaan} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 p-4 md:p-5 rounded-2xl font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 focus:bg-white transition-all shadow-inner cursor-pointer appearance-none text-sm md:text-base">
                      <option value="">-- Pilih Jenis Pemeriksaan --</option>
                      <option value="X-RAY_THORAX">X-Ray Thorax AP/PA</option>
                      <option value="CT_SCAN_KEPALA">CT Scan Kepala</option>
                      <option value="MRI_SPINE">MRI Cervical Spine</option>
                      <option value="USG_ABDOMEN">USG Abdomen</option>
                    </select>
                    {/* Custom Arrow for Select */}
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L7 8L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <label className="text-[9px] md:text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                    <Calendar size={16} className="text-emerald-500"/> Tanggal Pemeriksaan
                  </label>
                  <input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 p-4 md:p-5 rounded-2xl font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 focus:bg-white transition-all shadow-inner text-sm md:text-base cursor-text" />
                </div>
              </div>

              {/* AREA UPLOAD GAMBAR */}
              <div className="space-y-3 relative z-10 text-left">
                <label className="text-[9px] md:text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                  <ImageIcon size={16} className="text-emerald-500"/> Image Acquisition (PACS/DICOM)
                </label>
                
                {/* File Input Wrapper */}
                <div className="relative w-full h-40 md:h-52 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border-2 border-dashed border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50 hover:border-emerald-400 transition-all group">
                  
                  {/* Input File asli disembunyikan tapi penuhi kotak */}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    title="Klik atau Tarik gambar ke sini"
                  />

                  {/* Tampilan Visual (Preview vs Placeholder) */}
                  <AnimatePresence mode="wait">
                    {previewImage ? (
                      <motion.div 
                        key="image"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 w-full h-full"
                      >
                        <img src={previewImage} alt="Preview DICOM" className="w-full h-full object-contain bg-slate-900/5 p-2" />
                        
                        {/* Tombol Hapus Gambar (z-30 agar bisa diklik di atas input file) */}
                        <button 
                          onClick={handleRemoveImage}
                          className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors z-30"
                          title="Hapus Gambar"
                        >
                          <X size={16} />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="placeholder"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-emerald-600 pointer-events-none"
                      >
                        <div className="p-4 md:p-5 bg-white rounded-full shadow-md mb-3 md:mb-4 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                          <UploadCloud size={28} className="md:w-8 md:h-8" />
                        </div>
                        <p className="font-black text-[10px] md:text-xs uppercase tracking-widest leading-none text-center px-4">Sinkronisasi PACS Server</p>
                        <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-50 mt-2 md:mt-3 leading-none text-center px-4">Click to browse or drop image</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-3 relative z-10 text-left">
                <label className="text-[9px] md:text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                  <ClipboardEdit size={16} className="text-emerald-500"/> Clinical Observations / Temuan Mentah
                </label>
                <textarea 
                  name="temuan_mentah" value={formData.temuan_mentah} onChange={handleChange} 
                  rows="6" placeholder="Tuliskan temuan radiologi mentah di sini. AI Llama 3 akan memprosesnya..." 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] font-medium text-base md:text-lg text-slate-700 resize-none outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 focus:bg-white transition-all shadow-inner leading-relaxed"
                />
              </div>

            </div>
          </motion.div>

          {/* ACTION SIDEBAR (KANAN) */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-4 space-y-6 text-left">
            <div className="bg-[#0f172a] p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden border-4 md:border-[6px] border-white group">
              <div className="absolute -top-10 -right-10 w-40 md:w-48 h-40 md:h-48 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all duration-700 pointer-events-none" />
              
              <div className="relative z-10 space-y-8 md:space-y-10">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/50 group-hover:rotate-6 transition-transform">
                  <Zap size={28} className="fill-current text-white md:w-8 md:h-8" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-none text-emerald-400 text-left">LexiMed<br/>Diagnostic AI</h3>
                  <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-relaxed mt-4 md:mt-5 text-left">
                    Data temuan mentah akan diproses menggunakan <span className="text-white">Neural Engine (Llama 3)</span> untuk ekstraksi kesan klinis secara otomatis.
                  </p>
                </div>
                
                <button 
                  onClick={handleNext}
                  className="w-full py-5 md:py-7 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-[10px] md:text-xs shadow-xl shadow-emerald-900/40 transition-all active:scale-95 flex items-center justify-center gap-3 md:gap-4 group/btn"
                >
                  <BrainCircuit size={18} className="shrink-0 md:w-5 md:h-5" /> 
                  <span className="whitespace-nowrap">Jalankan Analisis</span>
                  <ArrowRight size={18} className="shrink-0 group-hover/btn:translate-x-1 transition-transform md:w-5 md:h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4 md:space-y-5 text-left">
                <div className="flex items-center gap-3 text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
                  <Database size={16} className="text-emerald-500 md:w-4 md:h-4" />
                  <span>Cloud Integration</span>
                </div>
                <p className="text-[9px] md:text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight">
                  Sinkronisasi database aktif. Laporan yang disimpan akan dicatat dalam Audit Trail diagnostik secara real-time.
                </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}