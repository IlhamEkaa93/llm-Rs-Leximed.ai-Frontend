import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileEdit, Activity, Thermometer, Heart, 
  Wind, ClipboardList, Save, ArrowRight, 
  User, CheckCircle2, History, HelpCircle, ChevronRight
} from 'lucide-react';

export default function TambahCatatan() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);

  // ── STATE: INTERACTIVE WORKFLOW TOUR PANDUAN JURI ──
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // --- States Sesuai Ketentuan (Poin 12) ---
  const [formData, setFormData] = useState({
    kondisi_umum: '',
    tindakan: '',
    observasi: '',
    keluhan: '',
    shift: 'PAGI',
    // Vital Signs
    td_sistolik: '',
    td_diastolik: '',
    nadi: '',
    suhu: '',
    spo2: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  const tourSteps = [
    {
      title: "Alur Kerja: Pencatatan Klinis Manual",
      desc: "Halaman ini digunakan untuk mendokumentasikan hasil pemeriksaan fisik, keluhan subjektif, dan intervensi keperawatan mandiri secara komprehensif sebelum diolah oleh kecerdasan artifisial.",
      icon: <FileEdit className="text-blue-400" size={24} />,
      actionLabel: "Mulai Panduan"
    },
    {
      title: "Langkah 1: Sinkronisasi Waktu & Keluhan Utama",
      desc: "Periksa kembali shift penugasan Anda dan ketikkan keluhan utama yang dirasakan pasien (misal: sesak napas akut) untuk mempermudah parameter indexing data klinis.",
      icon: <History className="text-amber-400" size={24} />,
      actionLabel: "Pahami Langkah 1"
    },
    {
      title: "Langkah 2: Dokumentasi Narasi Keperawatan",
      desc: "Isi kolom 'Kondisi Pasien' dan 'Tindakan' secara naratif. Data tekstual mentah inilah yang nantinya akan diekstrak oleh Neural Engine Llama 3.3 menjadi format handover medis formal.",
      icon: <ClipboardList className="text-purple-400" size={24} />,
      actionLabel: "Pahami Langkah 2"
    },
    {
      title: "Langkah 3: Validasi Vital Signs & AI Processing",
      desc: "Masukkan angka indikator vital (Sistolik, Diastolik, Nadi, Suhu, SpO2). Menekan tombol 'Simpan & Ringkas AI' akan menyimpan draf ke database dan langsung memicu pipeline pemrosesan ringkasan otomatis.",
      icon: <Heart className="text-rose-400" size={24} />,
      actionLabel: "Selesai & Eksekusi"
    }
  ];

  useEffect(() => {
    const savedPatient = localStorage.getItem('active_patient');
    if (!savedPatient) {
      navigate('/dashboard-perawat');
    } else {
      setPatient(JSON.parse(savedPatient));
    }

    // DETEKSI TOUR OTOMATIS KHUSUS DEMO DEWAN JURI
    const isTourCompleted = sessionStorage.getItem('leximed_add_note_tour_completed');
    if (!isTourCompleted) {
      setShowTour(true);
    }
  }, [navigate]);

  const handleNextTourStep = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(prev => prev + 1);
    } else {
      sessionStorage.setItem('leximed_add_note_tour_completed', 'true');
      setShowTour(false);
    }
  };

  const handleCloseTour = () => {
    sessionStorage.setItem('leximed_add_note_tour_completed', 'true');
    setShowTour(false);
  };

  const toggleTourRestart = () => {
    sessionStorage.removeItem('leximed_add_note_tour_completed');
    setTourStep(0);
    setShowTour(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAndNext = async () => {
    if (!formData.kondisi_umum || !formData.keluhan) {
      return alert("Kondisi umum dan Keluhan wajib diisi.");
    }

    setIsSaving(true);

    try {
      // PROSES CRUD: Kirim ke Backend
      const response = await fetch("https://lexi-med-ai-llm-rs-back-end.vercel.app/api/clinical-data", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ 
          patient_id: patient.norm || patient.no_rm,
          raw_content: JSON.stringify(formData), // Kirim data objek sebagai JSON string
          source: "nurse_note_manual",
          status: "draft"
        })
      });

      if (response.ok) {
        // Simpan data catatan ini ke localStorage agar bisa diolah LLM di halaman Handover
        localStorage.setItem('last_nurse_note', JSON.stringify(formData));
        
        // Pindah ke Poin 13 (Ringkasan Shift AI)
        navigate('/handover'); 
      } else {
        throw new Error("Gagal menyimpan ke database.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-[#fcfcfd] p-4 md:p-10 font-sans text-left pb-24 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* FLOATING REPOSITION TOMBOL PEMANDU JURI */}
        <div className="w-full flex justify-end">
          <button 
            type="button"
            onClick={toggleTourRestart}
            className="bg-white border border-slate-200 text-blue-600 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm active:scale-95 hover:bg-slate-50"
          >
            <HelpCircle size={15} /> Alur Pemandu Catatan
          </button>
        </div>

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
          className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="flex items-center gap-5 w-full">
             <div className="p-4 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-100">
                <FileEdit size={32} />
             </div>
             <div>
                <h1 className="text-3xl font-black tracking-tighter uppercase italic">Catatan Keperawatan</h1>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Dokumentasi Asuhan Manual</p>
             </div>
          </div>
          <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-200 shrink-0 flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] text-blue-600 font-black uppercase">Subjek Pasien</p>
                <p className="font-black text-slate-800 tracking-tight">{patient.name}</p>
              </div>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm"><User size={20} className="text-slate-400" /></div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FORM KIRI: DATA KLINIS */}
          <div className="lg:col-span-2 space-y-6 text-left">
            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-100 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><History size={12}/> Shift</label>
                  <select name="shift" value={formData.shift} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold">
                    <option value="PAGI">PAGI (07.00 - 14.00)</option>
                    <option value="SORE">SORE (14.00 - 21.00)</option>
                    <option value="MALAM">MALAM (21.00 - 07.00)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Activity size={12}/> Keluhan Utama</label>
                  <input name="keluhan" value={formData.keluhan} onChange={handleChange} placeholder="Contoh: Sesak napas, Nyeri ulu hati" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><ClipboardList size={12}/> Kondisi Pasien & Observasi</label>
                <textarea name="kondisi_umum" value={formData.kondisi_umum} onChange={handleChange} rows="4" placeholder="Tuliskan kondisi umum pasien secara mendetail..." className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl font-medium resize-none outline-none focus:border-blue-500 transition-all"></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><CheckCircle2 size={12}/> Tindakan / Intervensi</label>
                <textarea name="tindakan" value={formData.tindakan} onChange={handleChange} rows="3" placeholder="Tindakan yang sudah diberikan..." className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl font-medium resize-none outline-none focus:border-blue-500 transition-all"></textarea>
              </div>

            </div>
          </div>

          {/* FORM KANAN: VITAL SIGNS */}
          <div className="space-y-6 text-left">
            <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl space-y-8">
              <h3 className="text-xl font-black italic tracking-tighter flex items-center gap-3">
                <Heart size={24} className="text-rose-500" /> Vital Signs
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sistolik</p>
                    <input type="number" name="td_sistolik" value={formData.td_sistolik} onChange={handleChange} placeholder="120" className="w-full bg-white/10 border border-white/10 p-4 rounded-2xl font-bold text-center text-xl outline-none focus:bg-white/20 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Diastolik</p>
                    <input type="number" name="td_diastolik" value={formData.td_diastolik} onChange={handleChange} placeholder="80" className="w-full bg-white/10 border border-white/10 p-4 rounded-2xl font-bold text-center text-xl outline-none focus:bg-white/20 transition-all" />
                  </div>
                </div>

                <div className="space-y-2 text-left">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nadi (BPM)</p>
                    <div className="relative">
                      <input type="number" name="nadi" value={formData.nadi} onChange={handleChange} className="w-full bg-white/10 border border-white/10 p-4 rounded-2xl font-bold text-center text-xl outline-none" />
                      <Heart className="absolute right-4 top-4 text-rose-500/50" size={20}/>
                    </div>
                </div>

                <div className="space-y-2 text-left">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Suhu (°C)</p>
                    <div className="relative">
                      <input type="number" name="suhu" value={formData.suhu} onChange={handleChange} className="w-full bg-white/10 border border-white/10 p-4 rounded-2xl font-bold text-center text-xl outline-none" />
                      <Thermometer className="absolute right-4 top-4 text-amber-500/50" size={20}/>
                    </div>
                </div>

                <div className="space-y-2 text-left">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SpO2 (%)</p>
                    <div className="relative">
                      <input type="number" name="spo2" value={formData.spo2} onChange={handleChange} className="w-full bg-white/10 border border-white/10 p-4 rounded-2xl font-bold text-center text-xl outline-none" />
                      <Wind className="absolute right-4 top-4 text-blue-400/50" size={20}/>
                    </div>
                </div>
              </div>

              <button 
                onClick={handleSaveAndNext}
                disabled={isSaving}
                className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-900 transition-all flex items-center justify-center gap-3"
              >
                {isSaving ? "Menyimpan..." : <><Save size={18} /> Simpan & Ringkas AI</>}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MULTI-PAGE GUIDED TOUR DIALOG FOR JUDGES ── */}
      <AnimatePresence>
          {showTour && (
              <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                  <motion.div 
                      initial={{ scale: 0.95, y: 20 }} 
                      animate={{ scale: 1, y: 0 }} 
                      exit={{ scale: 0.95, y: 20 }} 
                      className="bg-[#0f172a] border border-white/10 w-full max-w-md p-6 md:p-8 rounded-[2rem] shadow-2xl relative text-left space-y-6 text-white"
                  >
                      <div className="flex gap-1.5">
                          {tourSteps.map((_, idx) => (
                              <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === tourStep ? 'w-8 bg-blue-500' : 'w-2 bg-slate-700'}`}/>
                          ))}
                      </div>
                      
                      <div className="space-y-3">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
                                  {tourSteps[tourStep].icon}
                              </div>
                              <h3 className="text-base font-black uppercase tracking-tight italic text-white">
                                  {tourSteps[tourStep].title}
                              </h3>
                          </div>
                          <p className="text-slate-400 text-sm font-medium leading-relaxed">
                              {tourSteps[tourStep].desc}
                          </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-white/5 gap-4">
                          <button 
                              onClick={handleCloseTour} 
                              className="text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider"
                          >
                              Keluar Tur
                          </button>
                          <button 
                              onClick={handleNextTourStep} 
                              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 shadow-lg shadow-blue-900/40 transition-all animate-pulse"
                          >
                              {tourSteps[tourStep].actionLabel} <ChevronRight size={14} />
                          </button>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

    </div>
  );
}