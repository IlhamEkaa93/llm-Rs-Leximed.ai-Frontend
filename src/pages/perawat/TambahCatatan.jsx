import React, { useState, useEffect } from 'react';
import { 
  FileEdit, Save, MessageSquare, Clock, 
  User, CheckCircle2, AlertCircle, Loader2, Database, Shield 
} from 'lucide-react';

export default function TambahCatatan() {
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('umum');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [patient, setPatient] = useState(null);
  const [nurse, setNurse] = useState(null);
  
  // Data histori lokal (disinkronkan dengan database di useEffect)
  const [history, setHistory] = useState([
    { time: '08:00', cat: 'Observasi', text: 'Tanda vital stabil, infus lancar 20 tpm.' },
    { time: '09:30', cat: 'Keluhan', text: 'Pasien menolak makan pagi, merasa mual.' }
  ]);

  // 1. Sinkronisasi Data Pasien & Perawat dari LocalStorage
  useEffect(() => {
    const savedPatient = localStorage.getItem('active_patient');
    const savedUser = localStorage.getItem('user');
    
    if (savedPatient) setPatient(JSON.parse(savedPatient));
    if (savedUser) setNurse(JSON.parse(savedUser));
  }, []);

  // 2. Fungsi Simpan Catatan ke Laravel (PostgreSQL)
  const handleSaveNote = async () => {
    if (!note.trim()) return alert("Catatan tidak boleh kosong.");
    if (!patient) return alert("Konteks pasien tidak ditemukan. Silakan cari pasien ulang.");

    setIsSaving(true);
    try {
      // Mengirim catatan ke Backend Laravel via API
      const response = await fetch("http://localhost:8000/api/clinical-data", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ 
          patient_id: patient.norm, 
          raw_content: `[KATEGORI: ${category.toUpperCase()}] ${note}`,
          source: "manual" // Validasi source di backend Laravel[cite: 1]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Gagal menyimpan ke server Laravel.");
      }

      // Update Tampilan Histori Lokal[cite: 1]
      const newEntry = {
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        cat: category.charAt(0).toUpperCase() + category.slice(1),
        text: note
      };
      
      setHistory([newEntry, ...history]);
      setSaveSuccess(true);
      setNote(''); // Reset textarea
      
      setTimeout(() => setSaveSuccess(false), 3000); // Reset status sukses

    } catch (err) {
      alert("Error Database: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-left transition-all duration-500">
      
      {/* Patient Context Header */}
      <div className="max-w-6xl mx-auto bg-white border border-slate-200 p-5 rounded-[24px] mb-8 flex flex-col md:flex-row justify-between items-center shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
            <User size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Pasien Sedang Dirawat</p>
            <h2 className="text-xl font-black text-slate-800 mt-1">
              {patient?.name || 'Memuat...'} <span className="text-slate-400 font-medium">({patient?.norm})</span>
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-black rounded-xl border border-emerald-100 flex items-center gap-2">
            <Database size={14} /> PostgreSQL Active
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Editor Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-10 overflow-hidden relative">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                  <FileEdit className="text-blue-600" size={28} /> Tambah Catatan Klinis
                </h1>
                <p className="text-slate-500 text-sm font-medium mt-1 italic">Data disinkronisasi ke sistem DARSI secara real-time.</p>
              </div>
              {saveSuccess && (
                <div className="bg-emerald-500 text-white px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 animate-bounce">
                  <CheckCircle2 size={16} /> Tersimpan
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Kategori:</span>
                <div className="flex gap-2 flex-wrap">
                  {['umum', 'instruksi', 'keluhan', 'tindakan'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        category === cat 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <textarea 
                className="w-full h-72 p-8 bg-slate-50 border-2 border-slate-100 rounded-[28px] text-slate-800 text-lg leading-relaxed focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none font-medium placeholder:text-slate-300"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tulis observasi atau tindakan medis di sini..."
              />

              <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4">
                <div className="flex items-center gap-4 text-slate-400">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter">
                    <User size={14} /> {nurse?.name}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter">
                    <Clock size={14} /> {new Date().toLocaleTimeString()} WIB
                  </div>
                </div>
                <button 
                  onClick={handleSaveNote}
                  disabled={isSaving}
                  className={`w-full md:w-auto flex items-center justify-center gap-3 px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl ${
                    isSaving 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-[#0f172a] text-white hover:bg-blue-600 shadow-blue-900/20 active:scale-95'
                  }`}
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {isSaving ? "Sinkronisasi..." : "Simpan Catatan"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Section: Local History[cite: 3] */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
              <Shield size={20} className="text-blue-600" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Histori Shift</h3>
            </div>
            
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
              {history.map((item, idx) => (
                <div key={idx} className="p-5 bg-slate-50 rounded-2xl border-l-4 border-blue-500 hover:bg-blue-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{item.cat}</span>
                    <span className="text-[10px] font-bold text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
              <AlertCircle size={20} className="text-blue-600 shrink-0" />
              <p className="text-[10px] text-blue-800 font-bold leading-relaxed uppercase tracking-wider">
                Catatan ini akan dirangkum otomatis oleh AI Llama 3 saat proses serah terima (handover) dilakukan.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}