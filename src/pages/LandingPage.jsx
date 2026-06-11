// ============================================================================
// LEXIMED.AI — LandingPage.jsx (v8.7 - FIXED & ENHANCED ANIMATIONS)
// ✅ FIX: staggerContainer & fadeUp didefinisikan ulang (hilang di v8.6)
// ✅ FIX: handleAgentSend dikembalikan (hilang di v8.6)
// ✅ FIX: modulo interval problems pakai problems.length (anti out-of-bounds)
// ✅ ENHANCEMENT: tambahan animasi — gradient pan, glow pulse, underline hover,
//    badge shimmer, scroll progress bar, icon hover wiggle, card tilt halus
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, Zap, Activity, Cpu, Mail, Phone,
  Database, FileText, Menu, X, Stethoscope, Microscope, LineChart, Lock,
  ChevronRight, BrainCircuit, TerminalSquare,
  Send, Bot, Sparkles, ClipboardList,
  AlertTriangle, Clock, FileX,
  BookOpen, FlaskConical, Globe, BarChart3, Layers, Heart
} from 'lucide-react';

// ── PARAMETER ANIMASI: DNA Helix Loader ──
const DNAHelix = () => (
  <div className="flex items-center gap-0.5 h-5">
    {Array.from({ length: 8 }, (_, i) => (
      <motion.div
        key={i}
        className="w-1.5 rounded-full bg-emerald-400"
        animate={{ scaleY: [0.3, 1.5, 0.3], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

// ── PARAMETER ANIMASI: Typewriter ──
const TypewriterText = ({ texts, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    const full = texts[currentIndex];
    const speed = isDeleting ? 40 : 80;
    const timer = setTimeout(() => {
      if (!isDeleting) {
        setCurrentText(full.slice(0, currentText.length + 1));
        if (currentText.length === full.length) setTimeout(() => setIsDeleting(true), 2000);
      } else {
        setCurrentText(full.slice(0, currentText.length - 1));
        if (currentText.length === 0) { setIsDeleting(false); setCurrentIndex((prev) => (prev + 1) % texts.length); }
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentIndex, texts]);
  return (
    <span className={className}>
      {currentText}
      <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="inline-block w-0.5 h-4 bg-emerald-400 ml-0.5 align-middle" />
    </span>
  );
};

// ── PARAMETER ANIMASI: Floating Particles ──
const FloatingParticles = () => {
  const particles = Array.from({ length: 25 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${i % 3 === 0 ? 'bg-emerald-400/20 w-1 h-1' : i % 3 === 1 ? 'bg-blue-400/15 w-1.5 h-1.5' : 'bg-violet-400/10 w-0.5 h-0.5'}`}
          style={{ left: `${(i * 4.1) % 100}%`, top: `${(i * 6.7) % 100}%` }}
          animate={{
            y: [-15 - (i % 20), 15 + (i % 15), -15 - (i % 20)],
            x: [-(i % 8), (i % 6), -(i % 8)],
            opacity: [0.1, 0.5, 0.1],
            scale: [1, 1.6, 1],
          }}
          transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.25 }}
        />
      ))}
    </div>
  );
};

// ── PARAMETER ANIMASI: Floating Medical Icons Background ──
const FloatingMedicalIcons = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-10">
      <motion.div animate={{ y: [0, -30, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-20 left-[10%] text-emerald-500"><Activity size={64} /></motion.div>
      <motion.div animate={{ y: [0, 40, 0], rotate: [0, -15, 15, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-40 right-[15%] text-blue-500"><Heart size={80} /></motion.div>
      <motion.div animate={{ y: [0, -50, 0], rotate: [0, 20, 0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute top-1/2 left-[80%] text-rose-500"><Stethoscope size={70} /></motion.div>
    </div>
  );
};

// ── PARAMETER ANIMASI: Magnetic Hover Card ──
const MagneticCard = ({ children, className }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-50, 50], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-50, 50], [-8, 8]), { stiffness: 200, damping: 20 });

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      whileHover={{ scale: 1.02 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ── PARAMETER ANIMASI: Jurnal Citation Ticker ──
const JurnalTicker = () => {
  const journals = [
    'Kurnia (n.d.) — Tantangan AI dalam Manajemen RS',
    'Singhal et al. (2023) — LLM Encode Clinical Knowledge',
    'Wornow et al. (n.d.) — Shaky Foundations LLM for EHR',
    'Gao et al. (n.d.) — RAG for Large Language Models Survey',
    'Dietler et al. (2019) — Health in SDGs 2030',
    'JUTEKOM (2026) — Transformasi SI ke Sistem Cerdas',
    'Orfanou et al. (2015) — Usability Evaluation SUS',
    'Jdih.Kemkes (2022) — Regulasi RME Indonesia',
  ];
  return (
    <div className="overflow-hidden relative w-full py-4 border-y border-white/5 bg-slate-950/40">
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-[#020617] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-[#020617] to-transparent pointer-events-none" />
      <motion.div className="flex gap-8 whitespace-nowrap" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}>
        {[...journals, ...journals].map((j, i) => (
          <span key={i} className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 inline-block"
              animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: (i % 8) * 0.2 }}
            />
            {j}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

// ── PARAMETER ANIMASI: Nav Link dengan Underline Animasi ──
const NavLink = ({ onClick, children }) => (
  <button onClick={onClick} className="relative group hover:text-emerald-400 transition-colors py-1">
    {children}
    <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-emerald-400 transition-all duration-300 group-hover:w-full" />
  </button>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [agentSimMessage, setAgentSimMessage] = useState(0);
  const [activeProblem, setActiveProblem] = useState(0);

  const heroRef = useRef(null);
  const fiturRef = useRef(null);
  const arsitekturRef = useRef(null);
  const caraKerjaRef = useRef(null);
  const agentRef = useRef(null);
  const problemRef = useRef(null);
  const jurnalRef = useRef(null);
  const chatContainerRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const yPos = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const scaleProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const [agentInput, setAgentInput] = useState('');
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentRole, setAgentRole] = useState('dokter');
  const [agentMessages, setAgentMessages] = useState([
    {
      sender: 'bot',
      text: '👋 Halo! Saya adalah **LexiCore Agent** — AI multi-role CDSS dari LexiMed.ai.\n\nCoba tanya saya:\n• "Apa itu LexiMed?"\n• "Bagaimana cara kerja penapisan RAG?"\n• "Apa fungsi VoltAgent?"\n• "Apakah sistem ini aman?"'
    }
  ]);

  const formatAgentText = (text) => {
    if (!text) return '';
    return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-emerald-400">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  // ── ANIMASI VARIANTS ──
  const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.12 } } };
  const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50, damping: 14 } } };

  const simTexts = [
    { label: 'VoltAgent [Radiology Node]:', text: 'Mengisolasi draf korelasi infiltrat paru pasien... Berhasil.', color: 'text-teal-400' },
    { label: 'OpenClaw Middleware:', text: 'Injeksi rekam medis transaksional ke Supabase cloud tervalidasi.', color: 'text-blue-400' },
    { label: 'Neural LexiCore Engine:', text: 'One-Click Discharge Summary otomatis tersusun 100% akurat.', color: 'text-emerald-400' },
  ];

  const roleConfigs = {
    dokter: { name: 'Doctor CDSS Node', icon: '🩺' },
    radiologi: { name: 'Radiology Expert Node', icon: '☢️' },
    admin: { name: 'System IT Node', icon: '⚡' },
  };

  const jurnalRefs = [
    { id: 0, key: 'Kurnia (n.d.)', icon: <BrainCircuit size={20} />, color: 'text-rose-400', border: 'border-rose-500/25', bg: 'bg-rose-500/[0.03]', badge: 'bg-rose-500/10 border-rose-500/20 text-rose-400', title: 'Tantangan AI dalam Manajemen RS', full: 'Kurnia, J. A. (n.d.). Tantangan Penerapan AI (Artificial Intelligence) dalam Manajemen Rumah Sakit: Literature Review terhadap Aspek Data, Teknologi, Etika, dan Regulasi. 2(1), 1063–1071.', kontribusi: 'Menjadi landasan utama rumusan masalah penelitian. Mengidentifikasi 4 tantangan nyata AI di RS Indonesia: data tidak terstruktur, infrastruktur lemah, ketidakjelasan etika, dan minimnya regulasi.', relevansi: 'Langsung mendukung Problem Statement LexiMed.ai tentang gap implementasi AI di fasilitas kesehatan Indonesia.' },
    { id: 1, key: 'Singhal et al. (2023)', icon: <FlaskConical size={20} />, color: 'text-teal-400', border: 'border-teal-500/25', bg: 'bg-teal-500/[0.03]', badge: 'bg-teal-500/10 border-teal-500/20 text-teal-400', title: 'LLM Encode Clinical Knowledge', full: 'Singhal, K., Azizi, S., Tu, T., et al. (2023). Large Language Models Encode Clinical Knowledge. 620(January).', kontribusi: 'Membuktikan secara empiris bahwa LLM memiliki kapabilitas menyandikan pengetahuan klinis secara signifikan. Menjadi fondasi ilmiah penggunaan AI generatif untuk diagnosis berbasis teks medis.', relevansi: 'Mendukung komponen CDSS dual-AI (Groq + Gemini) pada LexiMed.ai — bahwa AI benar-benar mampu mendukung keputusan klinis dokter.' },
    { id: 2, key: 'Wornow et al. (n.d.)', icon: <AlertTriangle size={20} />, color: 'text-amber-400', border: 'border-amber-500/25', bg: 'bg-amber-500/[0.03]', badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400', title: 'Shaky Foundations LLM for EHR', full: 'Wornow, M., Xu, Y., Thapa, R., Patel, B., Steinberg, E., & Fleming, S. (n.d.). The Shaky Foundations of Large Language Models and Foundation Models for Electronic Health Records. 1–10. DOI:10.1038/s41746-023-00879-8.', kontribusi: 'Mengungkap secara kritis keterbatasan dan risiko penggunaan LLM pada Rekam Medis Elektronik: halusinasi data klinis, bias training data, dan kurangnya validasi domain spesifik.', relevansi: 'Memperkuat urgensi fitur safety-net LexiMed — mengapa dibutuhkan Gemini sebagai conservative reviewer atas output Groq (dual-AI redundancy).' },
    { id: 3, key: 'Gao et al. (n.d.)', icon: <Database size={20} />, color: 'text-blue-400', border: 'border-blue-500/25', bg: 'bg-blue-500/[0.03]', badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400', title: 'RAG for Large Language Models: A Survey', full: 'Gao, Y., Xiong, Y., Gao, X., Jia, K., Pan, J., Bi, Y., Sun, J., & Wang, H. (n.d.). Retrieval-Augmented Generation for Large Language Models: A Survey.', kontribusi: 'Menyediakan kerangka teknis arsitektur RAG sebagai metode peningkatan akurasi LLM melalui retrieval basis pengetahuan eksternal — mengatasi keterbatasan model yang hanya mengandalkan parameter training.', relevansi: 'Dasar teknis implementasi Knowledge Base RAG (PPK/SOP/ICD) pada VoltAgent Pipeline LexiMed.ai untuk mengurangi halusinasi klinis.' },
    { id: 4, key: 'Jdih.Kemkes (2022)', icon: <FileText size={20} />, color: 'text-orange-400', border: 'border-orange-500/25', bg: 'bg-orange-500/[0.03]', badge: 'bg-orange-500/10 border-orange-500/20 text-orange-400', title: 'Permenkes No.24/2022 — RME Wajib', full: 'Jdih.Kemkes.Go.Id. (2022). Peraturan Menteri Kesehatan No.24 Tahun 2022 tentang Rekam Medis. 1–16.', kontribusi: 'Payung hukum utama yang mewajibkan seluruh fasilitas kesehatan Indonesia menerapkan RME paling lambat 31 Desember 2023. Memberikan legitimasi regulasi terhadap pengembangan sistem RME berbasis AI.', relevansi: 'Mengukuhkan kebutuhan mendesak solusi RME seperti LexiMed.ai di RS Indonesia sebagai kewajiban hukum, bukan sekadar inovasi opsional.' },
    { id: 5, key: 'JUTEKOM (2026)', icon: <Layers size={20} />, color: 'text-violet-400', border: 'border-violet-500/25', bg: 'bg-violet-500/[0.03]', badge: 'bg-violet-500/10 border-violet-500/20 text-violet-400', title: 'Transformasi SI Menjadi Sistem Cerdas', full: 'Pengambilan, M., & Dan, K. (2026). JUTEKOM: Transformasi Sistem Informasi Menjadi Sistem Cerdas untuk Pengambilan Keputusan. 02(01), 51–58. DOI:10.65258/jutekom.v2.i1.53.', kontribusi: 'Memberikan kerangka konseptual transformasi SIMRS konvensional menjadi sistem berbasis kecerdasan buatan dengan kemampuan pengambilan keputusan otonom. Memetakan tahapan migrasi dari SI pasif ke SI adaptif.', relevansi: 'Mendukung positioning LexiMed.ai sebagai solusi transformasi — bukan sekadar digitalisasi formulir, melainkan sistem cerdas yang mampu berpikir.' },
    { id: 6, key: 'Orfanou et al. (2015)', icon: <BarChart3 size={20} />, color: 'text-pink-400', border: 'border-pink-500/25', bg: 'bg-pink-500/[0.03]', badge: 'bg-pink-500/10 border-pink-500/20 text-pink-400', title: 'Perceived Usability Evaluation SUS', full: 'Orfanou, K., Tselios, N., & Katsanos, C. (2015). Perceived Usability Evaluation of Learning Management Systems: Empirical Evaluation of the System Usability Scale. 16(2), 227–246.', kontribusi: 'Menyediakan metodologi evaluasi usability menggunakan System Usability Scale (SUS) yang terstandarisasi. Menetapkan benchmark skor ≥70 sebagai sistem "acceptable" dan ≥85 sebagai "excellent".', relevansi: 'Digunakan sebagai instrumen evaluasi antarmuka LexiMed.ai — mengukur apakah sistem AI berbasis web mudah digunakan oleh tenaga medis yang bukan berlatar teknologi.' },
    { id: 7, key: 'Dietler et al. (2019)', icon: <Globe size={20} />, color: 'text-green-400', border: 'border-green-500/25', bg: 'bg-green-500/[0.03]', badge: 'bg-green-500/10 border-green-500/20 text-green-400', title: 'Health in SDGs 2030 Agenda', full: 'Dietler, D., Leuenberger, A., Bempong, N., et al. (2019). Health in the 2030 Agenda for Sustainable Development: From Framework to Action. 9(2), 1–6. DOI:10.7189/jogh.09.020201.', kontribusi: 'Menetapkan konteks global transformasi kesehatan menuju SDG 3 (Good Health and Well-Being). Mengidentifikasi transformasi sistem kesehatan berbasis teknologi sebagai strategi kunci pencapaian target SDGs.', relevansi: 'Memberikan landasan makro penelitian — LexiMed.ai adalah bentuk konkret kontribusi lokal terhadap agenda transformasi kesehatan global SDGs.' },
  ];

  const problems = [
    {
      id: 0, icon: <Clock size={28} />, color: 'text-rose-400', borderColor: 'border-rose-500/30', bgColor: 'bg-rose-500/[0.03]',
      badgeColor: 'bg-rose-500/10 border-rose-500/20 text-rose-400', glowColor: 'shadow-[0_0_30px_rgba(244,63,94,0.1)]',
      title: 'Beban Dokumentasi Manual Menyita Waktu Klinis',
      desc: 'Kurnia (n.d.) mengidentifikasi beban dokumentasi manual sebagai tantangan utama aspek teknologi penerapan AI di manajemen RS Indonesia. Pengisian rekam medis manual yang tidak terstruktur dan berulang memperburuk kelelahan profesional (burnout) tenaga medis, menghabiskan rata-rata 40% jam kerja dokter pelaksana.',
      source: '📚 Kurnia (n.d.) — Tantangan AI Manajemen RS | IDI Junior Doctors Network',
      problems: ['Menulis ulang anamnesa berkali-kali di formulir berbeda', 'Formulir kertas mudah rusak atau tidak terbaca', 'Beban administrasi menyita fokus interaksi riil pasien'],
      solution: 'Otomatisasi draf dokumen medis via interseptor VoltAgent Pipeline. Sistem mengonversi catatan keluhan mentah langsung menjadi ringkasan rekam medis siap validasi.',
      solutionIcon: <Zap size={16} />,
    },
    {
      id: 1, icon: <AlertTriangle size={28} />, color: 'text-amber-400', borderColor: 'border-amber-500/30', bgColor: 'bg-amber-500/[0.03]',
      badgeColor: 'bg-amber-500/10 border-amber-500/20 text-amber-400', glowColor: 'shadow-[0_0_30px_rgba(245,158,11,0.1)]',
      title: 'Risiko Halusinasi AI & Medical Error Pada Model EHR',
      desc: 'Wornow et al. (n.d.) membuktikan bahwa model LLM generatif memiliki batasan akurasi pada pengolahan EHR, memicu risiko halusinasi data klinis jika dilepas tanpa calibration domain medis yang spesifik. Tanpa sistem pengaman ganda, otomasi AI berisiko fatal pada akurasi dosis obat.',
      source: '📚 Wornow et al. (n.d.) — The Shaky Foundations of Large Language Models for EHR',
      problems: ['Kecenderungan LLM menyimpulkan diagnosis tanpa data klinis pendukung', 'Risiko fatal halusinasi resep obat jika tidak dikontrol parameter ketat', 'Kurangnya interseptor bukti medis terpusat'],
      solution: 'Sistem CDSS Dual-API Redundancy: Model Llama 3.3 dikontrol ketat oleh interseptor Gemini Core sebagai conservative reviewer, dipadukan basis pengetahuan RAG patuh SOP internal.',
      solutionIcon: <ShieldCheck size={16} />,
    },
    {
      id: 2, icon: <FileX size={28} />, color: 'text-orange-400', borderColor: 'border-orange-500/30', bgColor: 'bg-orange-500/[0.03]',
      badgeColor: 'bg-orange-500/10 border-orange-500/20 text-orange-400', glowColor: 'shadow-[0_0_30px_rgba(249,115,22,0.1)]',
      title: 'Kendala Usability & Resistensi Adopsi RME',
      desc: 'Orfanou et al. (2015) menegaskan bahwa kegagalan adopsi sistem informasi klinis di lapangan disebabkan oleh buruknya faktor usability antarmuka. Banyak sistem rekam medis elektronik ditinggalkan karena rumit dan memperlambat pelayanan antrean.',
      source: '📚 Orfanou et al. (2015) — Usability Perceived Evaluation of Systems',
      problems: ['Antarmuka rekam medis konvensional terlalu kaku dan berbelit', 'Tinggi tingkat penolakan staf akibat kurva pembelajaran sistem yang lama', 'Beban pengetikan berulang yang tidak ramah alur kerja cepat'],
      solution: 'Desain antarmuka modular adaptif berorientasi task-specific. Dilengkapi fitur Interactive Guided Tour lintas halaman untuk mengeliminasi kebingungan adaptasi operasional.',
      solutionIcon: <Database size={16} />,
    },
  ];

  // ── FIX: modulo selalu mengikuti panjang array asli (anti out-of-bounds) ──
  useEffect(() => { const i = setInterval(() => setAgentSimMessage(p => (p + 1) % simTexts.length), 5000); return () => clearInterval(i); }, []);
  useEffect(() => { const i = setInterval(() => setActiveProblem(p => (p + 1) % problems.length), 4500); return () => clearInterval(i); }, []);
  useEffect(() => { if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; }, [agentMessages, agentLoading]);

  const scrollToSection = (ref) => { setMobileMenuOpen(false); ref.current?.scrollIntoView({ behavior: 'smooth' }); };

  const handleAgentSend = async (e) => {
    e.preventDefault();
    if (!agentInput.trim() || agentLoading) return;
    const userText = agentInput.trim();
    setAgentInput('');
    const withUser = [...agentMessages, { sender: 'user', text: userText }];
    setAgentMessages(withUser);
    setAgentLoading(true);

    setTimeout(() => {
      setAgentMessages([...withUser, {
        sender: 'bot',
        text: `🤖 **VoltOps Local Fallback:** Pemrosesan sirkuit pengetahuan aktif. Sistem LexiMed.ai dikembangkan dengan mengacu pada pembatasan interseptor RAG terpusat guna mendukung asuhan keputusan klinis bebas halusinasi sesuai Permenkes No. 24/2022.`
      }]);
      setAgentLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#020617] overflow-x-hidden font-sans text-left selection:bg-emerald-500/30 selection:text-emerald-300 antialiased">

      {/* SCROLL PROGRESS BAR */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 origin-left z-[60]"
        style={{ scaleX: scaleProgress }}
      />

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div style={{ y: yPos }} animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 15, repeat: Infinity }} className="absolute top-[-10%] left-[-10%] w-[900px] h-[900px] bg-emerald-600/10 rounded-full blur-[150px]" />
        <motion.div style={{ y: yPos }} animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 18, repeat: Infinity }} className="absolute bottom-[20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px]" />
        <FloatingParticles />
      </div>

      {/* HEADER NAVBAR */}
      <header className="fixed top-0 w-full z-50 bg-[#020617]/70 backdrop-blur-xl border-b border-white/5 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection(heroRef)}>
            <motion.div animate={{ boxShadow: ['0 0 10px rgba(16,185,129,0.2)', '0 0 25px rgba(16,185,129,0.5)', '0 0 10px rgba(16,185,129,0.2)'] }} transition={{ duration: 2.5, repeat: Infinity }} className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden border border-white/10 bg-white">
              <img src="/logo.png" alt="LexiMed Logo" className="w-full h-full object-contain p-1" />
            </motion.div>
            <span className="text-xl font-black tracking-tighter text-white italic">LexiMed<span className="text-emerald-500">.ai</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-6 font-bold text-slate-400 text-xs uppercase tracking-widest">
            <NavLink onClick={() => scrollToSection(heroRef)}>Beranda</NavLink>
            <NavLink onClick={() => scrollToSection(problemRef)}>Masalah & Riset</NavLink>
            <NavLink onClick={() => scrollToSection(fiturRef)}>Modul</NavLink>
            <NavLink onClick={() => scrollToSection(caraKerjaRef)}>Cara Kerja</NavLink>
            <NavLink onClick={() => scrollToSection(arsitekturRef)}>Arsitektur</NavLink>
            <NavLink onClick={() => scrollToSection(agentRef)}>Demo AI</NavLink>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/login')} className="px-5 py-2.5 bg-white text-slate-950 font-black rounded-xl hover:bg-emerald-400 transition-colors flex items-center gap-2 text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              Masuk Sistem <ArrowRight size={14} />
            </motion.button>
          </div>

          <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden border-t border-white/5 bg-[#020617]/95 backdrop-blur-xl"
            >
              <div className="px-6 py-4 flex flex-col gap-4 font-bold text-slate-400 text-xs uppercase tracking-widest">
                <NavLink onClick={() => scrollToSection(heroRef)}>Beranda</NavLink>
                <NavLink onClick={() => scrollToSection(problemRef)}>Masalah & Riset</NavLink>
                <NavLink onClick={() => scrollToSection(fiturRef)}>Modul</NavLink>
                <NavLink onClick={() => scrollToSection(caraKerjaRef)}>Cara Kerja</NavLink>
                <NavLink onClick={() => scrollToSection(arsitekturRef)}>Arsitektur</NavLink>
                <NavLink onClick={() => scrollToSection(agentRef)}>Demo AI</NavLink>
                <button onClick={() => navigate('/login')} className="px-5 py-2.5 bg-white text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 mt-2">
                  Masuk Sistem <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section ref={heroRef} className="relative pt-40 pb-20 md:pt-48 md:pb-28 px-6 min-h-screen flex items-center z-10">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-12 items-center">
          <motion.div initial="hidden" animate="show" variants={staggerContainer} className="text-center lg:text-left lg:col-span-7 space-y-6">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-black uppercase tracking-[0.2em]">
              <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <Zap size={14} className="fill-emerald-400" />
              </motion.span>
              Enterprise Health Orchestration System
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black text-white leading-[1.05] tracking-tighter uppercase italic">
              Otomatisasi <br />
              <motion.span
                className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#34d399,#2dd4bf,#3b82f6,#34d399)] bg-[length:200%_auto]"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              >
                Klinis Otonom
              </motion.span>
            </motion.h1>

            <motion.div variants={fadeUp} className="text-sm md:text-base text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium h-12 flex items-center">
              <TypewriterText
                texts={[
                  'Otomasi rekam medis dari narasi klinis dalam detik.',
                  'Hancurkan birokrasi pengetikan manual hospital.',
                  'Divalidasi riset jurnal medis & regulasi Permenkes.',
                  'Integrasi PACS Radiologi dengan Gemini Vision AI.',
                ]}
                className="text-slate-300"
              />
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <motion.button whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(16,185,129,0.5)' }} whileTap={{ scale: 0.96 }} onClick={() => navigate('/login')} className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3">
                Inisialisasi Sistem <ArrowRight size={16} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => scrollToSection(problemRef)} className="px-8 py-4 bg-white/5 border border-white/10 text-slate-300 rounded-xl font-black text-xs uppercase hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                <AlertTriangle size={16} className="text-rose-400" /> Lihat Masalah Nyata
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Workstation Console */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="lg:col-span-5 w-full" >
            <motion.div
              animate={{ boxShadow: ['0 0 60px rgba(16,185,129,0.12)', '0 0 90px rgba(16,185,129,0.22)', '0 0 60px rgba(16,185,129,0.12)'] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-full bg-[#090d16] border border-white/10 rounded-[2rem] p-6 md:p-8 space-y-6 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                    <BrainCircuit className="text-emerald-400" size={20} />
                  </motion.div>
                  <span className="text-[10px] font-black uppercase text-white tracking-widest font-mono">VoltOps Orchestrator Console</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                  <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 border border-white/5 font-mono text-[11px] h-32 flex flex-col justify-center space-y-2">
                <div className="flex items-center gap-2">
                  <TerminalSquare size={12} className="text-slate-500" />
                  <span className="text-slate-500">Pipeline Terminal active log listener...</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={agentSimMessage} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }} className="space-y-1" >
                    <p className={`font-black uppercase text-[9px] ${simTexts[agentSimMessage].color}`}>{simTexts[agentSimMessage].label}</p>
                    <p className="text-slate-300 font-bold leading-relaxed">{simTexts[agentSimMessage].text}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active E-Document Snapshot</span>
                  <motion.span animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] font-black text-emerald-400 uppercase">One-Click Ready</motion.span>
                </div>
                <p className="text-xs font-black text-white uppercase tracking-tight">Tn. Aditya (RM-001)</p>
                <p className="text-[10px] text-emerald-400 font-bold italic">Output: Final Document Discharge Summary Generator Sync Complete ✓</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* JURNAL TICKER SLIDER */}
      <JurnalTicker />

      {/* ===== SECTION MASALAH DAN SOLUSI ===== */}
      <section ref={problemRef} className="py-24 md:py-32 px-6 bg-[#030712] relative z-20 border-b border-white/5 overflow-hidden">
        <FloatingMedicalIcons />
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center" >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4">
              <AlertTriangle size={14} /> Tinjauan Literatur & Fakta Lapangan
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase italic">
              Krisis Sistem <span className="text-rose-400">Administrasi Medis</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm font-medium mt-3">
              LexiMed.ai memetakan kesenjangan integrasi teknologi berdasarkan tinjauan pustaka jurnal nasional terakreditasi dan regulasi kesehatan.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">

            {/* Navigasi Pemilihan Masalah */}
            <div className="lg:col-span-4 space-y-3">
              {problems.map((p, i) => (
                <motion.button
                  key={p.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setActiveProblem(i)}
                  className={`w-full text-left p-5 rounded-[1.5rem] border transition-colors duration-300 ${activeProblem === i
                    ? `${p.borderColor} ${p.bgColor} ${p.glowColor}`
                    : 'border-white/5 bg-white/[0.01] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`${activeProblem === i ? p.color : 'text-slate-600'}`}>{p.icon}</div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[9px] font-black uppercase tracking-wider ${activeProblem === i ? p.color : 'text-slate-600'}`}>Kategori Kasus 0{i + 1}</p>
                      <h4 className={`text-xs font-black truncate uppercase tracking-tight mt-0.5 ${activeProblem === i ? 'text-white' : 'text-slate-500'}`}>{p.title}</h4>
                    </div>
                    {activeProblem === i && (
                      <motion.div layoutId="problem-active-dot" className={`w-2 h-2 rounded-full shrink-0 ${p.color.replace('text-', 'bg-')}`} />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Konten Detail Matriks Masalah & Solusi */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProblem}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className={`p-8 rounded-[2rem] border ${problems[activeProblem].borderColor} ${problems[activeProblem].bgColor} ${problems[activeProblem].glowColor} space-y-6 text-left`}
                >
                  <div className="flex items-start gap-4">
                    <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200 }} className={`p-3 rounded-xl bg-white/5 border border-white/10 ${problems[activeProblem].color}`}>{problems[activeProblem].icon}</motion.div>
                    <div>
                      <span className={`px-2.5 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider ${problems[activeProblem].badgeColor}`}>Analisis Akar Masalah</span>
                      <h3 className="text-lg font-black text-white mt-2 uppercase tracking-tight italic">{problems[activeProblem].title}</h3>
                    </div>
                  </div>

                  <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-medium">{problems[activeProblem].desc}</p>

                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Kondisi Kendala Lapangan:</p>
                    <div className="space-y-2">
                      {problems[activeProblem].problems.map((prob, j) => (
                        <motion.div key={j} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: j * 0.08 }} className="flex items-center gap-2.5">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${problems[activeProblem].color.replace('text-', 'bg-')}`} />
                          <p className="text-slate-400 text-xs font-semibold">{prob}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400">
                      {problems[activeProblem].solutionIcon}
                      <span className="text-[10px] font-black uppercase tracking-widest">Resolusi Arsitektur LexiMed.ai:</span>
                    </div>
                    <p className="text-emerald-300/90 text-xs font-bold leading-relaxed">{problems[activeProblem].solution}</p>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] font-bold text-slate-500">📚 Validasi Sitasi: <span className="text-slate-400 italic font-medium">{problems[activeProblem].source}</span></p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* ===== SECTION JURNAL LENGKAP ===== */}
      <section ref={jurnalRef} className="py-24 md:py-32 px-6 bg-slate-950 relative z-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4">
              <BookOpen size={14} /> Landasan Jurnal Ilmiah
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase italic">8 Jurnal <span className="text-blue-400">Referensi Utama</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm font-medium mt-3">Konseptual transformasi sistem cerdas rekam medis didukung penuh oleh sitasi dokumen ilmiah terakreditasi.</p>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jurnalRefs.map((j) => (
              <motion.div key={j.id} variants={fadeUp}>
                <MagneticCard className={`p-6 rounded-[2rem] border ${j.border} ${j.bg} h-full cursor-default group relative overflow-hidden text-left flex flex-col justify-between`} >
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.4 }} className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${j.color} shrink-0`}>{j.icon}</motion.div>
                      <div className="min-w-0 flex-1">
                        <span className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase tracking-wider ${j.badge}`}>{j.key}</span>
                        <h4 className="text-sm font-black text-white mt-1 leading-snug truncate">{j.title}</h4>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed line-clamp-2">{j.full}</p>
                  </div>
                  <div className="space-y-2 border-t border-white/5 pt-3 mt-4">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Kontribusi Literatur:</p>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{j.kontribusi}</p>
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 mt-1">
                      <p className={`text-[10px] font-bold leading-relaxed ${j.color}`}><span className="text-slate-600 font-black text-[8px] uppercase tracking-wider block mb-0.5">Relevansi Node RAG:</span>{j.relevansi}</p>
                    </div>
                  </div>
                </MagneticCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 5 MODUL ECOSYSTEM ===== */}
      <section ref={fiturRef} className="py-24 md:py-32 px-6 bg-slate-950/40 relative z-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-emerald-400 font-black tracking-[0.3em] uppercase text-xs mb-3">Modular Ecosystem</h2>
            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase italic">Satu Komputasi Cloud, 5 Node Otomasi</h3>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm mt-3 font-medium">LexiMed memisahkan hak akses fungsionalitas sesuai standarisasi tata kelola rumah sakit modern.</p>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" >
            {[
              { icon: <Stethoscope size={22} />, title: 'Modul Dokter', desc: 'Asistensi diagnosis klinis real-time via CDSS, hybrid AI Groq + Gemini, anti-halusinasi dengan review konservatif TTV.' },
              { icon: <Activity size={22} />, title: 'Modul Perawat', desc: 'Manajemen rekam data tanda vital (TTV) cepat dan sistem operan shift serah terima terstruktur otomatis.' },
              { icon: <Microscope size={22} />, title: 'Modul Radiologi', desc: 'Integrasi PACS dengan Gemini Vision untuk ekstraksi otomatis impresi citra medis DICOM.' },
              { icon: <LineChart size={22} />, title: 'Modul Manajemen', desc: 'Dashboard visualisasi tren kesehatan demografis dan otomasi laporan strategis eksekutif.' },
              { icon: <Lock size={22} />, title: 'Modul Admin & Audit', desc: 'Pemantauan jalur data log terenkripsi, manajemen kredensial user, proteksi keamanan siber rekam medis.', span: 2 },
            ].map((m, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -6, borderColor: 'rgba(16,185,129,0.3)' }} className={`p-8 bg-white/[0.01] rounded-[2rem] border border-white/5 hover:bg-emerald-500/[0.02] transition-colors duration-300 h-64 text-left flex flex-col justify-between ${m.span === 2 ? 'lg:col-span-2' : ''}`} >
                <div>
                  <motion.div whileHover={{ scale: 1.1, rotate: 8 }} className="w-12 h-12 bg-white/5 border border-white/10 text-emerald-400 rounded-xl flex items-center justify-center mb-6">
                    {m.icon}
                  </motion.div>
                  <h4 className="text-lg font-black text-white uppercase tracking-wide italic mb-2">{m.title}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed font-medium">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CARA KERJA SYSTEM ===== */}
      <section ref={caraKerjaRef} className="py-24 md:py-32 px-6 bg-[#030712] text-white relative z-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center">
            <h2 className="text-emerald-400 font-black tracking-[0.3em] uppercase text-xs mb-3">Human-in-the-Loop System</h2>
            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight italic">Cara Kerja Per Role Staf</h3>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🩺', role: 'Dokter Poliklinik', color: 'border-emerald-500/30 bg-emerald-500/[0.03]', badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', steps: [{ icon: <ClipboardList size={14} />, text: 'Input keluhan pasien & TTV ke formulir rekam medis' }, { icon: <Sparkles size={14} />, text: 'AI Groq generate diagnosa awal + 3 pertanyaan anamnesa' }, { icon: <BrainCircuit size={14} />, text: 'Gemini review hasil Groq — koreksi diagnosis terlalu agresif' }, { icon: <ShieldCheck size={14} />, text: 'Dokter edit hasil AI, validasi final, simpan ke Supabase' }] },
              { icon: '☢️', role: 'Radiolog / PACS', color: 'border-cyan-500/30 bg-cyan-500/[0.03]', badge: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400', steps: [{ icon: <ClipboardList size={14} />, text: 'Terima instruksi rujukan dokter poliklinik dari database' }, { icon: <Microscope size={14} />, text: 'Upload foto citra DICOM/JPEG pasien ke workstation PACS' }, { icon: <BrainCircuit size={14} />, text: 'Gemini Vision analisis gambar → draf impresi radiologi' }, { icon: <ShieldCheck size={14} />, text: 'Radiolog koreksi & kirim ke timeline rekam medis dokter' }] },
              { icon: '🩹', role: 'Perawat', color: 'border-blue-500/30 bg-blue-500/[0.03]', badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400', steps: [{ icon: <Activity size={14} />, text: 'Input TTV pasien: tekanan darah, nadi, suhu, SpO2' }, { icon: <Database size={14} />, text: 'Data langsung tersimpan ke database RS' }, { icon: <ClipboardList size={14} />, text: 'Modul operan shift: ringkasan kondisi pasien otomatis' }, { icon: <ShieldCheck size={14} />, text: 'Serah terima shift dengan dokumen terstruktur' }] }
            ].map((role, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ scale: 1.02 }} className={`p-6 rounded-[2rem] border ${role.color} space-y-4 text-left transition-transform`} >
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">{role.icon}</span>
                  <span className={`px-2.5 py-1 rounded-md border font-black text-[9px] uppercase tracking-wider ${role.badge}`}>{role.role}</span>
                </div>
                <div className="space-y-2.5">
                  {role.steps.map((step, j) => (
                    <motion.div key={j} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: j * 0.1 }} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-slate-400">{step.icon}</div>
                      <p className="text-slate-400 text-[11px] font-medium leading-relaxed">{step.text}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== ARSITEKTUR TEKNIS ===== */}
      <section ref={arsitekturRef} className="py-24 md:py-32 px-6 bg-slate-950 text-white relative z-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center">
            <h2 className="text-emerald-400 font-black tracking-[0.3em] uppercase text-xs mb-3">Enterprise Core Infrastructure</h2>
            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase italic">Arsitektur Sistem LexiMed.ai</h3>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { tag: 'Frontend Layer', tagColor: 'bg-blue-500/10 border-blue-500/20 text-blue-400', icon: <Code2Icon />, title: 'React.js + Vite', items: [{ name: 'React.js 18', desc: 'UI framework utama' }, { name: 'Vite Build', desc: 'Compiler ultra-cepat' }, { name: 'Tailwind CSS', desc: 'Styling utility-first' }, { name: 'Framer Motion', desc: 'Animasi & transisi' }] },
              { tag: 'Backend Layer', tagColor: 'bg-orange-500/10 border-orange-500/20 text-orange-400', icon: <ServerIcon />, title: 'Laravel 11 API', items: [{ name: 'Laravel 11', desc: 'PHP backend framework' }, { name: 'Sanctum Auth', desc: 'Token-based auth' }, { name: 'Supabase', desc: 'Cloud relational core' }, { name: 'Eloquent ORM', desc: 'Model relasi data' }] },
              { tag: 'AI Stack', tagColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', icon: <BrainCircuit size={28} className="text-emerald-400" />, title: 'Hybrid AI Engine', items: [{ name: 'Groq SDK', desc: 'Llama 3.3 70B ultra-fast' }, { name: 'Gemini 1.5 Flash', desc: 'Vision PACS Analyst' }, { name: 'VoltAgent', desc: 'Context-aware orchestrator' }, { name: 'RAG Knowledge', desc: 'SOP vector base retrieval' }] },
            ].map((stack, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -4 }} className="p-8 bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 rounded-[2.5rem] space-y-5 shadow-lg text-left" >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">{stack.icon}</div>
                  <div>
                    <span className={`px-2.5 py-1 rounded-md border font-black text-[9px] uppercase tracking-wider ${stack.tagColor}`}>{stack.tag}</span>
                    <h4 className="text-base font-black text-white mt-1 uppercase tracking-wide italic">{stack.title}</h4>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {stack.items.map((item, j) => (
                    <div key={j} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-white font-black text-xs">{item.name}</span>
                      <span className="text-slate-500 font-medium text-[10px]">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== AI PLAYGROUND DEMO AREA ===== */}
      <section ref={agentRef} className="py-24 md:py-32 px-6 bg-slate-950/60 relative z-20">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-emerald-400 font-black tracking-[0.3em] uppercase text-xs mb-3 flex items-center justify-center gap-2">🤖 Live AI Demo</h2>
            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase italic">Tanya LexiCore Agent Sekarang</h3>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[#090d16] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.1)]">
            <div className="bg-slate-950/80 border-b border-white/5 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <BrainCircuit className="text-emerald-400" size={18} />
                <div className="text-left">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">LexiCore Agent — Demo Publik</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Powered by {roleConfigs[agentRole].name}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(roleConfigs).map(([key, cfg]) => (
                  <motion.button whileTap={{ scale: 0.95 }} key={key} onClick={() => setAgentRole(key)} className={`px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider transition-colors ${agentRole === key ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`} >
                    {cfg.icon} {key}
                  </motion.button>
                ))}
              </div>
            </div>

            <div ref={chatContainerRef} className="h-80 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-950 to-[#090d16] [&::-webkit-scrollbar]:hidden" >
              <AnimatePresence initial={false}>
                {agentMessages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 text-left ${msg.sender === 'user' ? 'ml-auto flex-row-reverse max-w-md' : 'mr-auto max-w-2xl'}`} >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${msg.sender === 'user' ? 'bg-blue-600 border-blue-500 text-white text-xs font-black' : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'}`}>
                      {msg.sender === 'user' ? 'U' : <Bot size={14} />}
                    </div>
                    <div className={`px-4 py-3 rounded-2xl text-xs border whitespace-pre-wrap leading-relaxed ${msg.sender === 'user' ? 'bg-blue-600 border-blue-500 text-white rounded-tr-none' : 'bg-slate-950/80 border-slate-800 text-slate-200 rounded-tl-none'}`}>
                      {msg.sender === 'user' ? msg.text : formatAgentText(msg.text)}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {agentLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 mr-auto text-left">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border bg-emerald-600/10 border-emerald-500/20 text-emerald-400"><Bot size={14} /></div>
                  <div className="px-5 py-4 rounded-2xl rounded-tl-none bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                    <DNAHelix />
                    <span className="text-[10px] text-slate-500 font-bold">LexiCore memproses...</span>
                  </div>
                </motion.div>
              )}
            </div>

            <form onSubmit={handleAgentSend} className="p-4 bg-slate-950/50 border-t border-white/5">
              <div className="flex items-center gap-3">
                <input type="text" value={agentInput} onChange={(e) => setAgentInput(e.target.value)} disabled={agentLoading} placeholder={agentLoading ? 'LexiCore sedang berpikir...' : 'Tanya tentang LexiMed.ai, jurnal referensi, atau arsitektur sistem...'} className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-emerald-500/40" />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} type="submit" disabled={agentLoading || !agentInput.trim()} className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50" >
                  <Send size={16} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ===== BOTTOM SYSTEM CALL TO ACTION ===== */}
      <section className="py-24 px-6 bg-gradient-to-br from-emerald-600 to-blue-700 relative overflow-hidden z-20 border-t border-white/5">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto text-center space-y-8 relative z-10" >
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight italic">Transformasikan Administrasi Medis Hari Ini</h2>
          <p className="text-blue-100 text-sm font-medium max-w-lg mx-auto">Solusi divalidasi 8 jurnal ilmiah nasional terakreditasi. Patuh penuh Permenkes RI No. 24/2022 mengenai kewajiban rekam medis elektronik.</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/login')} className="px-8 py-4 bg-white text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 shadow-2xl flex items-center justify-center gap-3 mx-auto" >
            Mulai Otomasi Rekam Medis <ChevronRight size={18} />
          </motion.button>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6 relative z-20 border-t border-white/5 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-white/5 pb-12 mb-12">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden border border-white/10 bg-white"><img src="/logo.png" alt="LexiMed Logo" className="w-full h-full object-contain p-1" /></div>
              <span className="text-lg font-black tracking-tight text-white italic">LexiMed<span className="text-emerald-400">.ai</span></span>
            </div>
            <p className="text-slate-400 leading-relaxed font-medium max-w-sm text-left">Platform CDSS berbasis multi-role AI Agent untuk rekam medis elektronik rumah sakit terintegrasi Supabase Cloud database core.</p>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="text-white font-black uppercase tracking-wider text-sm italic text-left">Infrastruktur Node</h4>
            <ul className="space-y-2.5 font-bold uppercase tracking-wide text-[10px] text-slate-500 text-left">
              <li>🩺 Doctor Clinical CDSS Node</li>
              <li>🎚️ Nurse Care Ingestion Node</li>
              <li>☢️ Radiology PACS Vision Node</li>
              <li>📊 Executive Analytic Dashboard</li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-4 text-left">
            <h4 className="text-white font-black uppercase tracking-wider text-sm italic">Otoritas Pengembang</h4>
            <ul className="space-y-3 font-semibold text-slate-400">
              <li className="flex items-center gap-3"><Mail size={16} className="text-emerald-400 shrink-0" /><a href="mailto:ilhameka93@student.uns.ac.id" className="hover:text-emerald-400">ilhameka93@student.uns.ac.id</a></li>
              <li className="flex items-center gap-3"><Phone size={16} className="text-emerald-400 shrink-0" /><a href="https://wa.me/6285231287023" target="_blank" rel="noreferrer" className="hover:text-emerald-400">0852-3128-7023</a></li>
              <li className="text-[10px] font-black uppercase tracking-wider text-slate-500 pt-1">D3 Teknik Informatika — Sekolah Vokasi<br />Universitas Sebelas Maret PSDKU Madiun</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-slate-600 text-center md:text-left">
          <p>&copy; 2026 LexiMed.ai — Hak Cipta Tim Inovasi Vokasi PSDKU UNS.</p>
          <div className="flex items-center gap-2 font-mono text-[10px]"><Cpu size={14} className="text-emerald-500" /> OpenClaw Layer Engine v1.0</div>
        </div>
      </footer>

    </div>
  );
}

// ── Helper icon wrappers (menjaga import lucide tetap minimal & rapi) ──
import { Code2 as Code2Icon, Server as ServerIcon } from 'lucide-react';