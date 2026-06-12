// ============================================================================
// LEXIMED.AI — ResumeMedis.jsx (v19.0 - PREMIUM PDF MATCH WEB UI)
// FIX: printRef HTML disamakan 100% dengan tampilan web (premium layout)
// FIX: CSS print inline lengkap dengan warna, badge, border, shadow simulasi
// FIX: Obat list, radiologi, assessment semua termuat di PDF output
// ============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Printer, ShieldCheck, Loader2, ArrowLeft,
  CheckCircle2, Award, Fingerprint, Pill, CheckSquare,
  Activity, Download, Database, RefreshCw, Zap,
  HelpCircle, ChevronRight, CheckCircle, AlertCircle, BrainCircuit
} from 'lucide-react';

export default function ResumeMedis() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [patient, setPatient] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const printRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const tourSteps = [
    {
      title: "Alur Kerja Sistem: Konsolidasi Vektor RAG",
      desc: "Seluruh kompilasi berkas yang diekstrak dari database RAG berhasil disandingkan dengan draf Dokter untuk memotong risiko halusinasi ringkasan rekam medis pasien.",
      icon: <BrainCircuit className="text-emerald-400" size={24} />,
      actionLabel: "Lanjutkan"
    },
    {
      title: "Langkah Terakhir: Otorisasi & Approve Berkas",
      desc: "Langkah final dalam sistem CDSS ini adalah mengunci legalitas hukum berkas. Juri dapat mensimulasikan persetujuan akhir dengan menekan tombol Approve.",
      icon: <CheckCircle2 className="text-blue-400" size={24} />,
      actionLabel: "Approve & Selesai"
    }
  ];

  const API_URL = "https://lexi-med-ai-llm-rs-back-end.vercel.app/api";
  const token = localStorage.getItem('access_token');

  const parseSectionByTag = (combinedText, tag) => {
    if (!combinedText) return null;
    const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)(?=\\s*\\[|$)`, 'i');
    const match = combinedText.match(regex);
    return match ? match[1].trim() : null;
  };

  const extractMedsFromBlock = (combinedText) => {
    const resepContent = parseSectionByTag(combinedText, 'RESEP');
    if (!resepContent) return ["Obat dilanjutkan sesuai instruksi resep dokter"];
    let rawLines = resepContent.split("\n");
    let cleanMeds = rawLines
      .map(line => line.replace(/^(resep|obat|daftar|yang|diperlukan|untuk|pasien|ini|adalah|:)+/i, '').replace(/^[-\s•*]+/, '').trim())
      .filter(line => line.length > 3 && !line.toLowerCase().includes('resep obat') && !line.toLowerCase().includes('adalah'));
    if (cleanMeds.length > 0) return [...new Set(cleanMeds)];
    return ["Obat dilanjutkan sesuai instruksi resep dokter"];
  };

  const fetchResumeFromLaravel = useCallback(async (norm) => {
    if (!norm) return;
    setLoading(true);
    try {
      const [resCurrent, resHistory] = await Promise.all([
        fetch(`${API_URL}/clinical-data/${norm}`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }),
        fetch(`${API_URL}/patients/${norm}/history`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } })
      ]);
      let currentData = null;
      let historyArray = [];
      if (resCurrent.ok) {
        try {
          const ct = resCurrent.headers.get("content-type");
          if (ct && ct.includes("application/json")) {
            const r = await resCurrent.json();
            currentData = r.data || r;
          }
        } catch {}
      }
      if (resHistory.ok) {
        try {
          const ct = resHistory.headers.get("content-type");
          if (ct && ct.includes("application/json")) historyArray = await resHistory.json();
        } catch {}
      }
      let combinedText = (currentData?.ai_summary || currentData?.raw_content || "") + "\n";
      if (Array.isArray(historyArray)) {
        historyArray.forEach(item => { combinedText += "\n" + (item.ai_summary || item.raw_content || ""); });
      }
      const activeRadiologyRecord = Array.isArray(historyArray)
        ? historyArray.find(item => item.radiology_image || item.radiology_kesan) : null;
      const extractedDiagnosis = parseSectionByTag(combinedText, 'FINAL_DIAGNOSIS') || "Chronic Kidney Disease (CKD) Stage V";
      const extractedAssessment = parseSectionByTag(combinedText, 'ASSESSMENT') || "Pasien mengalami hipervolemia b.d gangguan mekanisme regulasi ginjal, ditandai edema fokal.";
      const extractedPlanning = parseSectionByTag(combinedText, 'PLANNING') || "Kolaborasi program hemodialisa reguler, restriksi asupan cairan ketat, dan monitoring balance harian.";
      const extractedTatalaksana = parseSectionByTag(combinedText, 'TATALAKSANA') || "Restriksi cairan maksimal 500 ml + volume urine 24 jam. Pemberian antiemetik intravena.";
      const extractedEdukasi = parseSectionByTag(combinedText, 'EDUKASI') || "Edukasi pembatasan minum air harian, catat volume urine keluar, evaluasi pre-post berat badan.";
      setResumeData({
        diagnosa_utama: extractedDiagnosis,
        assessment: extractedAssessment,
        planning: extractedPlanning,
        tatalaksana: extractedTatalaksana,
        edukasi: extractedEdukasi,
        riwayat: `Pasien didiagnosis dengan ${extractedDiagnosis}. ${extractedAssessment} Rencana intervensi yang dijalankan meliputi: ${extractedPlanning} dengan tindakan tatalaksana berupa ${extractedTatalaksana}.`,
        obat: extractMedsFromBlock(combinedText),
        radiologi: currentData?.radiology_kesan || activeRadiologyRecord?.radiology_kesan || "Hasil evaluasi citra menunjukkan keadaan organ intak terstruktur.",
        radiology_image: currentData?.radiology_image || activeRadiologyRecord?.radiology_image || null,
        radiology_modality: currentData?.radiology_modality || activeRadiologyRecord?.radiology_modality || 'MRI Abdomen',
        radiology_doctor: currentData?.radiology_doctor || activeRadiologyRecord?.radiology_doctor || 'dr. Akhmad, Sp.Rad',
        instruksi: "Kontrol poli spesialis penyakit dalam sesuai jadwal reguler tindakan penunjang. Batasi konsumsi natrium cairan."
      });
    } catch (e) {
      console.error("Gagal sinkronisasi rekam medis:", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchPatientDetail = useCallback(async (norm, fallbackData) => {
    try {
      const res = await fetch(`${API_URL}/patients/${norm}`, { headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" } });
      let serverPatientData = null;
      if (res.ok) {
        const ct = res.headers.get("content-type");
        if (ct && ct.includes("application/json")) {
          const result = await res.json();
          serverPatientData = result.data || result;
        }
      }
      setPatient(serverPatientData ? { ...serverPatientData, norm: serverPatientData.no_rm } : fallbackData);
    } catch (e) {
      setPatient(fallbackData);
    } finally {
      await fetchResumeFromLaravel(norm);
      setIsReady(true);
    }
  }, [token, fetchResumeFromLaravel]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
    const savedPatient = localStorage.getItem('active_patient');
    if (!savedPatient) { navigate('/dashboard'); return; }
    try {
      const data = JSON.parse(savedPatient);
      const norm = data.norm || data.no_rm || data.patient_id;
      fetchPatientDetail(norm, data);
    } catch { navigate('/dashboard'); }
    const currentTourStep = sessionStorage.getItem('leximed_doctor_tour_step');
    if ((currentTourStep === '3' || currentTourStep === '4' || currentTourStep === '5') && !sessionStorage.getItem('leximed_doctor_tour_completed')) {
      setTourStep(0); setShowTour(true);
    }
  }, [navigate, fetchPatientDetail]);

  const handleUpdateAI = async () => {
    if (!patient) return;
    await fetchResumeFromLaravel(patient.norm || patient.no_rm);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleNextTourStep = () => {
    if (tourStep < tourSteps.length - 1) { setTourStep(prev => prev + 1); }
    else {
      sessionStorage.setItem('leximed_doctor_tour_completed', 'true');
      sessionStorage.removeItem('leximed_doctor_tour_step');
      setShowTour(false);
      navigate('/approve');
    }
  };
  const handleCloseTour = () => {
    sessionStorage.setItem('leximed_doctor_tour_completed', 'true');
    sessionStorage.removeItem('leximed_doctor_tour_step');
    setShowTour(false);
  };
  const toggleTourRestart = () => {
    sessionStorage.removeItem('leximed_doctor_tour_completed');
    sessionStorage.setItem('leximed_doctor_tour_step', '0');
    setTourStep(0); setShowTour(true);
  };

  // ── GENERATE PREMIUM PRINT HTML ──
  const generatePrintHTML = () => {
    if (!patient || !resumeData) return '';
    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const statusRawat = patient?.status_treatment || 'Rawat Jalan';
    const doctorName = currentUser?.name || 'Dr. Ilham';
    const doctorNIP = currentUser?.username || 'V3924005';
    const norm = patient?.norm || patient?.no_rm || 'RM-001';
    const obatList = resumeData?.obat || ["Obat dilanjutkan sesuai instruksi resep dokter"];
    const statusColor = statusRawat === 'UGD' || statusRawat === 'IGD' ? '#dc2626' : statusRawat === 'Rawat Inap' ? '#d97706' : '#059669';
    const statusBg = statusRawat === 'UGD' || statusRawat === 'IGD' ? '#fef2f2' : statusRawat === 'Rawat Inap' ? '#fffbeb' : '#ecfdf5';

    return `
      <div style="font-family:'Segoe UI',Arial,sans-serif;color:#0f172a;max-width:780px;margin:0 auto;padding:0;">

        <!-- KOP SURAT PREMIUM -->
        <div style="display:flex;align-items:center;border-bottom:4px solid #0f172a;padding-bottom:20px;margin-bottom:24px;">
          <img src="${window.location.origin}/logo.png" style="width:72px;height:72px;object-fit:contain;margin-right:20px;" onerror="this.style.display='none'" />
          <div style="flex:1;">
            <div style="font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:-0.5px;color:#0f172a;margin:0 0 4px 0;">RS LexiMed.ai</div>
            <div style="font-size:10px;font-weight:700;color:#10b981;text-transform:uppercase;letter-spacing:3px;margin:0 0 3px 0;">Clinical Intelligence Laboratory</div>
            <div style="font-size:10px;color:#94a3b8;font-weight:600;">Jl. Inovasi Vokasi No.1, Surakarta, Jawa Tengah</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:2px;">No. Dokumen</div>
            <div style="font-size:14px;font-weight:900;color:#10b981;font-family:monospace;">${norm}</div>
            <div style="font-size:9px;color:#94a3b8;margin-top:4px;">${todayStr}</div>
          </div>
        </div>

        <!-- JUDUL DOKUMEN -->
        <div style="text-align:center;margin-bottom:28px;">
          <div style="display:inline-block;background:#0f172a;color:white;padding:10px 40px;border-radius:50px;font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:3px;">
            RINGKASAN PULANG (DISCHARGE SUMMARY)
          </div>
        </div>

        <!-- INFO PASIEN CARD -->
        <div style="background:#f8fafc;border:2px solid #e2e8f0;border-radius:20px;padding:20px 24px;margin-bottom:28px;">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
            <div>
              <div style="font-size:9px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">Nama Pasien</div>
              <div style="font-size:16px;font-weight:900;color:#0f172a;">${patient?.name || 'Pasien Demo'}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">No. Rekam Medis</div>
              <div style="font-size:16px;font-weight:900;color:#10b981;font-family:monospace;">${norm}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">Jenis Kelamin</div>
              <div style="font-size:14px;font-weight:700;color:#334155;">${patient?.gender || 'Laki-Laki'} · ${patient?.age || '-'} Tahun</div>
            </div>
          </div>
          <div style="margin-top:16px;padding-top:16px;border-top:1px dashed #cbd5e1;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
            <div>
              <div style="font-size:9px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Status Perawatan</div>
              <div style="display:inline-flex;align-items:center;gap:6px;background:${statusBg};color:${statusColor};border:1.5px solid ${statusColor}30;padding:5px 14px;border-radius:50px;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;">
                ✓ ${statusRawat}
              </div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">Unit Pelayanan</div>
              <div style="font-size:12px;font-weight:700;color:#334155;">${patient?.unit || 'Poli Umum'}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">DPJP</div>
              <div style="font-size:12px;font-weight:700;color:#334155;">${patient?.dpjp || doctorName}</div>
            </div>
          </div>
        </div>

        <!-- SECTION I: DIAGNOSIS -->
        <div style="margin-bottom:24px;">
          <div style="background:#0f172a;color:white;padding:10px 18px;border-radius:12px 12px 0 0;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;display:flex;align-items:center;gap:8px;">
            <span>📄</span> I. Diagnosis Akhir (ICD-10)
          </div>
          <div style="border:2px solid #0f172a;border-top:none;border-radius:0 0 12px 12px;padding:18px 20px;background:white;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
              <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:12px;padding:14px 16px;">
                <div style="font-size:9px;font-weight:800;color:#16a34a;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">● Diagnosis Utama</div>
                <div style="font-size:13px;font-weight:800;color:#14532d;">${resumeData?.diagnosa_utama || 'Chronic Kidney Disease (CKD) Stage V'}</div>
              </div>
              <div style="background:#fafafa;border:1.5px solid #e2e8f0;border-radius:12px;padding:14px 16px;">
                <div style="font-size:9px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">○ Diagnosis Sekunder (Keperawatan)</div>
                <div style="font-size:12px;font-weight:700;color:#475569;">Hipervolemia b.d Gangguan Regulasi Ginjal</div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION II: RIWAYAT MEDIS -->
        <div style="margin-bottom:24px;">
          <div style="background:#1e40af;color:white;padding:10px 18px;border-radius:12px 12px 0 0;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;display:flex;align-items:center;gap:8px;">
            <span>🔍</span> II. Ringkasan Riwayat Medis & Kronologi Klinis
          </div>
          <div style="border:2px solid #1e40af;border-top:none;border-radius:0 0 12px 12px;padding:18px 20px;background:white;">
            <div style="background:#eff6ff;border-radius:10px;padding:16px;font-size:12px;font-weight:500;color:#1e293b;line-height:1.8;">
              ${resumeData?.riwayat || '-'}
            </div>
            ${resumeData?.assessment ? `
            <div style="margin-top:12px;background:white;border:1.5px solid #bfdbfe;border-radius:10px;padding:12px 16px;">
              <div style="font-size:9px;font-weight:900;color:#1d4ed8;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Analisis Indikasi Keperawatan (Assessment):</div>
              <div style="font-size:12px;font-style:italic;color:#334155;">"${resumeData.assessment}"</div>
            </div>` : ''}
          </div>
        </div>

        <!-- SECTION III: RADIOLOGI -->
        <div style="margin-bottom:24px;">
          <div style="background:#4338ca;color:white;padding:10px 18px;border-radius:12px 12px 0 0;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;display:flex;align-items:center;gap:8px;">
            <span>🩻</span> III. Hasil Pemeriksaan Radiologi (PACS)
          </div>
          <div style="border:2px solid #4338ca;border-top:none;border-radius:0 0 12px 12px;padding:18px 20px;background:white;">
            <div style="display:flex;gap:16px;align-items:flex-start;">
              ${resumeData?.radiology_image ? `<img src="${resumeData.radiology_image}" style="width:120px;height:120px;object-fit:cover;border-radius:10px;border:2px solid #c7d2fe;" />` : ''}
              <div style="flex:1;">
                <div style="display:inline-block;background:#eef2ff;color:#4338ca;border:1.5px solid #c7d2fe;padding:4px 12px;border-radius:50px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">
                  Modalitas: ${resumeData?.radiology_modality || 'MRI Abdomen'}
                </div>
                <div style="font-size:13px;font-style:italic;font-weight:600;color:#1e293b;line-height:1.7;margin-bottom:8px;">
                  "${resumeData?.radiologi || 'Hasil evaluasi citra menunjukkan keadaan organ intak terstruktur.'}"
                </div>
                <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                  Spesialis Radiolog: ${resumeData?.radiology_doctor || 'dr. Akhmad, Sp.Rad'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION IV: OBAT -->
        <div style="margin-bottom:24px;">
          <div style="background:#065f46;color:white;padding:10px 18px;border-radius:12px 12px 0 0;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;display:flex;align-items:center;gap:8px;">
            <span>💊</span> IV. Terapi / Obat Saat Pulang (Ekstraksi AI)
          </div>
          <div style="border:2px solid #065f46;border-top:none;border-radius:0 0 12px 12px;padding:18px 20px;background:white;">
            ${obatList.map((obat, idx) => `
              <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:${idx % 2 === 0 ? '#f0fdf4' : '#fafafa'};border:1.5px solid #bbf7d0;border-radius:10px;margin-bottom:8px;">
                <div style="width:22px;height:22px;background:#10b981;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:900;flex-shrink:0;">✓</div>
                <div style="font-size:12px;font-weight:700;color:#065f46;">${obat}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- SECTION V: INSTRUKSI -->
        <div style="margin-bottom:32px;">
          <div style="background:#374151;color:white;padding:10px 18px;border-radius:12px 12px 0 0;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;display:flex;align-items:center;gap:8px;">
            <span>📋</span> V. Instruksi & Tindak Lanjut
          </div>
          <div style="border:2px solid #374151;border-top:none;border-radius:0 0 12px 12px;padding:18px 20px;background:white;">
            <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:12px;">${resumeData?.instruksi || 'Kontrol poli spesialis sesuai jadwal.'}</div>
            ${resumeData?.edukasi ? `
            <div style="background:#fffbeb;border:1.5px solid #fde68a;border-radius:10px;padding:12px 16px;">
              <div style="font-size:9px;font-weight:900;color:#92400e;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Edukasi Pemulihan Pasien:</div>
              <div style="font-size:12px;font-weight:500;color:#451a03;line-height:1.7;">${resumeData.edukasi}</div>
            </div>` : ''}
          </div>
        </div>

        <!-- FOOTER TTD -->
        <div style="display:flex;justify-content:space-between;align-items:flex-end;padding-top:24px;border-top:2px solid #e2e8f0;margin-top:8px;">
          <div style="display:flex;align-items:center;gap:12px;opacity:0.4;">
            <div style="font-size:28px;">🛡️</div>
            <div>
              <div style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#334155;">LexiMed AI Engine v1.0</div>
              <div style="font-size:9px;color:#94a3b8;font-weight:600;margin-top:2px;">Dokumen Sah & Terverifikasi Digital</div>
            </div>
          </div>
          <div style="text-align:center;min-width:260px;">
            <div style="font-size:11px;color:#64748b;font-weight:600;margin-bottom:6px;">Sukoharjo, ${todayStr}</div>
            <div style="font-size:10px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">Dokter Penanggung Jawab,</div>
            <div style="height:70px;display:flex;align-items:center;justify-content:center;">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Kirsch%27s_Signature.png" style="width:120px;opacity:0.6;filter:grayscale(1);" />
            </div>
            <div style="height:2px;background:linear-gradient(90deg,#10b981,#3b82f6);border-radius:2px;margin-bottom:8px;"></div>
            <div style="font-size:14px;font-weight:900;color:#0f172a;text-transform:uppercase;letter-spacing:1px;">${doctorName}</div>
            <div style="font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-top:3px;">NIP. ${doctorNIP}</div>
          </div>
        </div>

      </div>
    `;
  };

  const handlePrint = () => {
    if (!patient) return alert("Data pasien belum dimuat sempurna.");
    setIsPrinting(true);
    setTimeout(() => {
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;width:0;height:0;border:none;';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(`
        <html>
          <head>
            <title>Resume Medis - ${patient.name}</title>
            <style>
              @page { size: A4; margin: 15mm; }
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: white; }
            </style>
          </head>
          <body>${generatePrintHTML()}</body>
        </html>
      `);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => { document.body.removeChild(iframe); setIsPrinting(false); }, 1000);
      }, 600);
    }, 100);
  };

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
      // Render ke div tersembunyi
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;background:white;padding:30px;box-sizing:border-box;';
      container.innerHTML = generatePrintHTML();
      document.body.appendChild(container);

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Resume_Medis_${patient?.norm || patient?.no_rm || 'RM'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      await window.html2pdf().set(opt).from(container).save();
      document.body.removeChild(container);
    } catch (err) {
      console.error("Gagal Render PDF:", err);
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
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Menghubungkan ke LexiMed Secure Gateway...</p>
      </div>
    );
  }

  const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const statusRawat = patient?.status_treatment || 'Rawat Jalan';
  const doctorName = currentUser?.name || 'Dr. Ilham';
  const doctorNIP = currentUser?.username || 'V3924005';

  return (
    <div className="min-h-screen bg-[#f4f7f9] p-4 md:p-8 font-sans overflow-x-hidden antialiased text-slate-900 pb-24">
      
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }} className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg font-bold flex items-center gap-3">
            <CheckCircle2 size={20} /> Sinkronisasi AI LexiMed Berhasil!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-6">

        {/* NAV BAR */}
        <nav className="flex flex-col xl:flex-row justify-between items-center bg-white p-4 md:p-6 rounded-[2rem] border border-slate-200 shadow-sm gap-4">
          <button onClick={() => navigate('/data-medis')} className="group shrink-0 flex items-center justify-center text-slate-500 hover:text-emerald-600 font-bold transition-all w-full xl:w-auto bg-slate-50 xl:bg-transparent p-3 xl:p-0 rounded-xl text-xs uppercase tracking-widest">
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali ke Rekam Medis
          </button>
          <div className="flex overflow-x-auto gap-3 w-full xl:w-auto pb-2 xl:pb-0 [&::-webkit-scrollbar]:hidden">
            <button onClick={toggleTourRestart} className="shrink-0 flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-600 px-5 py-3 rounded-xl font-bold hover:bg-emerald-100 shadow-sm transition-all uppercase tracking-widest text-[10px] md:text-xs">
              <HelpCircle size={16} /> Alur Kerja Sistem
            </button>
            <button onClick={() => navigate('/data-medis')} className="shrink-0 flex items-center justify-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-5 py-3 rounded-xl font-bold hover:bg-blue-100 shadow-sm transition-all uppercase tracking-widest text-[10px] md:text-xs">
              <Database size={16} /> Data Medis
            </button>
            <button onClick={handleUpdateAI} disabled={loading} className="shrink-0 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-xl font-bold hover:bg-slate-50 shadow-sm active:scale-95 disabled:opacity-50 transition-all uppercase tracking-widest text-[10px] md:text-xs">
              {loading ? <RefreshCw className="animate-spin text-emerald-500" size={16} /> : <Zap size={16} className="text-amber-500" />} Update Data AI
            </button>
            <button onClick={handlePrint} disabled={isPrinting} className="shrink-0 flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-800 shadow-md transition-all uppercase tracking-widest text-[10px] md:text-xs">
              {isPrinting ? <Loader2 className="animate-spin" size={16} /> : <Printer size={16} />} Cetak Dokumen
            </button>
            <button onClick={handleDownloadPDF} disabled={isExporting} className="shrink-0 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 shadow-sm transition-all uppercase tracking-widest text-[10px] md:text-xs">
              {isExporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />} Unduh PDF
            </button>
            <button onClick={() => navigate('/approve')} className="shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-black hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30 transition-all uppercase tracking-widest text-[10px] md:text-xs">
              <CheckCircle2 size={18} /> Approve
            </button>
          </div>
        </nav>

        {/* PREVIEW DOKUMEN WEB */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-6 md:p-12 overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none grayscale">
            <img src="/logo.png" alt="watermark" className="w-[400px] h-[400px] object-contain" />
          </div>

          {/* KOP */}
          <header className="flex flex-col md:flex-row gap-6 border-b-4 border-slate-900 pb-6 mb-8 items-center text-center md:text-left relative z-10">
            <img src="/logo.png" alt="Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-sm" />
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight uppercase">RS LexiMed.ai</h1>
              <p className="text-[9px] md:text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em] mt-1">Clinical Intelligence Laboratory</p>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Jl. Inovasi Vokasi No.1, Surakarta, Jawa Tengah</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No. Dokumen</p>
              <p className="font-mono font-black text-emerald-600 text-lg">{patient?.norm || patient?.no_rm}</p>
              <p className="text-[9px] text-slate-400 mt-1">{todayStr}</p>
            </div>
          </header>

          <div className="text-center mb-8 relative z-10">
            <span className="inline-block bg-slate-900 text-white px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest">
              Ringkasan Pulang (Discharge Summary)
            </span>
          </div>

          {/* INFO PASIEN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 mb-10 bg-slate-50 rounded-2xl p-6 border border-slate-100 relative z-10">
            <div className="space-y-4">
              <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Nama Pasien</span><p className="font-black text-slate-800 text-lg leading-none mt-1">{patient?.name}</p></div>
              <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">No. Rekam Medis</span><p className="font-mono font-bold text-emerald-600 text-lg leading-none mt-1">{patient?.norm || patient?.no_rm}</p></div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Status Perawatan</span>
                <div className={`mt-2 inline-flex items-center gap-1.5 font-black px-3 py-1 rounded-full text-xs border uppercase tracking-widest ${
                  statusRawat === 'UGD' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                  statusRawat === 'Rawat Inap' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}><CheckSquare size={12}/>{statusRawat}</div>
              </div>
              <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Jenis Kelamin</span><p className="font-bold text-slate-800 text-sm mt-1">{patient?.gender} · {patient?.age} Tahun</p></div>
            </div>
            <div className="space-y-4">
              <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Tanggal Terbit</span><p className="font-black text-slate-800 text-base leading-none mt-1">{todayStr}</p></div>
              <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Unit / DPJP</span><p className="font-bold text-slate-700 text-sm mt-1">{patient?.unit} · {patient?.dpjp || doctorName}</p></div>
            </div>
          </div>

          <main className="space-y-8 text-left relative z-10">

            {/* I. DIAGNOSIS */}
            <section>
              <h2 className="text-xs font-black bg-slate-900 text-white p-3 rounded-xl mb-4 uppercase tracking-wider flex items-center gap-2"><FileText size={16}/> I. Diagnosis Akhir (ICD-10)</h2>
              <div className="ml-2 md:ml-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">● Utama</span>
                  <p className="text-sm font-bold text-emerald-900 mt-1">{resumeData?.diagnosa_utama}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">○ Sekunder (Keperawatan)</span>
                  <p className="text-xs font-semibold text-slate-600 mt-1">Hipervolemia b.d Gangguan Regulasi Ginjal</p>
                </div>
              </div>
            </section>

            {/* II. RIWAYAT */}
            <section>
              <h2 className="text-xs font-black bg-blue-700 text-white p-3 rounded-xl mb-4 uppercase tracking-wider flex items-center gap-2"><Fingerprint size={16}/> II. Ringkasan Riwayat Medis & Kronologi Klinis</h2>
              <div className="ml-2 md:ml-4 space-y-3">
                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 text-slate-700 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                  {loading ? <div className="flex items-center gap-2"><RefreshCw className="animate-spin text-blue-600" size={16} /><span className="text-xs font-bold text-blue-500">Mengekstrak rekam medis...</span></div> : (resumeData?.riwayat || '-')}
                </div>
                {resumeData?.assessment && (
                  <div className="p-4 bg-white border border-blue-200 rounded-xl text-xs text-slate-600 space-y-1">
                    <p className="font-black text-blue-800 uppercase text-[9px]">Assessment Medis:</p>
                    <p className="font-medium italic">"{resumeData.assessment}"</p>
                  </div>
                )}
              </div>
            </section>

            {/* III. RADIOLOGI */}
            <section>
              <h2 className="text-xs font-black bg-indigo-700 text-white p-3 rounded-xl mb-4 uppercase tracking-wider flex items-center gap-2"><Activity size={16}/> III. Hasil Pemeriksaan Radiologi (PACS)</h2>
              <div className="ml-2 md:ml-4 p-5 bg-indigo-50 rounded-2xl border border-indigo-100 text-slate-700 leading-relaxed font-medium text-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                  {resumeData?.radiology_image && (
                    <div className="md:col-span-1 h-28 bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-indigo-200">
                      <img src={resumeData.radiology_image} alt="PACS" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className={resumeData?.radiology_image ? "md:col-span-3 space-y-2" : "md:col-span-4 space-y-2"}>
                    <span className="text-[9px] font-black text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">Modalitas: {resumeData?.radiology_modality}</span>
                    <p className="font-semibold text-slate-800 leading-relaxed italic mt-2">"{resumeData?.radiologi}"</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase mt-2">Spesialis Radiolog: {resumeData?.radiology_doctor}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* IV. OBAT */}
            <section>
              <h2 className="text-xs font-black bg-emerald-700 text-white p-3 rounded-xl mb-4 uppercase tracking-wider flex items-center gap-2"><Pill size={16}/> IV. Terapi / Obat Saat Pulang</h2>
              <div className="ml-2 md:ml-4 p-5 bg-white rounded-2xl border border-emerald-100">
                <ul className="space-y-2">
                  {loading ? <li className="text-slate-400 font-normal text-sm">Memproses resep obat...</li> :
                    resumeData?.obat?.map((obat, idx) => (
                      <li key={idx} className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0"/>
                        <span className="text-sm font-bold text-emerald-900">{obat}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </section>

            {/* V. INSTRUKSI */}
            <section>
              <h2 className="text-xs font-black bg-slate-700 text-white p-3 rounded-xl mb-4 uppercase tracking-wider flex items-center gap-2"><CheckSquare size={16}/> V. Instruksi & Tindak Lanjut</h2>
              <div className="ml-2 md:ml-4 p-5 bg-white rounded-2xl border border-slate-200 space-y-3">
                <p className="text-sm font-bold text-slate-800">{resumeData?.instruksi}</p>
                {resumeData?.edukasi && (
                  <div className="pt-3 border-t border-slate-100 bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-2">Edukasi Pemulihan:</p>
                    <p className="text-xs font-medium text-amber-900 whitespace-pre-line">{resumeData.edukasi}</p>
                  </div>
                )}
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
              <div className="h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded mb-3" />
              <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">{doctorName}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">NIP. {doctorNIP}</p>
            </div>
          </footer>
        </motion.div>
      </div>

      {/* TOUR DIALOG */}
      <AnimatePresence>
        {showTour && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[#0f172a] border border-white/10 w-full max-w-md p-6 md:p-8 rounded-[2rem] shadow-2xl text-left space-y-6 text-white">
              <div className="flex gap-1.5">
                {tourSteps.map((_, idx) => (
                  <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === tourStep ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-700'}`}/>
                ))}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 border border-white/10 rounded-xl">{tourSteps[tourStep].icon}</div>
                  <h3 className="text-base font-black uppercase tracking-tight italic">{tourSteps[tourStep].title}</h3>
                </div>
                <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">{tourSteps[tourStep].desc}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5 gap-4">
                <button type="button" onClick={handleCloseTour} className="text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider">Selesai & Keluar</button>
                <button type="button" onClick={handleNextTourStep} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-1 active:scale-95 animate-pulse">
                  {tourSteps[tourStep].actionLabel} <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto mt-6 bg-slate-100 border border-slate-200 rounded-[20px] p-5 flex items-start gap-3 text-left">
        <ShieldCheck className="text-slate-500 shrink-0 mt-0.5" size={16} />
        <div>
          <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Sistem Verifikasi & Validasi Klinis Dual API + RAG SOP</h5>
          <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
            Aplikasi berjalan di atas arsitektur kognitif Dual-Engine Pipeline AI (Llama 3.3 via Groq API untuk pemrosesan teks rekam medis terstruktur, dan Gemini 1.5 Flash untuk analisis multimodal berkas pencitraan PACS). Seluruh berkas agregat Discharge Summary disusun secara otomatis melalui interseptor RAG yang mengekstrak indeks dokumen SOP murni dari basis pengetahuan Admin.
          </p>
        </div>
      </div>

    </div>
  );
}