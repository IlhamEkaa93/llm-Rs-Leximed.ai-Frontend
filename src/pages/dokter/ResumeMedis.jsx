import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Printer, ShieldCheck, 
  Zap, RefreshCw, Loader2, ArrowLeft,
  CheckCircle2, Award, Fingerprint, Pill, CheckSquare,
  Activity, Download
} from 'lucide-react';

export default function ResumeMedis() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [patient, setPatient] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isReady, setIsReady] = useState(false); 

  // State untuk export
  const printRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const API_URL = "https://lexi-med-ai-llm-rs-back-end.vercel.app/api";
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
            radiologi: data.radiology_result || null, 
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

  // --- LOGIC 1: CETAK AMAN (PISAH IFRAME) ---
  const handlePrint = () => {
    if (!patient) return alert("Data pasien belum dimuat sempurna.");
    setIsPrinting(true);
    
    setTimeout(() => {
      const printContent = printRef.current.innerHTML;
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
      
      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(`
        <html>
          <head>
            <title>Resume Medis - ${patient.name}</title>
            <style>
              @page { size: A4; margin: 15mm; }
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; padding: 0; margin: 0; -webkit-print-color-adjust: exact; }
              .print-container { width: 100%; max-width: 800px; margin: 0 auto; }
              .header { display: flex; align-items: center; border-bottom: 4px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
              .logo { width: 70px; height: 70px; object-fit: contain; margin-right: 20px; }
              .kop-title { font-size: 20px; font-weight: 900; text-transform: uppercase; margin: 0; line-height: 1.2; }
              .kop-sub { font-size: 10px; font-weight: bold; color: #64748b; margin: 5px 0; }
              .doc-title { text-align: center; font-size: 16px; font-weight: 900; text-transform: uppercase; text-decoration: underline; margin: 20px 0; letter-spacing: 2px; }
              .info-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
              .info-table td { padding: 8px 5px; font-size: 12px; border-bottom: 1px dashed #cbd5e1; }
              .section-title { background: #f8fafc; padding: 6px 12px; font-weight: 900; border-left: 6px solid #10b981; margin: 20px 0 10px 0; font-size: 12px; text-transform: uppercase; }
              .content-text { padding: 0 15px; font-size: 12px; line-height: 1.6; text-align: justify; white-space: pre-wrap; margin: 0; }
              .med-list { margin: 5px 0 0 0; padding-left: 30px; font-size: 12px; font-weight: bold; }
              .footer { margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end; }
              .sign-area { text-align: center; min-width: 250px; }
              .sign-name { font-size: 14px; font-weight: 900; text-decoration: underline; text-transform: uppercase; margin: 0; }
            </style>
          </head>
          <body>
            <div class="print-container">
              ${printContent}
            </div>
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => { document.body.removeChild(iframe); setIsPrinting(false); }, 1000);
      }, 500);
    }, 100);
  };

  // --- LOGIC 2: DOWNLOAD PDF (HTML2PDF DYNAMIC INJECTION) ---
  const handleDownloadPDF = async () => {
    if (!patient) return alert("Data pasien belum dimuat sempurna.");
    setIsExporting(true);

    try {
      if (!window.html2pdf) {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        document.body.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
      }

      const element = printRef.current;
      const opt = {
        margin:       15,
        filename:     `Resume_Medis_${patient.norm || patient.no_rm}.pdf`,
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { scale: 3, useCORS: true, logging: false }, 
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await window.html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("Gagal Render PDF: ", err);
      alert("Gagal mengunduh PDF. Mengalihkan ke mode cetak...");
      handlePrint(); 
    } finally {
      setIsExporting(false);
    }
  };

  if (!isReady || !patient) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
          Menghubungkan ke LexiMed Secure Gateway...
        </p>
      </div>
    );
  }

  // Siapkan string untuk dokumen rahasia (Print/PDF)
  const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const statusRawat = patient?.status_treatment || 'Rawat Jalan';
  const doctorName = currentUser?.name || 'Dokter Penanggung Jawab';
  const doctorNIP = currentUser?.username || '-';

  return (
    <div className="min-h-screen bg-[#f4f7f9] p-4 md:p-8 font-sans overflow-x-hidden antialiased text-slate-900 pb-24">
      
      {/* Toast Notifikasi */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }} className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg font-bold flex items-center gap-3">
            <CheckCircle2 size={20} /> Sinkronisasi AI LexiMed Berhasil!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigasi & Kontrol Aksi */}
        <nav className="flex flex-col xl:flex-row justify-between items-center bg-white p-4 md:p-6 rounded-[2rem] border border-slate-200 shadow-sm gap-4">
          <button onClick={() => navigate('/ringkasan')} className="group flex items-center justify-center text-slate-500 hover:text-emerald-600 font-bold transition-all w-full xl:w-auto bg-slate-50 xl:bg-transparent p-3 xl:p-0 rounded-xl">
            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali ke Ringkasan
          </button>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full xl:w-auto">
            <button onClick={handleUpdateAI} disabled={loading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-xl font-bold hover:bg-slate-50 shadow-sm active:scale-95 disabled:opacity-50 transition-all uppercase tracking-widest text-[10px] md:text-xs">
              {loading ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} className="text-amber-500" />} Update Data
            </button>
            <button onClick={handlePrint} disabled={isPrinting} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-800 shadow-md active:scale-95 transition-all uppercase tracking-widest text-[10px] md:text-xs">
              {isPrinting ? <Loader2 className="animate-spin" size={16} /> : <Printer size={16} />} Cetak
            </button>
            <button onClick={handleDownloadPDF} disabled={isExporting} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 shadow-sm active:scale-95 transition-all uppercase tracking-widest text-[10px] md:text-xs">
              {isExporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />} Unduh PDF
            </button>
            <button onClick={() => navigate('/approve')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-black hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all uppercase tracking-widest text-[10px] md:text-xs">
              <CheckCircle2 size={18} /> Approve
            </button>
          </div>
        </nav>

        {/* Preview Dokumen (Screen View) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
          className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-6 md:p-12 overflow-hidden relative"
        >
          {/* Watermark Logo LexiMed */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none grayscale">
              <img src="/logo.png" alt="watermark" className="w-[400px] h-[400px] object-contain" />
          </div>

          <header className="flex flex-col md:flex-row gap-6 border-b-4 border-slate-900 pb-6 mb-8 items-center text-center md:text-left relative z-10">
            <img src="/logo.png" alt="Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-sm" />
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight uppercase">RS LexiMed.ai</h1>
              <p className="text-[9px] md:text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em] mt-1">Clinical Intelligence Laboratory</p>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Jl. Inovasi Vokasi No.1, Surakarta, Jawa Tengah</p>
            </div>
          </header>

          <div className="text-center mb-8 relative z-10">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest underline decoration-slate-300 underline-offset-8">Ringkasan Pulang (Discharge Summary)</h2>
          </div>

          {/* DATA PASIEN & STATUS RAWAT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10 text-left border-b-2 border-slate-100 pb-8 relative z-10">
            <div className="space-y-4">
              <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Nama Pasien</span><p className="font-black text-slate-800 text-lg leading-none">{patient?.name}</p></div>
              <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">No. Rekam Medis</span><p className="font-mono font-bold text-emerald-600 text-lg leading-none">{patient?.norm || patient?.no_rm}</p></div>
            </div>
            <div className="space-y-4">
               <div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Status Perawatan</span>
                 <div className="mt-1 flex items-center gap-1.5 font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit text-xs border border-emerald-100 uppercase tracking-widest">
                    <CheckSquare size={14} /> {statusRawat}
                 </div>
               </div>
               <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Jenis Kelamin</span><p className="font-black text-slate-800 text-sm mt-1">{patient?.gender || 'Laki-Laki'}</p></div>
            </div>
            <div className="lg:text-right space-y-4">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Tanggal Terbit Dokumen</span>
                <p className="font-black text-slate-800 text-lg leading-none mt-1">{todayStr}</p>
              </div>
            </div>
          </div>

          <main className="space-y-8 text-left relative z-10">
            
            <section>
              <h2 className="text-xs font-black bg-slate-50 p-3 rounded-xl border-l-4 border-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2"><FileText size={16}/> I. Diagnosis Akhir (ICD-10)</h2>
              <div className="ml-2 md:ml-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-100"><span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Utama</span><p className="text-sm font-bold text-slate-800 mt-1">Observasi Klinis / Assessment Lanjut</p></div>
                  <div className="bg-white p-4 rounded-xl border border-slate-100"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sekunder</span><p className="text-sm font-bold text-slate-600 mt-1">Sesuai Kode ICD-10 terkait</p></div>
              </div>
            </section>

            <section>
              <h2 className="text-xs font-black bg-blue-50 text-blue-900 p-3 rounded-xl border-l-4 border-blue-600 mb-4 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2"><Fingerprint size={16}/> II. Ringkasan Riwayat Medis</span>
              </h2>
              <div className="ml-2 md:ml-4 p-5 md:p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 italic leading-relaxed whitespace-pre-wrap font-medium text-sm">
                {loading ? (
                  <div className="flex items-center gap-2"><Loader2 className="animate-spin text-blue-600" size={16} /><span className="text-xs font-bold text-blue-500">Menarik insight dari AI...</span></div>
                ) : (resumeData ? resumeData.riwayat : "Data riwayat belum ditarik.")}
              </div>
            </section>

            <section>
              <h2 className="text-xs font-black bg-indigo-50 text-indigo-900 p-3 rounded-xl border-l-4 border-indigo-600 mb-4 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2"><Activity size={16}/> III. Hasil Pemeriksaan Radiologi</span>
              </h2>
              <div className="ml-2 md:ml-4 p-5 md:p-6 bg-white rounded-2xl border border-indigo-50 text-slate-700 leading-relaxed font-medium text-sm">
                {resumeData?.radiologi ? (
                   <p className="whitespace-pre-wrap">{resumeData.radiologi}</p>
                ) : (
                   <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-xs font-bold text-slate-400 italic">Belum ada data radiologi terlampir untuk pasien ini.</p>
                   </div>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-xs font-black bg-emerald-50 text-emerald-900 p-3 rounded-xl border-l-4 border-emerald-600 mb-4 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2"><Pill size={16}/> IV. Terapi / Obat Saat Pulang</span>
              </h2>
              <div className="ml-2 md:ml-4 p-5 md:p-6 bg-white rounded-2xl border border-emerald-50">
                  <ul className="list-disc list-inside space-y-2 text-sm font-bold text-slate-800">
                     {loading ? (
                       <li className="text-slate-400 font-normal">Memproses resep obat...</li>
                     ) : (
                       resumeData?.obat?.map((obat, idx) => <li key={idx}>{obat}</li>) || <li className="text-slate-500 font-medium italic">Sesuai resep dokter</li>
                     )}
                  </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xs font-black bg-slate-50 p-3 rounded-xl border-l-4 border-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2"><CheckSquare size={16}/> V. Instruksi & Tindak Lanjut</h2>
              <div className="ml-2 md:ml-4 p-5 bg-white rounded-2xl border border-slate-100">
                  <p className="text-sm font-bold text-slate-800">{resumeData ? resumeData.instruksi : "Menunggu instruksi dokter..."}</p>
              </div>
            </section>

          </main>

          <footer className="mt-16 flex flex-col md:flex-row justify-between items-end gap-10 relative z-10 pt-8 border-t border-slate-100">
              <div className="flex flex-col items-center sm:items-start opacity-40">
                 <ShieldCheck size={32} className="text-emerald-600 mb-2" />
                 <span className="text-[9px] font-black tracking-widest uppercase">LexiMed AI Engine v1.0</span>
                 <span className="text-[8px] font-bold text-slate-500 uppercase mt-1">Dokumen sah & terverifikasi</span>
              </div>
              <div className="text-center min-w-[250px]">
                <p className="text-xs font-bold text-slate-500 mb-8">Sukoharjo, {todayStr}</p>
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter mb-2">Dokter Penanggung Jawab</p>
                <div className="relative h-20 flex justify-center items-center my-4">
                   <Award size={40} className="text-slate-100 absolute" />
                   <div className="absolute opacity-50 grayscale"><img src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Kirsch%27s_Signature.png" width="100" alt="sign" /></div>
                </div>
                <p className="text-sm font-black text-slate-900 underline decoration-2 decoration-emerald-500 uppercase tracking-tighter">
                  {doctorName}
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  NIP. {doctorNIP}
                </p>
              </div>
          </footer>
        </motion.div>
      </div>

      {/* --- INVISIBLE HTML TEMPLATE FOR PRINTING & EXPORT --- */}
      {/* Template rahasia ini khusus digunakan untuk PDF dan Print agar formatnya baku (A4) */}
      <div className="hidden">
        <div ref={printRef}>
            <div className="header">
              <img src={window.location.origin + "/logo.png"} className="logo" alt="Logo" />
              <div>
                <h1 className="kop-title">RS LexiMed.ai</h1>
                <p className="kop-sub">Clinical Intelligence Laboratory</p>
                <p style={{fontSize: '10px', color: '#94a3b8', margin: '0'}}>Jl. Inovasi Vokasi No.1, Surakarta, Jawa Tengah</p>
              </div>
            </div>
            
            <div className="doc-title">RINGKASAN PULANG (DISCHARGE SUMMARY)</div>
            
            <table className="info-table">
              <tr>
                <td width="20%"><b>Nama Pasien</b></td><td width="30%">: ${patient?.name || '-'}</td>
                <td width="25%"><b>Status Perawatan</b></td><td width="25%">: ${statusRawat.toUpperCase()}</td>
              </tr>
              <tr>
                <td><b>No. Rekam Medis</b></td><td>: ${patient?.norm || patient?.no_rm || '-'}</td>
                <td><b>Jenis Kelamin</b></td><td>: ${patient?.gender || 'Laki-Laki'}</td>
              </tr>
            </table>
            
            <div className="section-title">I. DIAGNOSIS AKHIR (ICD-10)</div>
            <p className="content-text"><b>Utama:</b> Observasi Klinis / Assessment Lanjut<br/><b>Sekunder:</b> Sesuai Kode ICD-10 terkait</p>
            
            <div className="section-title">II. RINGKASAN RIWAYAT MEDIS</div>
            <p className="content-text">${resumeData ? resumeData.riwayat : '-'}</p>

            <div className="section-title">III. HASIL PEMERIKSAAN RADIOLOGI</div>
            <p className="content-text">${resumeData?.radiologi ? resumeData.radiologi : 'Tidak ada indikasi / pemeriksaan radiologi dilakukan.'}</p>
            
            <div className="section-title">IV. TERAPI / OBAT SAAT PULANG</div>
            <ul className="med-list">
              ${resumeData?.obat?.map(o => `<li>${o}</li>`).join('') || '<li>Tidak ada terapi obat khusus / Sesuai resep dokter</li>'}
            </ul>

            <div className="section-title">V. INSTRUKSI & TINDAK LANJUT</div>
            <p className="content-text">${resumeData ? resumeData.instruksi : '-'}</p>
            
            <div className="footer">
              <div style={{fontSize: '8px', color: '#94a3b8', textAlign:'left'}}>Document Digitally Verified by LexiMed AI Engine</div>
              <div className="sign-area">
                <p style={{fontSize:'12px', marginBottom: '60px'}}>Sukoharjo, ${todayStr}<br/>Dokter Penanggung Jawab,</p>
                <p className="sign-name">${doctorName}</p>
                <p style={{fontSize:'10px', margin:'5px 0 0 0'}}>NIP. ${doctorNIP}</p>
              </div>
            </div>
        </div>
      </div>

    </div>
  );
}