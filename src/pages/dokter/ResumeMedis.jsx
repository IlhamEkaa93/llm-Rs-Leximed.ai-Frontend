import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Printer, ShieldCheck, 
  Zap, RefreshCw, Loader2, ArrowLeft,
  CheckCircle2, Award, Fingerprint
} from 'lucide-react';

export default function ResumeMedis() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [patient, setPatient] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isReady, setIsReady] = useState(false); // State baru untuk memastikan data siap

  useEffect(() => {
    const savedPatient = localStorage.getItem('active_patient');
    if (!savedPatient) {
      navigate('/dashboard');
    } else {
      try {
        const data = JSON.parse(savedPatient);
        setPatient(data);
        fetchResumeFromLaravel(data.norm);
        setIsReady(true); // Data pasien berhasil dimuat
      } catch (e) {
        console.error("Gagal parse data pasien:", e);
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  const fetchResumeFromLaravel = async (norm) => {
    if (!norm) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/clinical-data/${norm}`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`,
          "Accept": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.ai_summary) {
          setResumeData({
            riwayat: data.ai_summary,
            instruksi: "Kontrol poli minggu depan. Obat dilanjutkan sesuai resep pulang."
          });
        }
      }
    } catch (e) {
      console.error("Gagal sinkronisasi rekam medis:", e);
    } finally {
      setLoading(false);
    }
  };

  // PERBAIKAN: Fungsi cetak sekarang menggunakan optional chaining ganda
  const handlePrint = () => {
    if (!patient) return alert("Data pasien belum dimuat sempurna.");

    const printWindow = window.open('', '_blank');
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Resume Medis - ${patient?.name || 'Pasien'}</title>
          <style>
            body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.5; padding: 40px; }
            .kop { display: flex; align-items: center; border-bottom: 3px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
            .kop img { width: 80px; height: auto; margin-right: 20px; }
            .kop-text h1 { font-size: 18pt; margin: 0; }
            .kop-text p { font-size: 10pt; margin: 5px 0; }
            .doc-title { text-align: center; font-weight: bold; text-decoration: underline; margin: 20px 0; font-size: 14pt; }
            .info-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .info-table td { padding: 5px; font-size: 11pt; }
            .section-title { background: #f0f0f0; padding: 5px 10px; font-weight: bold; border-left: 5px solid #333; margin: 20px 0 10px 0; }
            .content { padding: 0 10px; font-size: 11pt; white-space: pre-wrap; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end; }
            .sign-area { text-align: center; min-width: 250px; }
          </style>
        </head>
        <body>
          <div class="kop">
            <img src="/LOGO-1.png" />
            <div class="kop-text">
              <h1>RUMAH SAKIT UNIVERSITAS SEBELAS MARET</h1>
              <p>Jl. Ahmad Yani No. 200, Kartasura, Sukoharjo | (0271) 6775000</p>
            </div>
          </div>
          <div class="doc-title">RINGKASAN PULANG (DISCHARGE SUMMARY)</div>
          <table class="info-table">
            <tr>
              <td width="20%">Nama Pasien</td><td width="30%">: <b>${patient?.name || '-'}</b></td>
              <td width="25%">Tanggal Cetak</td><td width="25%">: ${today}</td>
            </tr>
            <tr>
              <td>No. Rekam Medis</td><td>: <b>${patient?.norm || '-'}</b></td>
              <td>Jenis Kelamin</td><td>: ${patient?.gender || '-'}</td>
            </tr>
          </table>
          <div class="section-title">I. DIAGNOSIS AKHIR (ICD-10)</div>
          <div class="content"><b>Utama:</b> Pneumonia Bakterial (J18.9)<br><b>Sekunder:</b> Hipertensi Essential (I10)</div>
          <div class="section-title">II. RINGKASAN RIWAYAT MEDIS (ANALISIS AI)</div>
          <div class="content"><i>${resumeData ? resumeData.riwayat : '-'}</i></div>
          <div class="section-title">III. INSTRUKSI & TINDAK LANJUT</div>
          <div class="content">${resumeData ? resumeData.instruksi : '-'}</div>
          <div class="footer">
            <div style="font-size: 8pt; color: #999">Digitally Verified by DARSI System</div>
            <div class="sign-area">
              <p>Sukoharjo, ${today}</p>
              <p style="margin-bottom: 60px">Dokter Penanggung Jawab,</p>
              <p><b><u>dr. Ahmad Hidayat, Sp.PD</u></b></p>
              <p>NIP. 19820301202605</p>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleUpdateAI = async () => {
    if (!patient) return;
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/clinical-data", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          patient_id: patient.norm,
          raw_content: `Generate resume medis komprehensif untuk ${patient.name}`,
          source: "manual"
        })
      });
      if (!response.ok) throw new Error("Server Error");
      await fetchResumeFromLaravel(patient.norm);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (e) {
      alert(`Gagal: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // PERBAIKAN KRUSIAL: Guard clause utama untuk mencegah error properti null
  if (!isReady || !patient) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
          Menghubungkan ke DARSI Secure Gateway...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans overflow-x-hidden antialiased text-slate-900">
      
      {/* Toast Notifikasi */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div initial={{ y: -100 }} animate={{ y: 20 }} exit={{ y: -100 }} className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg font-bold flex items-center gap-2">
            <CheckCircle2 size={20} /> Sinkronisasi AI Berhasil!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigasi Kontrol */}
      <nav className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <button onClick={() => navigate(-1)} className="group flex items-center text-slate-500 hover:text-blue-600 font-bold transition-all self-start md:self-auto">
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali
        </button>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={handlePrint} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Printer size={18} /> Cetak
          </button>
          <button onClick={handleUpdateAI} disabled={loading} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg active:scale-95 disabled:opacity-50 transition-all">
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />} Update via AI
          </button>
        </div>
      </nav>

      {/* Preview Dokumen (Screen View) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 p-6 md:p-12 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none rotate-12">
            <FileText size={400} />
        </div>

        <header className="flex flex-col md:flex-row gap-6 border-b-2 border-slate-900 pb-6 mb-8 items-center text-center md:text-left">
          <img src="/LOGO-1.png" alt="Logo" className="w-20 h-20 object-contain" />
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">RUMAH SAKIT UNIVERSITAS SEBELAS MARET</h1>
            <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Jl. Ahmad Yani No. 200, Kartasura, Sukoharjo | (0271) 6775000</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10 text-left">
          <div className="space-y-4">
            <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Nama Pasien</span><p className="font-black text-slate-800 text-lg leading-none">{patient?.name}</p></div>
            <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">No. Rekam Medis</span><p className="font-mono font-bold text-blue-600 text-lg leading-none">{patient?.norm}</p></div>
          </div>
          <div className="md:text-right">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Tanggal Terbit Dokumen</span>
            <p className="font-black text-slate-800 text-lg leading-none">{new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
          </div>
        </div>

        <main className="space-y-8 text-left">
          <section>
            <h2 className="text-xs font-black bg-slate-50 p-2 rounded-lg border-l-4 border-slate-800 mb-4 uppercase tracking-tighter">I. Diagnosis Akhir (ICD-10)</h2>
            <div className="ml-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="text-[8px] font-black text-blue-500 uppercase">Utama</span><p className="text-sm font-bold text-slate-800">Pneumonia Bakterial (J18.9)</p></div>
                <div><span className="text-[8px] font-black text-slate-400 uppercase">Sekunder</span><p className="text-sm font-bold text-slate-700">Hipertensi Essential (I10)</p></div>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4 bg-blue-50 p-2 rounded-lg border-l-4 border-blue-600">
                <h2 className="text-xs font-black text-blue-900 uppercase">II. Ringkasan Riwayat Medis AI</h2>
                <Fingerprint size={14} className="text-blue-600 opacity-40" />
            </div>
            <div className="ml-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 text-slate-700 italic leading-relaxed whitespace-pre-wrap font-medium text-sm">
              {loading ? (
                <div className="flex items-center gap-2 py-4"><Loader2 className="animate-spin text-blue-600" size={16} /><span className="text-xs font-bold text-blue-400">Analysing Neural Records...</span></div>
              ) : (resumeData ? resumeData.riwayat : "Klik Update AI untuk men-generate ringkasan.")}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-black bg-slate-50 p-2 rounded-lg border-l-4 border-slate-800 mb-4 uppercase tracking-tighter">III. Instruksi & Tindak Lanjut</h2>
            <div className="ml-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <p className="text-sm font-bold text-slate-800">{resumeData ? resumeData.instruksi : "Menunggu instruksi dokter..."}</p>
            </div>
          </section>
        </main>

        <footer className="mt-16 flex flex-col md:flex-row justify-between items-end gap-10">
            <div className="flex flex-col items-center opacity-30">
               <ShieldCheck size={40} className="text-blue-600" />
               <span className="text-[8px] font-mono tracking-tighter uppercase mt-1">DARSI SECURE GATEWAY</span>
            </div>
            <div className="text-center min-w-[280px]">
              <p className="text-[10px] font-bold text-slate-500 mb-8 italic">Sukoharjo, {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter mb-2 leading-none">Dokter Penanggung Jawab Pelayanan</p>
              <div className="relative h-20 flex justify-center items-center">
                 <Award size={40} className="text-slate-50 absolute opacity-50" />
                 <div className="absolute opacity-30 grayscale"><img src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Kirsch%27s_Signature.png" width="120" alt="sign" /></div>
              </div>
              <p className="text-sm font-black text-slate-900 underline decoration-2 decoration-blue-600 uppercase tracking-tighter">dr. Ahmad Hidayat, Sp.PD</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">NIP. 19820301202605</p>
            </div>
        </footer>
      </motion.div>
    </div>
  );
}