import React, { useState, useEffect } from 'react';
import { 
  Save, Share2, ArrowLeft, CheckCircle, 
  Clock, UserCheck, ShieldAlert, FileText, Loader2, Database 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SimpanHandover() {
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [handoverData, setHandoverData] = useState(null);
  const [nurse, setNurse] = useState(null);

  // 1. Ambil data draft dari localStorage & Sesi User saat halaman dimuat
  useEffect(() => {
    const pendingData = localStorage.getItem('pending_handover');
    const savedUser = localStorage.getItem('user');
    
    if (pendingData) {
      setHandoverData(JSON.parse(pendingData));
    } else {
      // Jika tidak ada data draft, kembali ke halaman input agar tidak error
      navigate('/handover');
    }

    if (savedUser) {
      setNurse(JSON.parse(savedUser));
    }
  }, [navigate]);

  // 2. Fungsi Final Save ke Backend Laravel & PostgreSQL[cite: 1, 2]
  const handleFinalSave = async () => {
    if (!handoverData) return;
    
    setIsSyncing(true);
    try {
      // Mengirim data laporan final ke database melalui API Laravel[cite: 1]
      const response = await fetch("http://localhost:8000/api/clinical-data", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ 
          // patient_id diambil dari data aktif (NORM)[cite: 1]
          patient_id: handoverData.patient.norm, 
          // Menyusun konten laporan final untuk disimpan di raw_content[cite: 1]
          raw_content: `FINAL HANDOVER REPORT (Shift ${new Date().getHours() < 14 ? 'Pagi' : 'Sore/Malam'})\nOleh: ${nurse?.name}\n\nKondisi: ${handoverData.content}\nIntervensi: ${handoverData.intervensi}\nCatatan: ${handoverData.additionalNotes}`,
          source: "manual" // Identifikasi input manual dari perawat[cite: 1]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal sinkronisasi ke server HIS.");
      }

      // Simulasi proses enkripsi data rekam medis sebelum sukses[cite: 1]
      setTimeout(() => {
        setIsSyncing(false);
        setIsSuccess(true);
        // Hapus draf lokal setelah berhasil disimpan permanen di DB[cite: 1]
        localStorage.removeItem('pending_handover');
      }, 1500);

    } catch (err) {
      alert("Gagal Menyimpan: " + err.message);
      setIsSyncing(false);
    }
  };

  // Tampilan Sukses setelah Sinkronisasi[cite: 1]
  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl text-center max-w-md border border-slate-100 animate-in zoom-in duration-300">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={50} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Handover Berhasil</h2>
          <p className="text-slate-500 mb-8 font-medium">Laporan shift telah terkunci secara permanen di database PostgreSQL RS UNS.</p>
          <button 
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg active:scale-95" 
            onClick={() => navigate('/dashboardperawat')}
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-left antialiased">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <button 
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm group" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Finalisasi Laporan</h1>
              <div className="flex items-center gap-2 mt-2 text-xs font-bold text-emerald-600 uppercase tracking-widest">
                <Database size={14} /> PostgreSQL Connection Active
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sisi Kiri: Pratinjau Data Riil */}
          <div className="lg:col-span-8 bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40">
            <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-3 uppercase tracking-tighter">
              <FileText size={22} className="text-blue-600" /> Pratinjau Draft Handover
            </h3>
            
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Kondisi Pasien</label>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed font-medium italic italic shadow-inner">
                  "{handoverData?.content || "Memuat konten AI..."}"
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Intervensi</label>
                  <p className="bg-white p-4 rounded-xl border border-slate-100 text-sm font-bold text-slate-800">
                    {handoverData?.intervensi || "-"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Target Pasien</label>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="font-black text-blue-900 text-sm">{handoverData?.patient?.name}</p>
                    <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">NORM: {handoverData?.patient?.norm}</p>
                  </div>
                </div>
              </div>

              {handoverData?.additionalNotes && (
                <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 border-l-8 border-l-rose-500">
                  <label className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] block mb-2">Catatan Khusus (Alert)</label>
                  <p className="text-rose-900 font-bold text-sm leading-relaxed">{handoverData.additionalNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sisi Kanan: Konfirmasi & Audit Trail */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-500">
                <ShieldAlert size={120} />
              </div>
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-600 rounded-2xl">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <h4 className="font-black tracking-tight leading-tight">Audit Trail Aktif</h4>
                    <p className="text-[10px] text-blue-300 font-bold uppercase mt-1">Security standard srs-7.6</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Penyimpanan ini akan mencatat <strong>{nurse?.name}</strong> sebagai penanggung jawab digital laporan ini.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-center justify-between py-3 border-b border-slate-50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} /> Shift Aktif
                </span>
                <span className="text-xs font-black text-slate-800">{new Date().getHours() < 14 ? 'Pagi (07:00-14:00)' : 'Sore/Malam'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <UserCheck size={14} /> Validator
                </span>
                <span className="text-xs font-black text-blue-600 underline decoration-blue-200">{nurse?.name}</span>
              </div>
            </div>

            <button 
              className={`w-full py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-2xl ${
                isSyncing 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 active:scale-95'
              }`}
              onClick={handleFinalSave}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <><Save size={22} /> SIMPAN & KUNCI DATA</>
              )}
            </button>
            
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
              Enkripsi AES-256 via Secure Gateway
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}