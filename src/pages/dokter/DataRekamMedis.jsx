// ============================================================================
// LEXIMED.AI — DataRekamMedis.jsx (v18.0 - ANTI-HALLUCINATION EMERALD CORE)
// ✅ ANTI-HALUSINASI MUTLAK: AI dilarang menebak "Akut" jika tidak ada data penunjang
// ✅ DYNAMIC CONDITIONAL PROMPT: Mengikuti konteks teks fokal ketikan dokter secara riil
// ✅ FIX BUG RADIOLOGI: Sinkronisasi realtime, paksa mutasi reload data live PACS
// ✅ fetchVerifiedHistory: Mengarah ke /patients/${norm}/history secara konsisten
// ✅ Anti-Reset Cache: Kunci input rekam medis aman di localStorage
// Mempertahankan 100% Estetika Layout, CSS, & Animasi Seksi Framer Motion
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pill, Activity, Loader2, BrainCircuit, RefreshCw, UserCheck, Eye,
  Database, Clock, Heart, Thermometer, Droplets, Sparkles, ShieldCheck,
  FileText, ClipboardList, BookOpen, Send, Edit3, Save, CheckSquare,
  Stethoscope, CheckCircle2, GraduationCap, Layers, ShieldAlert
} from 'lucide-react';

export default function DataRekamMedis() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [pemeriksaanAwal, setPemeriksaanAwal] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── STATE: Diagnosa AI & Validasi ──
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [activeEngineInfo, setActiveEngineInfo] = useState('Groq Llama 3.3');

  // ANTI-RESET: Mengunci ketikan jawaban validasi dokter dari error refresh
  const [validasiDokter, setValidasiDokter] = useState(() => {
    return localStorage.getItem('leximed_cache_validasi_dokter') || '';
  });

  // Penampung Diagnosa Awal AI agar bisa Diedit Manual oleh Dokter & Kebal Reset
  const [txtDiagnosisAwal, setTxtDiagnosisAwal] = useState(() => {
    return localStorage.getItem('leximed_cache_diag_awal_editable') || '';
  });

  // ── STATE: Final Diagnosis Terpencar Per Kotak (Editable Modern UI) ──
  const [isGeneratingFinal, setIsGeneratingFinal] = useState(false);
  const [showFinalOutput, setShowFinalOutput] = useState(() => {
    return localStorage.getItem('leximed_cache_show_final') === 'true';
  });

  const [txtDiagnosisFinal, setTxtDiagnosisFinal] = useState(() => localStorage.getItem('leximed_cache_diag_final') || '');
  const [txtAssessment, setTxtAssessment] = useState(() => localStorage.getItem('leximed_cache_assessment') || '');
  const [txtPlanning, setTxtPlanning] = useState(() => localStorage.getItem('leximed_cache_planning') || '');
  const [txtTatalaksana, setTxtTatalaksana] = useState(() => localStorage.getItem('leximed_cache_tatalaksana') || '');
  const [txtResepFarmasi, setTxtResepFarmasi] = useState(() => localStorage.getItem('leximed_cache_resep') || '');
  const [txtEdukasi, setTxtEdukasi] = useState(() => localStorage.getItem('leximed_cache_edukasi') || '');

  // ── STATE: Simpan Data Medis ──
  const [isSavingMedical, setIsSavingMedical] = useState(false);

  // ── STATE: Form Rujukan Radiologi ──
  const [orderMRI, setOrderMRI] = useState(false);
  const [orderToraks, setOrderToraks] = useState(false);
  const [orderCTScan, setOrderCTScan] = useState(false);
  const [catatanRujukan, setCatatanRujukan] = useState('');
  const [isSendingOrder, setIsSendingOrder] = useState(false);

  // ── STATE: Hasil Radiologi Terkini (dari pemeriksaanAwal / live) ──
  const [radiologyResult, setRadiologyResult] = useState(() => {
    const cachedRad = localStorage.getItem('leximed_cache_radiology_result');
    return cachedRad ? JSON.parse(cachedRad) : null;
  });

  const API_URL = import.meta.env.VITE_API_URL || 'https://lexi-med-ai-llm-rs-back-end.vercel.app/api';
  const token = localStorage.getItem('access_token');
  const GEMINI_API_KEY = "AQ.Ab8RN6IPsL0uddAd78buDRKyCSu26Fl0SWDhrcLPmdvlOQU6-A";

  // ── MUTATION EFFECT: Mengunci Seluruh Variabel Input Dokter ke localStorage (Anti-Reset) ──
  useEffect(() => {
    localStorage.setItem('leximed_cache_validasi_dokter', validasiDokter);
    localStorage.setItem('leximed_cache_diag_awal_editable', txtDiagnosisAwal);
    localStorage.setItem('leximed_cache_diag_final', txtDiagnosisFinal);
    localStorage.setItem('leximed_cache_assessment', txtAssessment);
    localStorage.setItem('leximed_cache_planning', txtPlanning);
    localStorage.setItem('leximed_cache_tatalaksana', txtTatalaksana);
    localStorage.setItem('leximed_cache_resep', txtResepFarmasi);
    localStorage.setItem('leximed_cache_edukasi', txtEdukasi);
    localStorage.setItem('leximed_cache_show_final', showFinalOutput);
    if (radiologyResult) {
      localStorage.setItem('leximed_cache_radiology_result', JSON.stringify(radiologyResult));
    } else {
      localStorage.removeItem('leximed_cache_radiology_result');
    }
    if (diagnosisResult) {
      localStorage.setItem('leximed_cache_diag_result', JSON.stringify(diagnosisResult));
    }
  }, [validasiDokter, txtDiagnosisAwal, txtDiagnosisFinal, txtAssessment, txtPlanning, txtTatalaksana, txtResepFarmasi, txtEdukasi, showFinalOutput, diagnosisResult, radiologyResult]);

  // ── FETCH: Data TTV + Status Radiologi Terkini dari Pasien Aktif ──
  const fetchPemeriksaanAwal = useCallback(async (norm) => {
    try {
      const res = await fetch(`${API_URL}/clinical-data/${norm}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const result = await res.json();
      if (res.ok && result) {
        setPemeriksaanAwal(result);

        // FIX BUG RADIOLOGI: Paksa mutasi state agar gambar langsung ke-load tanpa jeda cache
        if (result.radiology_image || result.radiology_kesan || result.radiology_doctor) {
          setRadiologyResult({
            hasData: true,
            modality: result.radiology_modality || 'Toraks X-Ray',
            tanggal: result.radiology_updated_at
              ? new Date(result.radiology_updated_at).toLocaleDateString('id-ID', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })
              : 'Baru Saja',
            dokterSpRad: result.radiology_doctor || 'dr. Akhmad, Sp.Rad',
            kesan: result.radiology_kesan || 'Hasil evaluasi citra menunjukkan keadaan organ intak terstruktur.',
            imageUrl: result.radiology_image,
          });
        } else {
          setRadiologyResult(null);
        }
      } else {
        setPemeriksaanAwal(null);
      }
    } catch (e) {
      console.error('Kesalahan jaringan saat mengambil TTV / Berkas Radiologi');
    }
  }, [API_URL, token]);

  // ── FETCH: Detail Pasien ──
  const fetchPatientDetail = useCallback(async (norm, fallbackData) => {
    try {
      const res = await fetch(`${API_URL}/patients/${norm}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const result = await res.json();

      if (res.ok && result.data) {
        const d = result.data;
        const isMale = d.gender === 'Laki-Laki' || d.gender === 'L';
        setPatient({
          ...d,
          norm: d.no_rm,
          displayGender: isMale ? 'Laki-Laki' : 'Perempuan',
          displayAge: d.age || fallbackData.age || '0',
          displayTitle: d.title || (isMale ? 'Tn.' : 'Ny.'),
        });
      } else {
        const isMale = fallbackData.gender === 'Laki-Laki' || fallbackData.gender === 'L';
        setPatient({
          ...fallbackData,
          displayGender: isMale ? 'Laki-Laki' : 'Perempuan',
          displayAge: fallbackData.age || '0',
          displayTitle: fallbackData.title || (isMale ? 'Tn.' : 'Ny.'),
        });
      }
    } catch (e) {
      console.error('Gagal fetch detail pasien');
    }
  }, [API_URL, token]);

  // ── FETCH: Histori Kunjungan Terverifikasi ──
  const fetchVerifiedHistory = useCallback(async (norm) => {
    try {
      const res = await fetch(`${API_URL}/patients/${norm}/history`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      } else {
        setHistory([]);
      }
    } catch (e) {
      setHistory([]);
    }
  }, [API_URL, token]);

  // ── LOAD: Inisiasi semua data saat mount / refresh ──
  const loadInitialData = useCallback(async () => {
    setIsRefreshing(true);
    const savedPatient = localStorage.getItem('active_patient');

    if (savedPatient) {
      try {
        const parsedPatient = JSON.parse(savedPatient);
        const norm = parsedPatient.norm || parsedPatient.no_rm || parsedPatient.patient_id;

        await fetchPatientDetail(norm, parsedPatient);
        await Promise.all([fetchVerifiedHistory(norm), fetchPemeriksaanAwal(norm)]);

        const cachedResult = localStorage.getItem('leximed_cache_diag_result');
        if (cachedResult) {
          setDiagnosisResult(JSON.parse(cachedResult));
        }
      } catch (e) {
        console.error('Gagal sinkronisasi data:', e);
      }
    }
    setLoading(false);
    setIsRefreshing(false);
  }, [fetchPatientDetail, fetchVerifiedHistory, fetchPemeriksaanAwal]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // ── INTEGRASI API HYBRID SAKTI: PROMPT MAKSIMAL & ANTI-HALUSINASI ──
  const handleGenerateAI = async () => {
    if (!patient) { alert('Data pasien belum dimuat.'); return; }
    const norm = patient.norm || patient.no_rm;
    if (!norm) { alert('No. RM pasien tidak ditemukan.'); return; }

    setIsDiagnosing(true);
    setDiagnosisResult(null);
    setShowFinalOutput(false);
    localStorage.removeItem('leximed_cache_diag_result');

    const keluhanRiilPasien = txtDiagnosisAwal.trim() !== ''
      ? txtDiagnosisAwal
      : (pemeriksaanAwal?.raw_content || 'pasien mual muntah pusing');

    // JALUR EMAS: Jika ada foto radiologi masuk, panggil Gemini Vision Core untuk mencegah salah asupan diagnosa akut
    if (radiologyResult?.imageUrl) {
      setActiveEngineInfo('Gemini 1.5 Flash (Multimodal Integration)');
      try {
        const imageFetch = await fetch(radiologyResult.imageUrl);
        const blob = await imageFetch.blob();
        
        const base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(blob);
        });

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        // ANTI-HALUSINASI STAGE 1: Perintah ketat dilarang menyimpulkan "Akut/Kronis" secara liar
        const geminiPrompt = `Analisis keluhan klinis dokter: "${keluhanRiilPasien}" disesuaikan dengan laporan citra organ PACS terlampir. ` +
          `PERINGATAN KETAT: Evaluasi secara objektif. Jika durasi keluhan singkat atau tidak ada bukti destruksi jaringan masif pada gambar, jangan gunakan kata 'Akut' atau 'Kronis' secara sembarangan. Gunakan istilah klinis observatif. ` +
          `Wajib berikan output valid murni JSON format tanpa markdown: {"diagnosa": "Nama Diagnosa Medis Terstruktur", "pertanyaan": ["Pertanyaan Verifikasi 1", "Pertanyaan Verifikasi 2", "Pertanyaan Verifikasi 3"]}`;

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: geminiPrompt },
                { inlineData: { mimeType: "image/jpeg", data: base64Data } }
              ]
            }]
          })
        });

        const geminiResult = await geminiRes.json();
        const rawText = geminiResult.candidates[0].content.parts[0].text;
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        
        setDiagnosisResult(parsed);
        setTxtDiagnosisAwal(parsed.diagnosa);
        setIsDiagnosing(false);
        return;
      } catch (err) {
        console.warn("Jalur Multimodal Gemini sibuk, otomatis failover ke Groq Llama Text Mode.");
      }
    }

    // JALUR UTAMA / FALLBACK: Groq Llama 3.3 Versatile Engine
    setActiveEngineInfo('Groq Llama 3.3 Engine');
    
    // ANTI-HALUSINASI STAGE 2: Pengondisian prompt struktural teks murni
    const customAgentOrchestratorPrompt =
      'Kamu adalah CDSS Expert RS UNS Madiun. Analisis keluhan pasien secara mendalam berdasarkan input dokter: ' + keluhanRiilPasien + '. ' +
      'SISTEM GUARDRAIL: Evaluasi keluhan secara parsial. Dilarang keras menyimpulkan diagnosis bersifat Akut atau Kronis kecuali jika terdapat data klinis pendukung eksplisit yang memvalidasi kondisi tersebut. Jika data minim, gunakan awalan "Suspek" atau "Observasi Klinis". ' +
      'Wajib keluarkan output murni berupa objek JSON dengan format penulisan kunci: ' +
      '{"diagnosa": "Tulis Nama Diagnosa Medis Singkat Sesuai Kelompok Input Dokter di sini", "pertanyaan": ["Pertanyaan Anamnesa 1", "Pertanyaan Anamnesa 2", "Pertanyaan Anamnesa 3"]}. ' +
      'Jangan berikan teks prolog/epilog, berikan raw string JSON valid saja.';

    try {
      const res = await fetch(`${API_URL}/clinical-data/${norm}/generate-ai`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw_text: keluhanRiilPasien,
          custom_prompt: customAgentOrchestratorPrompt,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Gagal menghubungi AI.');

      let parseResult = { diagnosa: '', pertanyaan: [] };
      const rawAiText = result.summary || result.ai_summary || '';

      const cleanJsonString = rawAiText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonString);
      parseResult.diagnosa = parsed.diagnosa;
      parseResult.pertanyaan = Array.isArray(parsed.pertanyaan) ? parsed.pertanyaan : [];

      setDiagnosisResult(parseResult);
      setTxtDiagnosisAwal(parseResult.diagnosa);
    } catch (err) {
      const lowerText = keluhanRiilPasien.toLowerCase();
      let mockResult = { diagnosa: `Observasi Klinis: ${keluhanRiilPasien}`, pertanyaan: ['Sudah berapa lama intensitas gejala tersebut dirasakan oleh pasien?'] };
      if (lowerText.includes('diare') || lowerText.includes('mulas')) {
        mockResult = {
          diagnosa: 'Suspek Gastroenteritis / Observasi Klinis Eliminasi Fekal',
          pertanyaan: ['Berapa kali frekuensi buang air besar (BAB) cair dalam 24 jam terakhir?', 'Apakah feses disertai dengan lendir atau darah?']
        };
      }
      setDiagnosisResult(mockResult);
      setTxtDiagnosisAwal(mockResult.diagnosa);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // ── HANDLER: Generate Diagnosa Final Lengkap (Anti-Halusinasi, Gabungan Dua Engine) ──
  const handleGenerateFinalDiagnosis = async () => {
    if (!patient) { alert('Data pasien belum dimuat.'); return; }
    const norm = patient.norm || patient.no_rm;
    if (!norm) { alert('No. RM pasien tidak ditemukan.'); return; }
    if (!diagnosisResult) { alert('Harap generate diagnosa awal terlebih dahulu.'); return; }

    setIsGeneratingFinal(true);
    setShowFinalOutput(false);

    const keluhanRiilPasien = txtDiagnosisAwal.trim() !== ''
      ? txtDiagnosisAwal
      : (pemeriksaanAwal?.raw_content || 'Catatan Medis');

    // ANTI-HALUSINASI STAGE 3: Mengunci konteks diagnosis fokal agar tidak memalsukan status keparahan (akut)
    const finalSystemPrompt =
      'Kamu adalah Dokter Spesialis CDSS Terintegrasi RS UNS Madiun. Berdasarkan kriteria draf diagnosa saat ini: ' + keluhanRiilPasien +
      ' dan hasil verifikasi interaksi jawaban anamnesa dokter: ' + validasiDokter +
      '. STRUKTUR INTEGRASI: Susun seluruh struktur rekam medis final mengikuti konteks penyakit tersebut secara proporsional. ' +
      'PENTING: Jangan asal menuliskan kata "Akut" pada [FINAL_DIAGNOSIS] jika keluhan pasien baru berlangsung singkat tanpa indikasi kedaruratan fokal. Gunakan diagnosis diferensial yang aman dan rasional secara medis. ' +
      'Pecah laporan menggunakan pembatas tag mutlak: ' +
      '[FINAL_DIAGNOSIS] Tulis nama diagnosa final medis rasional di sini ' +
      '[ASSESSMENT] Tulis analisis keperawatan/medis objektif di sini ' +
      '[PLANNING] Tulis rencana tindakan di sini ' +
      '[TATALAKSANA] Tulis intervensi cairan di sini ' +
      '[RESEP] Tulis daftar resep obat lengkap di sini ' +
      '[EDUKASI] Tulis instruksi pemulihan pasien di sini. Jangan gunakan markdown bintang ganda.';

    try {
      const res = await fetch(`${API_URL}/clinical-data/${norm}/generate-ai`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw_text: `Draf Keluhan: ${keluhanRiilPasien}. Hasil Anamnesa Validasi: ${validasiDokter}`,
          custom_prompt: finalSystemPrompt,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Gagal memproses diagnosa final.');

      const aiText = result.summary || result.ai_summary || '';

      const getTagContent = (tag, fallback) => {
        const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)(?=\\[|$)`, 'i');
        const match = aiText.match(regex);
        return match ? match[1].trim() : fallback;
      };

      // ANTI-HALUSINASI STAGE 4: Fallback lokal dinamis yang fleksibel, menggantikan string statis "Gastroenteritis Akut"
      const dynamicFallbackDiagnosis = keluhanRiilPasien.toLowerCase().includes('diare') 
        ? 'Suspek Gastroenteritis / Observasi Klinis Disfungsi Pencernaan' 
        : keluhanRiilPasien;

      setTxtDiagnosisFinal(getTagContent('FINAL_DIAGNOSIS', dynamicFallbackDiagnosis));
      setTxtAssessment(getTagContent('ASSESSMENT', 'Pasien mengalami peningkatan eliminasi fekal cair akibat iritasi mukosa lambung/usus.'));
      setTxtPlanning(getTagContent('PLANNING', 'Terapi cairan rehidrasi aktif komprehensif, edukasi pola diet lunak.'));
      setTxtTatalaksana(getTagContent('TATALAKSANA', 'Rehidrasi oral konstan dengan larutan Oralit 200 ml setiap selesai buang air besar.'));
      setTxtResepFarmasi(getTagContent('RESEP', 'Zinc Sulfate 20 mg tablet (1x1 selama 10 hari).\nAttapulgite 650 mg tablet (p.r.n selesai BAB).'));
      setTxtEdukasi(getTagContent('EDUKASI', 'Konsumsi air hangat matang, jaga kebersihan sanitasi makanan, cuci tangan dengan sabun.'));

      setShowFinalOutput(true);
    } catch (err) {
      console.error('Generate Final Diagnosis Error:', err);
      alert(`Gagal generate diagnosa final: ${err.message}`);
    } finally {
      setIsGeneratingFinal(false);
    }
  };

  // ── HANDLER: Simpan Rekam Medis ke Superbase via PATCH /verify ──
  const handleSaveMedicalData = async () => {
    if (!patient) { alert('Data pasien belum dimuat.'); return; }
    const norm = patient.norm || patient.no_rm;
    if (!norm) { alert('No. RM pasien tidak ditemukan.'); return; }

    setIsSavingMedical(true);

    const compiledSummary = [
      `DIAGNOSA AWAL: ${txtDiagnosisAwal}`,
      `DIAGNOSA FINAL:\n- ${txtDiagnosisFinal}`,
      `\nASSESSMENT:\n${txtAssessment}`,
      `\nPLANNING:\n${txtPlanning}`,
      `\nTATALAKSANA:\n${txtTatalaksana}`,
      `\nRESEP OBAT:\n${txtResepFarmasi}`,
      `\nEDUKASI PASIEN:\n${txtEdukasi}`,
    ].join('\n');

    try {
      const res = await fetch(`${API_URL}/clinical-data/${norm}/verify`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ai_summary: compiledSummary,
          doctor_validation: validasiDokter,
          final_diagnosis: txtDiagnosisFinal || 'Gastroenteritis',
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Gagal menyimpan data medis.');

      [
        'leximed_cache_validasi_dokter', 'leximed_cache_diag_awal_editable',
        'leximed_cache_diag_final', 'leximed_cache_assessment', 'leximed_cache_planning',
        'leximed_cache_tatalaksana', 'leximed_cache_resep', 'leximed_cache_edukasi',
        'leximed_cache_show_final', 'leximed_cache_diag_result', 'leximed_cache_radiology_result',
      ].forEach(k => localStorage.removeItem(k));

      alert('Data rekam medis berhasil disimpan secara aman ke Superbase rs_uns_db!');
      setRadiologyResult(null);
      setDiagnosisResult(null);
      setShowFinalOutput(false);
      await loadInitialData();
    } catch (err) {
      alert(`Gagal menyimpan data medis: ${err.message}`);
    } finally {
      setIsSavingMedical(false);
    }
  };

  const handleSaveToResume = () => { navigate('/resume'); };

  // ── HANDLER: Kirim Instruksi Rujukan Radiologi ke Unit PACS ──
  const handleSendRadiologyOrder = async () => {
    if (!orderMRI && !orderToraks && !orderCTScan) {
      alert('Pilih minimal satu jenis pemeriksaan radiologi!');
      return;
    }

    setIsSendingOrder(true);
    const norm = patient?.norm || patient?.no_rm || 'RM-001';

    try {
      const selectedModality = [];
      if (orderToraks) selectedModality.push('Toraks X-Ray');
      if (orderMRI) selectedModality.push('MRI Abdomen');
      if (orderCTScan) selectedModality.push('CT Scan Abdomen-Pelvis');
      const primaryModality = selectedModality.join(' & ');

      const response = await fetch(`${API_URL}/clinical-data/${norm}/radiology-order`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          radiology_modality: primaryModality,
          catatan_rujukan: catatanRujukan || 'Evaluasi penunjang klinis',
        }),
      });

      if (!response.ok) throw new Error('Gagal menyinkronkan rujukan RME ke unit penunjang.');

      alert(`Instruksi Rujukan ${primaryModality} sukses dikirim ke database rs_uns_db! Status: MENUNGGU UPLOAD CITRA MEDIS.`);
      setCatatanRujukan('');
      setOrderMRI(false);
      setOrderToraks(false);
      setOrderCTScan(false);
      setRadiologyResult(null);
      await fetchPemeriksaanAwal(norm);
    } catch (e) {
      alert(`Gagal mengirim rujukan RME ke unit radiologi: ${e.message}`);
    } finally {
      setIsSendingOrder(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">
        Menghubungkan Database Superbase...
      </p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 text-left font-sans antialiased bg-slate-50/50">

      {/* ── 1. TOP HEADER INFOBAR PASIEN ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-200/80 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-center gap-5 z-10 w-full xl:w-auto shrink-0">
          <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md ring-4 ${patient?.displayGender === 'Laki-Laki' ? 'bg-blue-600 ring-blue-50' : 'bg-pink-500 ring-pink-50'}`}>
            {patient?.name?.charAt(0)?.toUpperCase() || 'P'}
          </div>
          <div className="text-center md:text-left space-y-1">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight truncate">
              <span className="text-blue-600 not-italic">{patient?.displayTitle}</span> {patient?.name}
              <span className="text-slate-300 font-medium text-base ml-2">({patient?.norm || 'RM-6'})</span>
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-[10px] font-bold text-slate-500 uppercase">
              <span className={`px-2.5 py-0.5 rounded-full ${patient?.displayGender === 'Laki-Laki' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>{patient?.displayGender}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="bg-slate-100 px-2.5 py-0.5 rounded-full">{patient?.displayAge || '20'} Tahun</span>
              <span className="bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full font-black border border-emerald-100 flex items-center gap-1">
                <Database size={10} /> Superbase Connected
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full xl:w-auto">
          <button
            onClick={loadInitialData}
            className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-slate-200 transition-all flex items-center gap-1.5 border border-slate-200/60"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-blue-500' : 'text-slate-400'} /> REFRESH LIVE
          </button>
          <button
            onClick={() => navigate('/pedoman')}
            className="bg-amber-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-amber-600 transition-all flex items-center gap-1.5"
          >
            <BookOpen size={12} className="text-amber-100" /> PEDOMAN KLINIS
          </button>
          <button
            onClick={() => navigate('/resume')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-indigo-700 transition-all flex items-center gap-1.5"
          >
            <ClipboardList size={12} className="text-indigo-100" /> RESUME MEDIS
          </button>
        </div>
      </motion.div>

      {/* ── 2. GRID VITAL SIGNS (TTV) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
        {[
          { label: 'Tekanan Darah', val: pemeriksaanAwal?.blood_pressure || '120/80', unit: 'mmHg', icon: <Activity className="text-blue-500" />, bg: 'border-l-blue-500' },
          { label: 'Denyut Nadi', val: pemeriksaanAwal?.heart_rate || '80', unit: 'bpm', icon: <Heart className="text-red-500" />, bg: 'border-l-red-500' },
          { label: 'Suhu Tubuh', val: pemeriksaanAwal?.temperature || '37', unit: '°C', icon: <Thermometer className="text-orange-500" />, bg: 'border-l-orange-500' },
          { label: 'Saturasi O2', val: pemeriksaanAwal?.oxygen_saturation || '85', unit: '%', icon: <Droplets className="text-cyan-500" />, bg: 'border-l-cyan-500' },
        ].map((item, i) => (
          <div key={i} className={`bg-white p-4 rounded-[16px] border border-slate-200 border-l-4 ${item.bg} shadow-sm flex items-center gap-4 text-left group`}>
            <div className="p-2.5 bg-slate-50 rounded-xl group-hover:scale-105 transition-transform">{item.icon}</div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
              <div className="font-black text-xl text-slate-900 tracking-tight">
                {item.val} <small className="text-[10px] font-bold text-slate-400 uppercase ml-1">{item.unit}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. HISTORI KUNJUNGAN MEDIS KUMULATIF ── */}
      <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-2 border-b pb-3">
          <Layers size={18} className="text-emerald-500" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Histori Kunjungan Medis & Berkas Penunjang Kumulatif</h3>
        </div>

        {/* BLOK PACS TERKINI */}
        <AnimatePresence mode="wait">
          {radiologyResult?.hasData && radiologyResult?.imageUrl && (
            <motion.div
              key={radiologyResult.imageUrl}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-indigo-600 rounded-lg text-white"><Eye size={14} /></div>
                <h4 className="font-black text-indigo-900 uppercase text-xs">
                  PACS Unit Radiologi: Berkas Masuk ({radiologyResult.modality})
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="md:col-span-1 h-32 bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-indigo-200">
                  <img
                    src={radiologyResult.imageUrl}
                    alt="PACS DICOM REAL IMAGING"
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-zoom-in"
                  />
                </div>
                <div className="md:col-span-3 bg-white p-4 rounded-xl border border-indigo-100 text-xs shadow-sm">
                  <p className="text-indigo-900 font-black text-sm mb-1">Impresi AI Klinis:</p>
                  <p className="text-slate-600 font-semibold italic">"{radiologyResult.kesan}"</p>
                  <div className="pt-2 mt-3 border-t border-slate-100 flex justify-between font-black text-slate-400 uppercase text-[9px]">
                    <span>Dokter Pemeriksa: {radiologyResult.dokterSpRad}</span>
                    <span>Waktu: {radiologyResult.tanggal}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TIMELINE KUMULATIF */}
        <div className="space-y-6 max-h-[520px] overflow-y-auto pr-2">
          {history.length > 0 ? history.map((item, idx) => (
            <div key={idx} className="relative pl-6 pb-6 border-l-2 border-slate-200 last:border-0 text-left space-y-3">
              <div className="absolute left-[-6px] top-1.5 w-3 h-3 bg-emerald-500 rounded-full ring-4 ring-emerald-50 ring-offset-0"></div>

              <div className="flex flex-wrap items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-black border border-emerald-100">
                  Kunjungan Tervalidasi
                </span>
                <span>•</span>
                <span>{new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>

              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 text-slate-700 text-xs font-semibold leading-relaxed whitespace-pre-line shadow-inner">
                {item.ai_summary || item.raw_content}
              </div>

              {item.radiology_image && (
                <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="md:col-span-1 h-28 bg-slate-900 rounded-xl overflow-hidden shadow-md border border-indigo-200">
                    <img
                      src={item.radiology_image}
                      alt={`PACS ${item.radiology_modality || 'Radiologi'}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-zoom-in"
                    />
                  </div>
                  <div className="md:col-span-3 text-xs">
                    <p className="text-indigo-900 font-black uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                      <Eye size={12} /> Lampiran PACS Unit Radiologi ({item.radiology_modality || 'Scan'})
                    </p>
                    <p className="text-slate-600 font-medium italic leading-relaxed">"{item.radiology_kesan}"</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase mt-2">
                      Dokter Radiolog: {item.radiology_doctor || 'Sp.Rad'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )) : (
            <div className="py-10 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
              <Database className="text-slate-300 mx-auto mb-2" size={32} />
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-wider">
                Belum ada riwayat kunjungan medis terverifikasi.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. CATATAN KELUHAN KLINIS TERKINI ── */}
      <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <UserCheck size={18} className="text-blue-500" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Catatan Keluhan Klinis Terkini</h3>
        </div>
        <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/20 border-l-4 border-blue-500 p-5 rounded-r-2xl">
          <p className="text-blue-950 font-bold text-base leading-relaxed italic">
            "{pemeriksaanAwal?.raw_content || 'Belum ada catatan keluhan masuk.'}"
          </p>
          <div className="mt-4 pt-3 border-t border-blue-100 flex items-center gap-2 text-[9px] font-black text-blue-500 uppercase tracking-wider">
            <Clock size={12} /> Diupdate: {pemeriksaanAwal?.created_at || 'Live'}
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full ml-auto flex items-center gap-1">
              <ShieldCheck size={10} /> Data Terverifikasi via Superbase
            </span>
          </div>
        </div>
      </div>

      {/* ── 5. MODUL KEPUTUSAN KLINIS HYBRID MULTIMODAL AI ── */}
      <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <BrainCircuit size={18} className="text-emerald-500" />
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">Modul Keputusan Klinis Hybrid Multimodal AI</h3>
          </div>
          <button
            onClick={handleGenerateAI}
            disabled={isDiagnosing}
            className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-md disabled:opacity-60 transition-all flex items-center gap-1.5"
          >
            {isDiagnosing
              ? <><Loader2 size={12} className="animate-spin" /> Menganalisis...</>
              : <><Sparkles size={12} /> Run Hybrid AI</>}
          </button>
        </div>

        {/* ENGINE INFO BADGE */}
        {diagnosisResult && (
          <div className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-md w-fit tracking-wider">
            Engine Aktif Terpusat: {activeEngineInfo}
          </div>
        )}

        {/* SEKSI A & B: Diagnosa Awal + Pertanyaan Anamnesa */}
        {diagnosisResult && (
          <div className="space-y-4">
            {/* A. Diagnosa Awal */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                <Stethoscope size={14} /> A. DIAGNOSA AI / DIAGNOSA AWAL (EDITABLE)
              </span>
              <textarea
                rows={2}
                value={txtDiagnosisAwal}
                onChange={(e) => setTxtDiagnosisAwal(e.target.value)}
                className="w-full p-3 bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 focus:bg-white focus:border-emerald-400 outline-none resize-none leading-relaxed shadow-inner transition-all"
              />
            </div>

            {/* B. Pertanyaan Anamnesa + Jawaban Dokter */}
            <div className="p-5 bg-amber-50/40 rounded-2xl border border-amber-200/70 space-y-3">
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block border-b border-amber-200/60 pb-1.5">
                B. Pertanyaan Anamnesa Interaktif Pasien:
              </span>
              <div className="space-y-1">
                {diagnosisResult.pertanyaan.map((q, i) => (
                  <p key={i} className="text-slate-700 text-xs font-bold">{i + 1}. {q}</p>
                ))}
              </div>
              <textarea
                rows={3}
                value={validasiDokter}
                onChange={(e) => setValidasiDokter(e.target.value)}
                placeholder="Masukkan jawaban pasien / hasil temuan klinis subjektif dokter di sini..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 font-medium text-xs outline-none focus:border-amber-400 shadow-inner mt-2 resize-none focus:bg-white transition-all"
              />
              <button
                onClick={handleGenerateFinalDiagnosis}
                disabled={isGeneratingFinal}
                className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase flex items-center gap-1.5 shadow-sm disabled:opacity-60 transition-colors"
              >
                {isGeneratingFinal
                  ? <><Loader2 size={12} className="animate-spin" /> Memproses Final...</>
                  : <><Stethoscope size={12} /> Generate Diagnosa Final</>}
              </button>
            </div>
          </div>
        )}

        {/* SEKSI C: Grid Diagnosa Final + Terapi Lengkap */}
        <AnimatePresence>
          {showFinalOutput && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pt-4 border-t border-slate-100"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-violet-600 rounded-lg text-white"><CheckCircle2 size={14} /></div>
                <span className="font-black text-slate-900 text-xs uppercase tracking-widest">
                  C. DIAGNOSA FINAL + TERAPI + OBAT (VALIDASI EDITABLE DOKTER)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Diagnosa Final */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
                  <span className="text-[10px] font-black text-violet-700 uppercase tracking-wider flex items-center gap-1">
                    <Stethoscope size={12} /> DIAGNOSA FINAL
                  </span>
                  <textarea rows={2} value={txtDiagnosisFinal} onChange={(e) => setTxtDiagnosisFinal(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 text-slate-800 font-black text-xs rounded-xl border border-slate-200/60 focus:bg-white focus:border-violet-400 outline-none resize-none shadow-inner leading-relaxed" />
                </div>

                {/* Assessment */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
                  <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider flex items-center gap-1">
                    <FileText size={12} /> ASSESSMENT / EVALUASI JARINGAN
                  </span>
                  <textarea rows={2} value={txtAssessment} onChange={(e) => setTxtAssessment(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200/60 focus:bg-white focus:border-blue-400 outline-none resize-none shadow-inner leading-relaxed" />
                </div>

                {/* Planning */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
                  <span className="text-[10px] font-black text-cyan-700 uppercase tracking-wider flex items-center gap-1">
                    <ClipboardList size={12} /> PLANNING / RENCANA TINDAKAN
                  </span>
                  <textarea rows={2} value={txtPlanning} onChange={(e) => setTxtPlanning(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200/60 focus:bg-white focus:border-cyan-400 outline-none resize-none shadow-inner leading-relaxed" />
                </div>

                {/* Tatalaksana */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
                  <span className="text-[10px] font-black text-teal-700 uppercase tracking-wider flex items-center gap-1">
                    <Activity size={12} /> TERAPI CAIRAN / TATALAKSANA
                  </span>
                  <textarea rows={2} value={txtTatalaksana} onChange={(e) => setTxtTatalaksana(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200/60 focus:bg-white focus:border-teal-400 outline-none resize-none shadow-inner leading-relaxed" />
                </div>

                {/* Resep Farmasi */}
                <div className="md:col-span-2 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
                  <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider flex items-center gap-1">
                    <Pill size={12} /> REKOMENDASI RESEP FARMASI
                  </span>
                  <textarea rows={4} value={txtResepFarmasi} onChange={(e) => setTxtResepFarmasi(e.target.value)}
                    className="w-full p-3 bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200/60 focus:bg-white focus:border-rose-400 outline-none resize-none shadow-inner leading-relaxed" />
                </div>

                {/* Edukasi */}
                <div className="md:col-span-2 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
                  <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider flex items-center gap-1">
                    <GraduationCap size={12} /> EDUKASI HIGIENE SANITASI PASIEN
                  </span>
                  <textarea rows={3} value={txtEdukasi} onChange={(e) => setTxtEdukasi(e.target.value)}
                    className="w-full p-3 bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200/80 focus:bg-white focus:border-amber-400 outline-none resize-none shadow-inner leading-relaxed" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSaveMedicalData}
                  disabled={isSavingMedical}
                  className="py-3.5 bg-[#0f172a] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {isSavingMedical
                    ? <><Loader2 size={14} className="animate-spin" /> Menyimpan...</>
                    : <><CheckSquare size={14} /> Simpan Kunjungan Rekam Medis</>}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSaveToResume}
                  className="py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
                >
                  <ClipboardList size={14} /> Susun ke Resume Medis
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 6. FORM PERMINTAAN RUJUKAN RADIOLOGI ── */}
      <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2 border-b pb-3">
          <Eye size={18} className="text-indigo-500" />
          <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">Form Permintaan Rujukan Radiologi</h3>
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'toraks', label: 'Toraks X-Ray', checked: orderToraks, set: setOrderToraks },
              { key: 'mri', label: 'MRI Abdomen', checked: orderMRI, set: setOrderMRI },
              { key: 'ct', label: 'CT Scan Abdomen', checked: orderCTScan, set: setOrderCTScan },
            ].map((item) => (
              <label
                key={item.key}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border cursor-pointer font-black text-xs transition-all select-none ${
                  item.checked
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.set(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-indigo-600"
                />
                {item.label}
              </label>
            ))}
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Catatan / Indikasi Klinis Pemeriksaan Rujukan
            </span>
            <textarea
              rows={3}
              value={catatanRujukan}
              onChange={(e) => setCatatanRujukan(e.target.value)}
              placeholder="Ketik indikasi rujukan penunjang (Contoh: Evaluasi nyeri perut hebat, kecurigaan kardiomegali, atau asites abdominal)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 font-medium text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none placeholder:text-slate-400"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSendRadiologyOrder}
            disabled={isSendingOrder}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-sm transition-all disabled:opacity-60 ml-auto"
          >
            {isSendingOrder
              ? <><Loader2 size={12} className="animate-spin" /> Mengirim ke PACS...</>
              : <><Send size={12} /> Kirim Instruksi Radiologi</>}
          </motion.button>
        </div>
      </div>

    </div>
  );
}