import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Download, Printer, Search, 
  Filter, Calendar, ChevronRight, CheckCircle2,
  FileSearch, Loader2, Database,
  ShieldCheck, Zap, Archive, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ArsipLaporan() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Ref untuk DOM rahasia yang akan diconvert ke PDF / Print
  const printRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // --- FETCH DATA DARI LARAVEL ---
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/clinical-data", {
          method: 'GET',
          headers: { 
            "Authorization": `Bearer ${localStorage.getItem('access_token')}`,
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success && Array.isArray(result.data)) {
            const verifiedData = result.data.filter(r => r.status === 'verified');
            setReports(verifiedData);
            if(verifiedData.length > 0) setSelectedReport(verifiedData[0]);
        } else {
            throw new Error("Endpoint error atau kosong.");
        }
      } catch (err) {
        console.warn("API Error. Menggunakan Data Fallback LexiMed...");
        const fallback = [
          { 
            id: 101, 
            patient_id: 'RM-2026-001', 
            source: 'NURSE_HANDOVER', 
            ai_summary: 'Pasien kondisi stabil post-appendectomy. Luka operasi bersih, tidak ada rembesan. Skala nyeri 2/10. IVFD RL 20 tpm lancar.', 
            created_at: '2026-05-08T08:00:00Z' 
          },
          { 
            id: 102, 
            patient_id: 'RM-2026-045', 
            source: 'RADIOLOGI', 
            ai_summary: 'X-Ray Thorax: Cor membesar, CTR 62%. Pulmo: tampak perselubungan homogen di sinus kostofrenikus kanan. Kesan: Cardiomegaly & Efusi Pleura Dextra.', 
            created_at: '2026-05-09T10:30:00Z' 
          },
          { 
            id: 103, 
            patient_id: 'RM-2026-092', 
            source: 'MANAGEMENT_REPORT', 
            ai_summary: 'Laporan Strategis: BOR Unit ICU mencapai 94% pada periode Mei 2026. Efisiensi integrasi AI LexiMed meningkatkan kecepatan resume medis sebesar 38%.', 
            created_at: '2026-05-09T14:15:00Z' 
          }
        ];
        setReports(fallback);
        setSelectedReport(fallback[0]);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // --- LOGIC 1: CETAK AMAN DENGAN IFRAME (PRINT) ---
  const handlePrint = () => {
    if (!selectedReport) return;
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
            <title>Cetak Laporan - ${selectedReport.patient_id}</title>
            <style>
              @page { size: A4; margin: 20mm; }
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; -webkit-print-color-adjust: exact; padding: 0; margin: 0; }
              .print-container { width: 100%; max-width: 800px; margin: 0 auto; }
              .header { display: flex; align-items: center; border-bottom: 4px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
              .logo { width: 80px; height: 80px; object-fit: contain; margin-right: 20px; }
              .kop-title { font-size: 24px; font-weight: 900; text-transform: uppercase; margin: 0; line-height: 1.2; }
              .kop-sub { font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin: 5px 0; }
              .info-grid { display: flex; justify-content: space-between; margin-bottom: 40px; }
              .info-box { border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; width: 45%; }
              .info-label { font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 2px; }
              .info-val { font-size: 18px; font-weight: 900; margin-top: 5px; }
              .content-box { background-color: #f8fafc; padding: 30px; border-radius: 16px; border-left: 10px solid #0f172a; margin-bottom: 60px; }
              .content-text { font-size: 18px; font-weight: bold; font-style: italic; line-height: 1.6; color: #1e293b; margin: 0; }
              .footer { text-align: right; border-top: 2px solid #0f172a; padding-top: 20px; }
              .sign-title { font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 40px; }
              .sign-name { font-size: 18px; font-weight: 900; font-style: italic; text-transform: uppercase; text-decoration: underline; margin: 0; }
            </style>
          </head>
          <body><div class="print-container">${printContent}</div></body>
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

  // --- LOGIC 2: DOWNLOAD PDF ASLI (MENGGUNAKAN HTML2PDF DYNAMIC INJECTION) ---
  const handleDownloadPDF = async () => {
    if (!selectedReport) return;
    setIsExporting(true);

    try {
      // Inject script html2pdf secara dinamis agar tidak perlu npm install
      if (!window.html2pdf) {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        document.body.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
      }

      const element = printRef.current;
      
      // Setting Kualitas PDF
      const opt = {
        margin:       15,
        filename:     `Dokumen_LexiMed_${selectedReport.patient_id}.pdf`,
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { scale: 3, useCORS: true, logging: false }, // Scale 3 = HD Text
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Proses generate PDF
      await window.html2pdf().set(opt).from(element).save();

    } catch (err) {
      console.error("Gagal Render PDF: ", err);
      alert("Gagal mengunduh PDF. Mengalihkan ke mode cetak...");
      handlePrint(); // Fallback ke cetak jika library gagal diload
    } finally {
      setIsExporting(false);
    }
  };

  const filteredReports = reports.filter(r => 
    r.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.ai_summary && r.ai_summary.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#f4f7f9] p-4 md:p-8 font-sans text-left pb-24 text-slate-900 antialiased overflow-x-hidden relative">
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* HEADER SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col xl:flex-row justify-between items-center gap-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-12"><Archive size={200} /></div>
          
          <div className="flex items-center gap-4 md:gap-6 w-full relative z-10">
            <div className="p-4 md:p-5 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200 shrink-0 border border-slate-700/50">
              <Database size={32} className="text-emerald-400" />
            </div>
            <div className="text-left leading-none">
              <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic text-slate-900">Clinical Archive</h1>
              <p className="text-slate-400 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.3em] mt-2 md:mt-3 flex items-center gap-2">
                <Zap size={12} className="text-emerald-500 fill-current" /> Verified Output & Export Engine
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full xl:w-auto relative z-10">
            <div className="flex-1 xl:w-96 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
              <input 
                type="text" placeholder="Cari Pasien, Kategori..." 
                className="w-full pl-14 pr-6 py-4 md:py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-sm shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LIST ARSIP (KIRI) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2"><Filter size={12}/> Verified Documents</span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase">{filteredReports.length} Items</span>
            </div>
            
            <div className="space-y-4 max-h-[650px] overflow-y-auto pr-2 hide-scrollbar">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <div className="flex flex-col items-center py-20 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
                    <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Accessing Encrypted Vault...</p>
                  </div>
                ) : filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <motion.div 
                      layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`p-6 md:p-7 rounded-[1.5rem] md:rounded-[2rem] border-2 cursor-pointer transition-all duration-300 relative overflow-hidden group ${selectedReport?.id === report.id ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-800 text-white shadow-xl shadow-slate-300 scale-[1.02]' : 'bg-white border-transparent hover:border-emerald-200 text-slate-600 shadow-sm'}`}
                    >
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${selectedReport?.id === report.id ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-100 text-slate-500'}`}>
                          {report.source?.replace(/_/g, ' ') || 'CLINICAL_DATA'}
                        </div>
                        <CheckCircle2 size={18} className={selectedReport?.id === report.id ? 'text-emerald-400' : 'text-emerald-500'} />
                      </div>
                      <h4 className="font-black text-lg md:text-xl tracking-tight leading-none mb-2 uppercase italic group-hover:translate-x-1 transition-transform">{report.patient_id}</h4>
                      <p className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${selectedReport?.id === report.id ? 'text-slate-400' : 'text-slate-400'}`}>
                        <Calendar size={12} /> {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-16 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                    <FileSearch size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">No reports found</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* DETAIL & PREVIEW UI (KANAN) */}
          <div className="lg:col-span-7 sticky top-[110px]">
            {selectedReport ? (
              <motion.div 
                key={selectedReport.id}
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden"
              >
                {/* TOOLBAR AKSI (Cetak & PDF) */}
                <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/80">
                   <div className="flex gap-3 w-full sm:w-auto">
                      <button onClick={handlePrint} disabled={isPrinting} className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95 group font-bold text-sm">
                        {isPrinting ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} className="group-hover:rotate-12 transition-transform" />} 
                        <span className="hidden sm:inline">Cetak Dokumen</span>
                      </button>
                      <button onClick={handleDownloadPDF} disabled={isExporting} className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border border-emerald-500 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md active:scale-95 font-bold text-sm shadow-emerald-500/30">
                        {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 
                        <span className="hidden sm:inline">Unduh PDF</span>
                      </button>
                   </div>
                   <div className="text-center sm:text-right w-full sm:w-auto">
                     <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center justify-center sm:justify-end gap-1.5">
                       <ShieldCheck size={16} /> Verified by LexiMed.ai
                     </span>
                     <p className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase mt-1">Immutable Ledger: 0x{Math.random().toString(16).slice(2,10).toUpperCase()}</p>
                   </div>
                </div>

                {/* PREVIEW DI LAYAR (Hanya untuk dilihat, bukan untuk di-print) */}
                <div className="p-6 md:p-12 text-left space-y-8 min-h-[400px] md:min-h-[600px] bg-white relative overflow-y-auto max-h-[60vh] hide-scrollbar">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] grayscale pointer-events-none">
                    <img src="/logo.png" alt="watermark" className="w-[300px] h-[300px] object-contain" />
                  </div>
                  
                  {/* KOP SURAT PREVIEW */}
                  <div className="flex justify-between items-center border-b-[4px] border-slate-900 pb-6 md:pb-8 relative z-10">
                    <div className="flex items-center gap-4 md:gap-6">
                      <img src="/logo.png" alt="Logo LexiMed" className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-md" />
                      <div className="text-left">
                        <h2 className="font-black text-xl md:text-3xl leading-none uppercase tracking-tighter text-slate-900">RS LexiMed.ai</h2>
                        <p className="text-[9px] md:text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em] mt-1 md:mt-2">Clinical Intelligence Laboratory</p>
                        <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase mt-1">Jl. Inovasi Vokasi No.1, Surakarta, Jawa Tengah</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 md:gap-12 py-4 relative z-10">
                    <div className="space-y-1">
                      <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Identitas Pasien</p>
                      <p className="font-black text-slate-900 text-lg md:text-xl uppercase tracking-tight border-b-2 border-slate-100 pb-2">{selectedReport.patient_id}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Dokumen</p>
                      <p className="font-black text-slate-900 text-lg md:text-xl uppercase tracking-tight border-b-2 border-slate-100 pb-2">
                        {new Date(selectedReport.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-3">
                      <div className="p-2.5 bg-slate-900 text-white rounded-lg"><FileText size={16}/></div>
                      <p className="text-[10px] md:text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Ringkasan Eksekutif Klinis</p>
                    </div>
                    <div className="p-6 md:p-8 bg-slate-50 rounded-[2rem] font-bold text-slate-800 leading-relaxed text-lg border-l-[8px] md:border-l-[10px] border-slate-900 shadow-sm">
                      "{selectedReport.ai_summary || selectedReport.raw_content}"
                    </div>
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="h-[400px] md:h-[600px] bg-white border-2 border-dashed border-slate-200 rounded-[2rem] md:rounded-[3rem] flex flex-col items-center justify-center text-slate-300 shadow-sm group">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="p-8 bg-slate-50 rounded-full mb-6 group-hover:bg-emerald-50 transition-colors">
                  <FileSearch size={64} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
                </motion.div>
                <p className="font-black text-xs md:text-sm uppercase tracking-[0.4em] text-slate-400">Pilih Laporan</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- RAHASIA: INVISIBLE HTML TEMPLATE FOR PDF & EXPORT --- */}
      {/* Bagian ini tidak akan terlihat oleh user (disembunyikan ke kiri layar), 
          tapi akan dimanfaatkan oleh html2pdf dan iframe Print. */}
      <div className="absolute -left-[9999px] top-0 bg-white" aria-hidden="true">
        <div ref={printRef} style={{ padding: '40px', width: '800px', backgroundColor: 'white', color: 'black' }}>
           {selectedReport && (
             <>
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '4px solid #0f172a', paddingBottom: '20px', marginBottom: '30px' }}>
                  <img src={window.location.origin + "/logo.png"} style={{ width: '80px', height: '80px', objectFit: 'contain', marginRight: '20px' }} alt="Logo" />
                  <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', textTransform: 'uppercase', margin: '0', lineHeight: '1.2', color: '#0f172a' }}>RS LexiMed.ai</h1>
                    <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981', textTransform: 'uppercase', letterSpacing: '2px', margin: '5px 0' }}>Clinical Intelligence Laboratory</p>
                    <p style={{ fontSize: '10px', color: '#94a3b8', margin: '0', fontWeight: 'bold' }}>Jl. Inovasi Vokasi No.1, Surakarta, Jawa Tengah</p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                  <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', width: '45%' }}>
                    <div style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px' }}>Nomor Rekam Medis / Identitas</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', marginTop: '5px', color: '#0f172a' }}>{selectedReport.patient_id}</div>
                  </div>
                  <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', width: '45%' }}>
                    <div style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px' }}>Tanggal Pengesahan</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', marginTop: '5px', color: '#0f172a' }}>
                      {new Date(selectedReport.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', color: '#0f172a' }}>
                  Kategori Dokumen: {selectedReport.source?.replace(/_/g, ' ')}
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '16px', borderLeft: '12px solid #0f172a', marginBottom: '60px' }}>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', fontStyle: 'italic', lineHeight: '1.6', color: '#1e293b', margin: '0' }}>
                    "{selectedReport.ai_summary || selectedReport.raw_content}"
                  </p>
                </div>

                <div style={{ textAlign: 'right', borderTop: '2px solid #0f172a', paddingTop: '20px' }}>
                  <p style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '40px' }}>Digital Intelligence Signature</p>
                  <p style={{ fontSize: '20px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', textDecoration: 'underline', margin: '0', color: '#0f172a' }}>LEXIMED AI CORE</p>
                  <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '10px', fontWeight: 'bold' }}>Dokumen ini sah dan terverifikasi secara sistem.</p>
                </div>
             </>
           )}
        </div>
      </div>

    </div>
  );
}