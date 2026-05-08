import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Printer, ShieldCheck, 
  Zap, RefreshCw, Loader2, ArrowLeft,
  CheckCircle2, Award, Fingerprint, Pill, CheckSquare,
  Activity // Icon tambahan untuk Radiologi
} from 'lucide-react';

export default function ResumeMedis() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [patient, setPatient] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isReady, setIsReady] = useState(false); 

  const API_URL = "http://localhost:8000/api";
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    // 1. Mengambil data Dokter yang sedang Login
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }

    // 2. Mengambil data Pasien
    const savedPatient = localStorage.getItem('active_patient');
    if (!savedPatient) {
      navigate('/dashboard');
    } else {
      try {
        const data = JSON.parse(savedPatient);
        fetchPatientDetail(data.norm || data.no_rm, data);
      } catch (e) {
        console.error("Gagal parse data pasien:", e);
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  // Mengambil data spesifik pasien (untuk Status Perawatan)
  const fetchPatientDetail = async (norm, fallbackData) => {
    try {
      const res = await fetch(`${API_URL}/patients/${norm}`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      const result = await res.json();
      
      if (res.ok && result.data) {
        setPatient({
          ...result.data,
          norm: result.data.no_rm,
        });
      } else {
        setPatient(fallbackData);
      }
    } catch (e) {
      setPatient(fallbackData);
    } finally {
      fetchResumeFromLaravel(norm);
      setIsReady(true);
    }
  };

  // Logika Ekstraksi Obat Cerdas dari Teks AI Llama
  const extractMeds = (text) => {
    if (!text) return [];
    const keywords = ['mg', 'sirup', 'tablet', 'kapsul', 'injeksi', 'infus', 'ml', 'gram'];
    const clauses = text.split(/[.,]|\bserta\b/i);
    let meds = clauses
        .filter(s => keywords.some(kw => s.toLowerCase().includes(kw)))
        .map(s => {
            let clean = s.replace(/^(meliputi|dengan|pemberian|terapi|penggantian|penambahan)\s+/i, '').trim();
            return clean.charAt(0).toUpperCase() + clean.slice(1);
        })
        .filter(s => s.length > 5);
    
    if (meds.length === 0) return ["Obat dilanjutkan sesuai instruksi resep dokter"];
    return meds;
  };

  // Mengambil data AI Summary & Radiologi yang sudah terverifikasi
  const fetchResumeFromLaravel = async (norm) => {
    if (!norm) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/clinical-data/${norm}`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data) {
          setResumeData({
            riwayat: data.ai_summary || data.raw_content,
            obat: extractMeds(data.ai_summary || data.raw_content),
            radiologi: data.radiology_result || null, // Menarik data radiologi dari backend
            instruksi: "Kontrol poli dalam 1 minggu jika gejala tidak membaik. Istirahat cukup, jaga pola makan, dan hindari aktivitas fisik yang berat."
          });
        }
      }
    } catch (e) {
      console.error("Gagal sinkronisasi rekam medis:", e);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Cetak Resume Medis Lengkap (Diperbarui dengan Radiologi)
  const handlePrint = () => {
    if (!patient) return alert("Data pasien belum dimuat sempurna.");

    const printWindow = window.open('', '_blank');
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const medsHtml = resumeData?.obat?.map(o => `<li>${o}</li>`).join('') || '<li>Tidak ada terapi obat khusus</li>';
    const statusRawat = patient?.status_treatment || 'Rawat Jalan';
    
    // Fallback data dokter jika gagal load dari local storage
    const doctorName = currentUser?.name || 'Dokter Penanggung Jawab';
    const doctorNIP = currentUser?.username || '-';

    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Resume Medis - ${patient?.name || 'Pasien'}</title>
          <style>
            body { font-family: 'Arial', sans-serif; color: #1e293b; line-height: 1.6; padding: 40px; }
            .kop { display: flex; align-items: center; border-bottom: 4px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
            .kop img { width: 80px; height: auto; margin-right: 20px; }
            .kop-text h1 { font-size: 18pt; margin: 0; font-weight: 900; }
            .kop-text p { font-size: 10pt; margin: 5px 0; color: #475569; }
            .doc-title { text-align: center; font-weight: 900; text-decoration: underline; margin: 25px 0; font-size: 16pt; letter-spacing: 2px; }
            .info-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .info-table td { padding: 8px 5px; font-size: 11pt; border-bottom: 1px dashed #cbd5e1;}
            .section-title { background: #f8fafc; padding: 8px 12px; font-weight: 900; border-left: 6px solid #2563eb; margin: 25px 0 10px 0; font-size: 12pt; text-transform: uppercase; }
            .content { padding: 0 15px; font-size: 11pt; white-space: pre-wrap; text-align: justify; }
            ul { margin-top: 5px; padding-left: 20px; }
            li { margin-bottom: 5px; font-weight: bold; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
            .sign-area { text-align: center; min-width: 250px; }
          </style>
        </head>
        <body>
          <div class="kop">
            <img src="/LOGO-1.png" onerror="this.style.display='none'" />
            <div class="kop-text">
              <h1>RUMAH SAKIT UNIVERSITAS SEBELAS MARET</h1>
              <p>Jl. Ahmad Yani No. 200, Kartasura, Sukoharjo | Call Center: (0271) 6775000</p>
            </div>
          </div>
          <div class="doc-title">RINGKASAN PULANG (DISCHARGE SUMMARY)</div>
          
          <table class="info-table">
            <tr>
              <td width="20%">Nama Pasien</td><td width="30%">: <b>${patient?.name || '-'}</b></td>
              <td width="25%">Status Perawatan</td><td width="25%">: <b>${statusRawat.toUpperCase()}</b></td>
            </tr>
            <tr>
              <td>No. Rekam Medis</td><td>: <b>${patient?.norm || patient?.no_rm || '-'}</b></td>
              <td>Jenis Kelamin</td><td>: ${patient?.gender || 'Laki-Laki'}</td>
            </tr>
          </table>
          
          <div class="section-title">I. DIAGNOSIS AKHIR (ICD-10)</div>
          <div class="content"><b>Utama:</b> Observasi Klinis / Assessment Lanjut<br><b>Sekunder:</b> Sesuai Kode ICD-10 terkait</div>
          
          <div class="section-title">II. RINGKASAN RIWAYAT MEDIS</div>
          <div class="content"><i>${resumeData ? resumeData.riwayat : '-'}</i></div>

          <div class="section-title">III. HASIL PEMERIKSAAN RADIOLOGI</div>
          <div class="content"><i>${resumeData?.radiologi ? resumeData.radiologi : 'Tidak ada indikasi / pemeriksaan radiologi dilakukan.'}</i></div>
          
          <div class="section-title">IV. TERAPI / OBAT SAAT PULANG</div>
          <div class="content">
             <ul>${medsHtml}</ul>
          </div>

          <div class="section-title">V. INSTRUKSI & TINDAK LANJUT</div>
          <div class="content">${resumeData ? resumeData.instruksi : '-'}</div>
          
          <div class="footer">
            <div style="font-size: 8pt; color: #94a3b8; font-family: monospace;">Document Digitally Verified by DARSI AI System</div>
            <div class="sign-area">
              <p>Sukoharjo, ${today}</p>
              <p style="margin-bottom: 70px">Dokter Penanggung Jawab,</p>
              <p><b><u>${doctorName}</u></b></p>
              <p>NIP. ${doctorNIP}</p>
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
      await fetchResumeFromLaravel(patient.norm || patient.no_rm);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (e) {
      alert(`Gagal: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans overflow-x-hidden antialiased text-slate-900 pb-20">
      
      {/* Toast Notifikasi */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div initial={{ y: -100 }} animate={{ y: 20 }} exit={{ y: -100 }} className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg font-bold flex items-center gap-2">
            <CheckCircle2 size={20} /> Sinkronisasi AI Berhasil!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigasi Kontrol */}
      <nav className="flex flex-col xl:flex-row justify-between items-center mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <button onClick={() => navigate('/ringkasan')} className="group flex items-center text-slate-500 hover:text-blue-600 font-bold transition-all self-start xl:self-auto">
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali ke Ringkasan
        </button>
        <div className="flex flex-wrap md:flex-nowrap gap-3 w-full xl:w-auto">
          <button onClick={handleUpdateAI} disabled={loading} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 shadow-sm active:scale-95 disabled:opacity-50 transition-all uppercase tracking-widest text-xs">
            {loading ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} className="text-amber-500" />} Update Data
          </button>
          <button onClick={handlePrint} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/30 active:scale-95 transition-all uppercase tracking-widest text-xs">
            <Printer size={18} /> Cetak Resume
          </button>
          <button onClick={() => navigate('/approve')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all uppercase tracking-widest text-xs">
            <CheckCircle2 size={18} /> Approve Final
          </button>
        </div>
      </nav>

      {/* Preview Dokumen (Screen View) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-6 md:p-12 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none rotate-12">
            <FileText size={400} />
        </div>

        <header className="flex flex-col md:flex-row gap-6 border-b-4 border-slate-900 pb-6 mb-8 items-center text-center md:text-left">
          <img src="/LOGO-1.png" alt="Logo" className="w-20 h-20 object-contain" />
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">RUMAH SAKIT UNIVERSITAS SEBELAS MARET</h1>
            <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Jl. Ahmad Yani No. 200, Kartasura, Sukoharjo | Call Center: (0271) 6775000</p>
          </div>
        </header>

        {/* DATA PASIEN & STATUS RAWAT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10 text-left border-b-2 border-slate-100 pb-8">
          <div className="space-y-4">
            <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Nama Pasien</span><p className="font-black text-slate-800 text-lg leading-none">{patient?.name}</p></div>
            <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">No. Rekam Medis</span><p className="font-mono font-bold text-blue-600 text-lg leading-none">{patient?.norm || patient?.no_rm}</p></div>
          </div>
          <div className="space-y-4">
             <div>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Status Perawatan</span>
               <div className="mt-1 flex items-center gap-1.5 font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit text-xs border border-emerald-100 uppercase tracking-widest">
                  <CheckSquare size={14} /> {patient?.status_treatment || 'RAWAT JALAN'}
               </div>
             </div>
             <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Jenis Kelamin</span><p className="font-black text-slate-800 text-sm mt-1">{patient?.gender || 'Laki-Laki'}</p></div>
          </div>
          <div className="md:text-right">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Tanggal Terbit Dokumen</span>
            <p className="font-black text-slate-800 text-lg leading-none mt-1">{new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
          </div>
        </div>

        <main className="space-y-8 text-left">
          
          <section>
            <h2 className="text-xs font-black bg-slate-50 p-2.5 rounded-lg border-l-4 border-slate-800 mb-4 uppercase tracking-tighter">I. Diagnosis Akhir (ICD-10)</h2>
            <div className="ml-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Utama</span><p className="text-sm font-bold text-slate-800 mt-1">Observasi Klinis Lanjut</p></div>
                <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sekunder</span><p className="text-sm font-bold text-slate-700 mt-1">Sesuai Kode ICD-10 terkait</p></div>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4 bg-blue-50 p-2.5 rounded-lg border-l-4 border-blue-600">
                <h2 className="text-xs font-black text-blue-900 uppercase">II. Ringkasan Riwayat Medis</h2>
                <Fingerprint size={14} className="text-blue-600 opacity-40" />
            </div>
            <div className="ml-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 text-slate-700 italic leading-relaxed whitespace-pre-wrap font-medium text-sm">
              {loading ? (
                <div className="flex items-center gap-2 py-4"><Loader2 className="animate-spin text-blue-600" size={16} /><span className="text-xs font-bold text-blue-400">Menarik data dari database...</span></div>
              ) : (resumeData ? resumeData.riwayat : "Data riwayat belum ditarik.")}
            </div>
          </section>

          {/* SECTION BARU: HASIL RADIOLOGI */}
          <section>
            <div className="flex justify-between items-center mb-4 bg-indigo-50 p-2.5 rounded-lg border-l-4 border-indigo-600">
                <h2 className="text-xs font-black text-indigo-900 uppercase">III. Hasil Pemeriksaan Radiologi</h2>
                <Activity size={14} className="text-indigo-600 opacity-40" />
            </div>
            <div className="ml-4 p-5 bg-indigo-50/20 rounded-2xl border border-indigo-50 flex flex-col gap-4">
              {resumeData?.radiologi ? (
                 <p className="text-sm font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">{resumeData.radiologi}</p>
              ) : (
                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 italic">Belum ada data radiologi untuk pasien ini.</p>
                    <button 
                      onClick={() => navigate('/radiologi/input')} 
                      className="text-[10px] bg-indigo-100 hover:bg-indigo-600 hover:text-white text-indigo-700 px-4 py-2 rounded-lg font-black uppercase tracking-widest transition-all print:hidden"
                    >
                      + Input Radiologi
                    </button>
                 </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4 bg-emerald-50 p-2.5 rounded-lg border-l-4 border-emerald-600">
                <h2 className="text-xs font-black text-emerald-900 uppercase">IV. Terapi / Obat Saat Pulang</h2>
                <Pill size={14} className="text-emerald-600 opacity-40" />
            </div>
            <div className="ml-4 p-5 bg-emerald-50/20 rounded-2xl border border-emerald-50">
                <ul className="list-disc list-inside space-y-2 text-sm font-bold text-slate-800">
                   {loading ? (
                     <li className="text-slate-400 font-normal">Memproses resep obat...</li>
                   ) : (
                     resumeData?.obat?.map((obat, idx) => <li key={idx}>{obat}</li>) || <li className="text-slate-500 font-medium italic">Tidak ada obat spesifik / Sesuai resep dokter</li>
                   )}
                </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-black bg-slate-50 p-2.5 rounded-lg border-l-4 border-slate-800 mb-4 uppercase tracking-tighter">V. Instruksi & Tindak Lanjut</h2>
            <div className="ml-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
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
                 {/* Dummy Signature (Hanya ilustrasi visual UI) */}
                 <div className="absolute opacity-30 grayscale"><img src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Kirsch%27s_Signature.png" width="120" alt="sign" /></div>
              </div>
              <p className="text-sm font-black text-slate-900 underline decoration-2 decoration-blue-600 uppercase tracking-tighter">
                {currentUser?.name || 'Dokter Penanggung Jawab'}
              </p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                NIP. {currentUser?.username || '-'}
              </p>
            </div>
        </footer>
      </motion.div>
    </div>
  );
}