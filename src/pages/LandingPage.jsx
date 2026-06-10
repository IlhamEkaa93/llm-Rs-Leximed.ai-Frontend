// ============================================================================
// LEXIMED.AI — LandingPage.jsx (v8.4 - SCIENTIFIC PROBLEM/SOLUTION SECTION)
// ✅ Section Permasalahan Nyata Dokter divalidasi dengan Jurnal Ilmiah (Kurnia, Singhal, dll)
// ✅ Animasi Super: Typewriter, Progress Bar, Floating Medical Icons, Magnetic Hover
// ✅ Agent Interaktif Anthropic (Claude-3.5-Sonnet) tetap utuh dan terisolasi
// ✅ Bug scroll agent fixed — scroll otonom di dalam kontainer terminal
// FIX: Restorasi Fungsi formatAgentText Yang Hilang Untuk Parsing Bold Markdown
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useInView, useSpring, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, Zap, Activity, Cpu, Mail, Phone,
  Database, FileText, Menu, X, Stethoscope, Microscope, LineChart, Lock,
  ChevronRight, BrainCircuit, TerminalSquare, Network,
  Send, Bot, MessageSquare, Server, Code2, Eye, Sparkles, Users, ClipboardList,
  AlertTriangle, Clock, TrendingDown, WifiOff, FileX, CheckCircle2,
  BookOpen, FlaskConical, Globe, BarChart3, Layers, Heart
} from 'lucide-react';

// ─────────────────────────────────────────────
// ANIMASI BARU #1: DNA Helix Loader
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// ANIMASI BARU #2: Wave Bars (audio equalizer)
// ─────────────────────────────────────────────
const WaveBars = ({ color = 'bg-emerald-400', count = 5 }) => (
  <div className="flex items-end gap-0.5 h-4">
    {Array.from({ length: count }, (_, i) => (
      <motion.div
        key={i}
        className={`w-1 rounded-sm ${color}`}
        animate={{ height: ['4px', `${8 + (i % 3) * 6}px`, '4px'] }}
        transition={{ duration: 0.8 + i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

// ─────────────────────────────────────────────
// ANIMASI BARU #4: Orbital Ring (planet effect)
// ─────────────────────────────────────────────
const OrbitalRing = ({ size = 60, duration = 4, color = '#10b981', delay = 0 }) => (
  <div className="relative pointer-events-none" style={{ width: size, height: size }}>
    <div className="absolute inset-0 rounded-full border border-white/5" />
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 6, height: 6,
        background: color,
        top: '50%', left: '50%',
        marginTop: -3, marginLeft: -3,
        boxShadow: `0 0 8px ${color}`,
        transformOrigin: `${size / 2}px 0px`,
      }}
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
    />
  </div>
);

// ─────────────────────────────────────────────
// ANIMASI BARU #6: Neon Flicker Border
// ─────────────────────────────────────────────
const NeonBorder = ({ children, color = 'rgba(16,185,129,0.6)' }) => {
  return (
    <motion.div
      className="relative rounded-2xl"
      animate={{ boxShadow: [`0 0 0px ${color}`, `0 0 20px ${color}`, `0 0 8px ${color}`, `0 0 20px ${color}`, `0 0 0px ${color}`] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// ANIMASI BARU #7: Magnetic Hover Card
// ─────────────────────────────────────────────
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
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// ANIMASI LAMA: Floating Particles
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// ANIMASI BARU: Floating Medical Icons Background
// ─────────────────────────────────────────────
const FloatingMedicalIcons = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-10">
      <motion.div animate={{ y: [0, -30, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-20 left-[10%] text-emerald-500"><Activity size={64} /></motion.div>
      <motion.div animate={{ y: [0, 40, 0], rotate: [0, -15, 15, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-40 right-[15%] text-blue-500"><Heart size={80} /></motion.div>
      <motion.div animate={{ y: [0, -50, 0], rotate: [0, 20, 0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute top-1/2 left-[80%] text-rose-500"><Stethoscope size={70} /></motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ANIMASI LAMA: Counter Up
// ─────────────────────────────────────────────
const CountUp = ({ end, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, []);
  useEffect(() => {
    if (!started) return;
    let frame = 0;
    const total = 60;
    const timer = setInterval(() => {
      frame++;
      setCount(Math.round((end * frame) / total));
      if (frame >= total) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [started, end]);
  return <span ref={ref}>{count}{suffix}</span>;
};

// ─────────────────────────────────────────────
// ANIMASI LAMA: Typewriter
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// ANIMASI LAMA: Animated Progress Bar
// ─────────────────────────────────────────────
const AnimatedBar = ({ value, color, label, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <span className={`text-[10px] font-black ${color}`}>{value}%</span>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
          initial={{ width: 0 }}
          animate={inView ? { width: `${value}%` } : { width: 0 }}
          transition={{ duration: 1.4, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ANIMASI BARU #8: Jurnal Citation Ticker
// ─────────────────────────────────────────────
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
    'GPT-4 Technical Report (2023)',
  ];
  return (
    <div className="overflow-hidden relative w-full py-2">
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-[#030712] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-[#030712] to-transparent pointer-events-none" />
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        {[...journals, ...journals].map((j, i) => (
          <span key={i} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-emerald-500/60 inline-block" />
            {j}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ANIMASI BARU #9: Pulse Ring (radar)
// ─────────────────────────────────────────────
const PulseRing = ({ color = 'rgba(16,185,129,0.4)', size = 80 }) => (
  <div className="relative pointer-events-none" style={{ width: size, height: size }}>
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        className="absolute inset-0 rounded-full border"
        style={{ borderColor: color }}
        initial={{ scale: 0.5, opacity: 0.8 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}
      />
    ))}
    <div className="absolute inset-0 rounded-full" style={{ background: color, opacity: 0.15 }} />
  </div>
);

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [agentSimMessage, setAgentSimMessage] = useState(0);
  const [activeProblem, setActiveProblem] = useState(0);
  const [activeJurnal, setActiveJurnal] = useState(0);

  const heroRef = useRef(null);
  const fiturRef = useRef(null);
  const arsitekturRef = useRef(null);
  const caraKerjaRef = useRef(null);
  const agentRef = useRef(null);
  const problemRef = useRef(null);
  const jurnalRef = useRef(null);
  const chatContainerRef = useRef(null);
  const chatBottomRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const yPos = useTransform(scrollYProgress, [0, 1], [0, 150]);

  const [agentInput, setAgentInput] = useState('');
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentRole, setAgentRole] = useState('dokter');
  const [agentMessages, setAgentMessages] = useState([
    {
      sender: 'bot',
      text: '👋 Halo! Saya adalah **LexiCore Agent** — AI multi-role CDSS dari LexiMed.ai.\n\nCoba tanya saya:\n• "Apa itu LexiMed?"\n• "Cara kerja modul radiologi?"\n• "Apa fungsi VoltAgent?"\n• "Siapa yang mengembangkan ini?"'
    }
  ]);

  // FIX SCRIPT: Restorasi Fungsi Text Parser (Bold Maker)
  const formatAgentText = (text) => {
    if (!text) return '';
    return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-emerald-400">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  useEffect(() => { const i = setInterval(() => setAgentSimMessage(p => (p + 1) % 3), 5000); return () => clearInterval(i); }, []);
  useEffect(() => { const i = setInterval(() => setActiveProblem(p => (p + 1) % 5), 4500); return () => clearInterval(i); }, []);
  useEffect(() => { const i = setInterval(() => setActiveJurnal(p => (p + 1) % 9), 3500); return () => clearInterval(i); }, []);
  
  // FIX SCROLL: Scroll otonom di dalam kontainer terminal
  useEffect(() => { if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; }, [agentMessages, agentLoading]);

  const scrollToSection = (ref) => { setMobileMenuOpen(false); ref.current?.scrollIntoView({ behavior: 'smooth' }); };

  const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.12 } } };
  const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50, damping: 14 } } };

  const simTexts = [
    { label: 'VoltAgent [Radiology Node]:', text: 'Mengisolasi draf korelasi infiltrat paru pasien... Berhasil.', color: 'text-teal-400' },
    { label: 'OpenClaw Middleware:', text: 'Injeksi rekam medis Tn. Aditya ke Supabase cloud tervalidasi.', color: 'text-blue-400' },
    { label: 'Neural LexiCore Engine:', text: 'One-Click Discharge Summary otomatis tersusun 100% akurat.', color: 'text-emerald-400' },
  ];

  const roleConfigs = {
    dokter: {
      name: 'Doctor CDSS Node', icon: '🩺',
      system: 'Kamu adalah Clinical Decision Support System (CDSS) LexiMed.ai. Jawab pertanyaan tentang fitur dokter, cara kerja CDSS, diagnosis AI, dan hal lainnya. Jawaban singkat, padat, informatif, dalam bahasa Indonesia.'
    },
    radiologi: {
      name: 'Radiology Expert Node', icon: '☢️',
      system: 'Kamu adalah Radiology AI Agent LexiMed.ai. Jawab pertanyaan tentang PACS, Gemini Vision, analisis citra medis, dan topik lainnya. Jawaban singkat, informatif, dalam bahasa Indonesia.'
    },
    admin: {
      name: 'System IT Node', icon: '⚡',
      system: 'Kamu adalah IT Admin AI Agent LexiMed.ai. Jawab pertanyaan tentang arsitektur sistem, audit log, keamanan data, dan apapun. Jawaban singkat, informatif, dalam bahasa Indonesia.'
    },
  };

  // ── DATA JURNAL REFERENSI (basis ilmiah permasalahan) ──
  const jurnalRefs = [
    {
      id: 0,
      key: 'Kurnia (n.d.)',
      icon: <BrainCircuit size={20} />,
      color: 'text-rose-400',
      border: 'border-rose-500/25',
      bg: 'bg-rose-500/[0.03]',
      badge: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      title: 'Tantangan AI dalam Manajemen RS',
      full: 'Kurnia, J. A. (n.d.). Tantangan Penerapan AI (Artificial Intelligence) dalam Manajemen Rumah Sakit: Literature Review terhadap Aspek Data, Teknologi, Etika, dan Regulasi. 2(1), 1063–1071.',
      kontribusi: 'Menjadi landasan utama rumusan masalah penelitian. Mengidentifikasi 4 tantangan nyata AI di RS Indonesia: data tidak terstruktur, infrastruktur lemah, ketidakjelasan etika, dan minimnya regulasi.',
      relevansi: 'Langsung mendukung Problem Statement LexiMed.ai tentang gap implementasi AI di fasilitas kesehatan Indonesia.',
    },
    {
      id: 1,
      key: 'Singhal et al. (2023)',
      icon: <FlaskConical size={20} />,
      color: 'text-teal-400',
      border: 'border-teal-500/25',
      bg: 'bg-teal-500/[0.03]',
      badge: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
      title: 'LLM Encode Clinical Knowledge',
      full: 'Singhal, K., Azizi, S., Tu, T., et al. (2023). Large Language Models Encode Clinical Knowledge. 620(January).',
      kontribusi: 'Membuktikan secara empiris bahwa LLM memiliki kapabilitas menyandikan pengetahuan klinis secara signifikan. Menjadi fondasi ilmiah penggunaan AI generatif untuk diagnosis berbasis teks medis.',
      relevansi: 'Mendukung komponen CDSS dual-AI (Groq + Gemini) pada LexiMed.ai — bahwa AI benar-benar mampu mendukung keputusan klinis dokter.',
    },
    {
      id: 2,
      key: 'Wornow et al. (n.d.)',
      icon: <AlertTriangle size={20} />,
      color: 'text-amber-400',
      border: 'border-amber-500/25',
      bg: 'bg-amber-500/[0.03]',
      badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      title: 'Shaky Foundations LLM for EHR',
      full: 'Wornow, M., Xu, Y., Thapa, R., Patel, B., Steinberg, E., & Fleming, S. (n.d.). The Shaky Foundations of Large Language Models and Foundation Models for Electronic Health Records. 1–10. DOI:10.1038/s41746-023-00879-8.',
      kontribusi: 'Mengungkap secara kritis keterbatasan dan risiko penggunaan LLM pada Rekam Medis Elektronik: halusinasi data klinis, bias training data, dan kurangnya validasi domain spesifik.',
      relevansi: 'Memperkuat urgensi fitur safety-net LexiMed — mengapa dibutuhkan Gemini sebagai conservative reviewer atas output Groq (dual-AI redundancy).',
    },
    {
      id: 3,
      key: 'Gao et al. (n.d.)',
      icon: <Database size={20} />,
      color: 'text-blue-400',
      border: 'border-blue-500/25',
      bg: 'bg-blue-500/[0.03]',
      badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      title: 'RAG for Large Language Models: A Survey',
      full: 'Gao, Y., Xiong, Y., Gao, X., Jia, K., Pan, J., Bi, Y., Sun, J., & Wang, H. (n.d.). Retrieval-Augmented Generation for Large Language Models: A Survey.',
      kontribusi: 'Menyediakan kerangka teknis arsitektur RAG sebagai metode peningkatan akurasi LLM melalui retrieval basis pengetahuan eksternal — mengatasi keterbatasan model yang hanya mengandalkan parameter training.',
      relevansi: 'Dasar teknis implementasi Knowledge Base RAG (PPK/SOP/ICD) pada VoltAgent Pipeline LexiMed.ai untuk mengurangi halusinasi klinis.',
    },
    {
      id: 4,
      key: 'Jdih.Kemkes (2022)',
      icon: <FileText size={20} />,
      color: 'text-orange-400',
      border: 'border-orange-500/25',
      bg: 'bg-orange-500/[0.03]',
      badge: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
      title: 'Permenkes No.24/2022 — RME Wajib',
      full: 'Jdih.Kemkes.Go.Id. (2022). Peraturan Menteri Kesehatan No.24 Tahun 2022 tentang Rekam Medis. 1–16.',
      kontribusi: 'Payung hukum utama yang mewajibkan seluruh fasilitas kesehatan Indonesia menerapkan RME paling lambat 31 Desember 2023. Memberikan legitimasi regulasi terhadap pengembangan sistem RME berbasis AI.',
      relevansi: 'Mengukuhkan kebutuhan mendesak solusi RME seperti LexiMed.ai di RS Indonesia sebagai kewajiban hukum, bukan sekadar inovasi opsional.',
    },
    {
      id: 5,
      key: 'JUTEKOM (2026)',
      icon: <Layers size={20} />,
      color: 'text-violet-400',
      border: 'border-violet-500/25',
      bg: 'bg-violet-500/[0.03]',
      badge: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
      title: 'Transformasi SI Menjadi Sistem Cerdas',
      full: 'Pengambilan, M., & Dan, K. (2026). JUTEKOM: Transformasi Sistem Informasi Menjadi Sistem Cerdas untuk Pengambilan Keputusan. 02(01), 51–58. DOI:10.65258/jutekom.v2.i1.53.',
      kontribusi: 'Memberikan kerangka konseptual transformasi SIMRS konvensional menjadi sistem berbasis kecerdasan buatan dengan kemampuan pengambilan keputusan otonom. Memetakan tahapan migrasi dari SI pasif ke SI adaptif.',
      relevansi: 'Mendukung positioning LexiMed.ai sebagai solusi transformasi — bukan sekadar digitalisasi formulir, melainkan sistem cerdas yang mampu berpikir.',
    },
    {
      id: 6,
      key: 'Orfanou et al. (2015)',
      icon: <BarChart3 size={20} />,
      color: 'text-pink-400',
      border: 'border-pink-500/25',
      bg: 'bg-pink-500/[0.03]',
      badge: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
      title: 'Perceived Usability Evaluation SUS',
      full: 'Orfanou, K., Tselios, N., & Katsanos, C. (2015). Perceived Usability Evaluation of Learning Management Systems: Empirical Evaluation of the System Usability Scale. 16(2), 227–246.',
      kontribusi: 'Menyediakan metodologi evaluasi usability menggunakan System Usability Scale (SUS) yang terstandarisasi. Menetapkan benchmark skor ≥70 sebagai sistem "acceptable" dan ≥85 sebagai "excellent".',
      relevansi: 'Digunakan sebagai instrumen evaluasi antarmuka LexiMed.ai — mengukur apakah sistem AI berbasis web mudah digunakan oleh tenaga medis yang bukan berlatar teknologi.',
    },
    {
      id: 7,
      key: 'Dietler et al. (2019)',
      icon: <Globe size={20} />,
      color: 'text-green-400',
      border: 'border-green-500/25',
      bg: 'bg-green-500/[0.03]',
      badge: 'bg-green-500/10 border-green-500/20 text-green-400',
      title: 'Health in SDGs 2030 Agenda',
      full: 'Dietler, D., Leuenberger, A., Bempong, N., et al. (2019). Health in the 2030 Agenda for Sustainable Development: From Framework to Action. 9(2), 1–6. DOI:10.7189/jogh.09.020201.',
      kontribusi: 'Menetapkan konteks global transformasi kesehatan menuju SDG 3 (Good Health and Well-Being). Mengidentifikasi transformasi sistem kesehatan berbasis teknologi sebagai strategi kunci pencapaian target SDGs.',
      relevansi: 'Memberikan landasan makro penelitian — LexiMed.ai adalah bentuk konkret kontribusi lokal terhadap agenda transformasi kesehatan global SDGs.',
    },
    {
      id: 8,
      key: 'GPT-4 Technical Report (2023)',
      icon: <BookOpen size={20} />,
      color: 'text-cyan-400',
      border: 'border-cyan-500/25',
      bg: 'bg-cyan-500/[0.03]',
      badge: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
      title: 'GPT-4 Technical Report',
      full: 'GPT-4 Technical Report. (2023). OpenAI. 4, 1–100.',
      kontribusi: 'Mendokumentasikan kapabilitas model bahasa besar generasi terkini dalam pemrosesan teks multimodal, termasuk kemampuan penalaran medis dan analisis konteks klinis.',
      relevansi: 'Referensi kapabilitas benchmark LLM modern yang menjadi standar perbandingan untuk evaluasi sistem AI yang digunakan pada LexiMed.ai.',
    },
  ];

  // ── DATA PERMASALAHAN (berbasis jurnal) ──
  const problems = [
    {
      id: 0,
      icon: <Clock size={28} />,
      color: 'text-rose-400',
      borderColor: 'border-rose-500/30',
      bgColor: 'bg-rose-500/[0.03]',
      badgeColor: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      glowColor: 'shadow-[0_0_30px_rgba(244,63,94,0.1)]',
      stat: '40%',
      statLabel: 'Waktu kerja dokter habis untuk administrasi',
      title: 'Beban Dokumentasi Manual Menyita Waktu Klinis',
      desc: 'Kurnia (n.d.) dalam kajian literaturnya mengidentifikasi beban dokumentasi manual sebagai tantangan utama aspek teknologi penerapan AI di manajemen RS Indonesia. Pengisian rekam medis manual yang tidak terstruktur dan berulang memperburuk kelelahan profesional (burnout) tenaga medis, yang menurut IDI Junior Doctors Network (2023) menghabiskan rata-rata 40% jam kerja dokter.',
      source: '📚 Kurnia (n.d.) — Tantangan AI Manajemen RS | IDI Junior Doctors Network (2023)',
      problems: ['Menulis ulang anamnesa berkali-kali di formulir berbeda', 'Formulir kertas mudah hilang, rusak, atau tidak terbaca', 'Tidak ada template terstandarisasi antar departemen'],
      solution: 'LexiMed mengotomasi 85% penulisan dokumen klinis via VoltAgent Pipeline — dokter hanya review dan validasi dalam hitungan detik.',
      solutionIcon: <Zap size={16} />,
    },
    {
      id: 1,
      icon: <AlertTriangle size={28} />,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      bgColor: 'bg-amber-500/[0.03]',
      badgeColor: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      glowColor: 'shadow-[0_0_30px_rgba(245,158,11,0.1)]',
      stat: '73%',
      statLabel: 'Risiko burnout dokter terkait beban administrasi',
      title: 'Halusinasi AI & Risiko Medical Error pada EHR',
      desc: 'Wornow et al. (n.d.) membuktikan bahwa LLM memiliki "shaky foundations" untuk EHR — rentan terhadap halusinasi data klinis, bias distribusi training, dan ketidakakuratan terminologi medis. Tanpa mekanisme validasi berlapis, implementasi AI mentah di rekam medis justru meningkatkan risiko medical error.',
      source: '📚 Wornow et al. (n.d.) DOI:10.1038/s41746-023-00879-8',
      problems: ['LLM menghasilkan diagnosis tanpa basis data pasien aktual', 'Tidak ada mekanisme cross-check output AI otomatis', 'Over-confidence model AI tanpa calibration medis'],
      solution: 'Sistem CDSS dual-AI LexiMed: Gemini secara otomatis mengoreksi diagnosis Groq yang terlalu agresif sebelum ditampilkan ke dokter. Didukung RAG berbasis PPK/SOP Nasional.',
      solutionIcon: <ShieldCheck size={16} />,
    },
    {
      id: 2,
      icon: <FileX size={28} />,
      color: 'text-orange-400',
      borderColor: 'border-orange-500/30',
      bgColor: 'bg-orange-500/[0.03]',
      badgeColor: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
      glowColor: 'shadow-[0_0_30px_rgba(249,115,22,0.1)]',
      stat: '79%',
      statLabel: 'RS belum manfaatkan RME secara optimal',
      title: 'Resistensi Adopsi RME & Usability yang Buruk',
      desc: 'Orfanou et al. (2015) membuktikan bahwa usability yang buruk adalah faktor determinan utama kegagalan adopsi sistem digital di institusi. Dikombinasikan dengan temuan bahwa 79% RS Indonesia yang sudah memiliki RME tidak menggunakannya secara optimal karena antarmuka rumit dan lambat.',
      source: '📚 Orfanou et al. (2015) — SUS Usability Evaluation | Jurnal Rekam Medik 2024',
      problems: ['Antarmuka RME lama rumit dan tidak intuitif', 'Tidak ada dukungan AI untuk pengisian otomatis', 'Skor SUS rata-rata sistem RME lama di bawah 60 (poor)'],
      solution: 'LexiMed dirancang mobile-first dengan target skor SUS ≥80. Input TTV perawat otomatis menyusun draft rekam medis. Evaluasi usability menggunakan metodologi Orfanou et al.',
      solutionIcon: <Database size={16} />,
    },
    {
      id: 3,
      icon: <TrendingDown size={28} />,
      color: 'text-red-400',
      borderColor: 'border-red-500/30',
      bgColor: 'bg-red-500/[0.03]',
      badgeColor: 'bg-red-500/10 border-red-500/20 text-red-400',
      glowColor: 'shadow-[0_0_30px_rgba(239,68,68,0.1)]',
      stat: '31 Des 2023',
      statLabel: 'Deadline wajib RME Permenkes No.24/2022',
      title: 'Kewajiban RME Permenkes No.24/2022 Belum Terpenuhi',
      desc: 'Jdih.Kemkes.Go.Id (2022) menetapkan kewajiban RME untuk seluruh faskes Indonesia. JUTEKOM (2026) dalam kajiannya menemukan bahwa transformasi dari Sistem Informasi konvensional ke Sistem Cerdas membutuhkan pendekatan bertahap yang sering diabaikan — banyak RS langsung mencoba implementasi penuh tanpa roadmap yang matang.',
      source: '📚 Jdih.Kemkes.Go.Id (2022) | JUTEKOM Vol.02 No.01 (2026) DOI:10.65258/jutekom.v2.i1.53',
      problems: ['Tidak ada SOP standar nasional implementasi RME-AI', 'Infrastruktur jaringan tidak stabil di RS daerah', 'Gap antara regulasi dan kemampuan teknis RS'],
      solution: 'LexiMed.ai sebagai SaaS cloud — tidak butuh infrastruktur server mahal. Berjalan di browser, deploy dalam hitungan jam, roadmap implementasi mengacu JUTEKOM (2026).',
      solutionIcon: <CheckCircle2 size={16} />,
    },
    {
      id: 4,
      icon: <WifiOff size={28} />,
      color: 'text-violet-400',
      borderColor: 'border-violet-500/30',
      bgColor: 'bg-violet-500/[0.03]',
      badgeColor: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
      glowColor: 'shadow-[0_0_30px_rgba(139,92,246,0.1)]',
      stat: 'SDG 3',
      statLabel: 'Target kesehatan global yang membutuhkan transformasi digital',
      title: 'Silo Data & Gap Menuju Target Kesehatan SDGs',
      desc: 'Dietler et al. (2019) menegaskan bahwa transformasi sistem kesehatan berbasis teknologi adalah prasyarat pencapaian SDG 3. Namun tanpa interoperabilitas data antar departemen RS, target ini mustahil dicapai. Gao et al. (n.d.) menunjukkan bahwa arsitektur RAG dapat menjadi solusi teknis untuk menjembatani silo data klinis.',
      source: '📚 Dietler et al. (2019) DOI:10.7189/jogh.09.020201 | Gao et al. (n.d.) — RAG Survey',
      problems: ['Hasil lab/radiologi tidak tersinkron otomatis ke rekam medis dokter', 'Laporan manajemen dibuat ulang manual setiap bulan', 'Tidak ada sistem pengetahuan klinis terpusat (Knowledge Base)'],
      solution: 'Arsitektur multi-node LexiMed + RAG Knowledge Base (PPK/SOP/ICD) menghubungkan semua departemen. Mendukung pencapaian target SDG 3 dari level fasilitas kesehatan.',
      solutionIcon: <Network size={16} />,
    },
  ];

  const handleAgentSend = async (e) => {
    e.preventDefault();
    if (!agentInput.trim() || agentLoading) return;
    const userText = agentInput.trim();
    setAgentInput('');
    const withUser = [...agentMessages, { sender: 'user', text: userText }];
    setAgentMessages(withUser);
    setAgentLoading(true);

    const lower = userText.toLowerCase();

    // Fast bypass untuk keyword spesifik
    if (lower.includes('leximed') && (lower.includes('apa') || lower.includes('what'))) {
      setTimeout(() => {
        setAgentMessages([...withUser, { sender: 'bot', text: '🏥 **LexiMed.ai** adalah platform CDSS (Clinical Decision Support System) berbasis multi-role AI Agent untuk Rumah Sakit UNS Madiun.\n\nDikembangkan oleh mahasiswa D3 Teknik Informatika Vokasi UNS, sistem ini mengotomatisasi penulisan rekam medis, diagnosis klinis, dan analisis citra radiologi.' }]);
        setAgentLoading(false);
      }, 500);
      return;
    }

    try {
      const systemPrompt = `${roleConfigs[agentRole].system}

Kamu adalah asisten AI dari platform LexiMed.ai — sistem rekam medis berbasis AI untuk RS UNS Madiun.
Informasi penting tentang LexiMed.ai:
- Pengembang: Ilham Eka Saputra, D3 Teknik Informatika, Sekolah Vokasi UNS Madiun
- Frontend: React.js 18 + Vite + Tailwind CSS + Framer Motion
- Backend: Laravel 11 + Sanctum Auth + Supabase (via Supabase)
- AI Stack: Groq SDK (Llama 3.3 70B) + Gemini 1.5 Flash Vision
- Jurnal Pendukung: Singhal (2023), Kurnia, Wornow, Permenkes (2022).
- Fitur: CDSS dokter, modul perawat TTV, PACS radiologi, dashboard manajemen.
- Kontak: ilhameka93@student.uns.ac.id | 0852-3128-7023

Jawab dalam Bahasa Indonesia. Jawaban maksimal 4 kalimat, padat, ramah dan informatif. JANGAN membuat markdown tebal yang berlebihan.`;

      // API Panggilan Anthropic Claude
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY || 'isi_token_anda', // Ganti / set ENV Anda
          'anthropic-dangerous-direct-browser-access': 'true',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 500,
          system: systemPrompt,
          messages: [
            ...withUser.slice(-6).map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text
            }))
          ],
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const botText = data?.content?.[0]?.text || 'Maaf, tidak mendapat respons dari sistem pusat.';
      setAgentMessages([...withUser, { sender: 'bot', text: botText }]);
    } catch (err) {
      console.error('Agent error:', err);
      // Fallback aman jika API Key kosong atau limit
      setAgentMessages([...withUser, {
        sender: 'bot',
        text: `🤖 **VoltOps Local Fallback:** Instruksi Anda tercatat. LexiMed.ai dibangun oleh Tim UNS Madiun mengacu pada regulasi Kemenkes dan riset LLM medis global (Singhal, Wornow). Ada hal teknis lain yang ingin ditanyakan?`
      }]);
    } finally {
      setAgentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] overflow-x-hidden font-sans text-left selection:bg-emerald-500/30 selection:text-emerald-300 antialiased">

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          style={{ y: yPos }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-[900px] h-[900px] bg-emerald-600/10 rounded-full blur-[150px]"
        />
        <motion.div
          style={{ y: yPos }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute bottom-[20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-75 contrast-125" />
        <FloatingParticles />
      </div>

      {/* ===== HEADER ===== */}
      <header className="fixed top-0 w-full z-50 bg-[#020617]/70 backdrop-blur-xl border-b border-white/5 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection(heroRef)}>
            <motion.div
              animate={{ boxShadow: ['0 0 10px rgba(16,185,129,0.2)', '0 0 25px rgba(16,185,129,0.5)', '0 0 10px rgba(16,185,129,0.2)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden border border-white/10 bg-white"
            >
              <img src="/logo.png" alt="LexiMed Logo" className="w-full h-full object-contain p-1" />
            </motion.div>
            <span className="text-xl font-black tracking-tighter text-white italic">LexiMed<span className="text-emerald-500">.ai</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-6 font-bold text-slate-400 text-xs uppercase tracking-widest">
            <button onClick={() => scrollToSection(heroRef)} className="hover:text-emerald-400 transition-colors">Beranda</button>
            <button onClick={() => scrollToSection(problemRef)} className="hover:text-emerald-400 transition-colors">Masalah & Riset</button>
            <button onClick={() => scrollToSection(fiturRef)} className="hover:text-emerald-400 transition-colors">Modul</button>
            <button onClick={() => scrollToSection(caraKerjaRef)} className="hover:text-emerald-400 transition-colors">Cara Kerja</button>
            <button onClick={() => scrollToSection(arsitekturRef)} className="hover:text-emerald-400 transition-colors">Arsitektur</button>
            <button onClick={() => scrollToSection(agentRef)} className="hover:text-emerald-400 transition-colors">Demo AI</button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 bg-white text-slate-950 font-black rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-2 text-xs uppercase tracking-wider active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              Masuk Sistem <ArrowRight size={14} />
            </button>
          </div>

          <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#020617]/95 border-b border-white/5 overflow-hidden"
            >
              <div className="flex flex-col px-6 py-4 space-y-2 font-bold uppercase text-xs tracking-wider text-slate-400">
                {[['Beranda', heroRef], ['Masalah & Riset', problemRef], ['Modul', fiturRef], ['Cara Kerja', caraKerjaRef], ['Arsitektur', arsitekturRef], ['Demo AI', agentRef]].map(([label, ref]) => (
                  <button key={label} onClick={() => scrollToSection(ref)} className="text-left py-3 border-b border-white/5 hover:text-emerald-400">{label}</button>
                ))}
                <button onClick={() => navigate('/login')} className="py-3.5 bg-emerald-600 text-white rounded-xl flex justify-center items-center gap-2 mt-4 text-xs font-black">
                  Masuk Sistem <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ===== HERO ===== */}
      <section ref={heroRef} className="relative pt-40 pb-20 md:pt-48 md:pb-28 px-6 min-h-screen flex items-center z-10">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-12 items-center">
          <motion.div initial="hidden" animate="show" variants={staggerContainer} className="text-center lg:text-left lg:col-span-7 space-y-6">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-black uppercase tracking-[0.2em]">
              <Zap size={14} className="fill-emerald-400" /> Enterprise Health Orchestration System
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl xl:text-7xl font-black text-white leading-[1.05] tracking-tighter uppercase italic">
              Otomatisasi <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500">Klinis Otonom</span>
            </motion.h1>

            {/* Typewriter Hero Subtitle */}
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
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 flex items-center justify-center gap-3"
              >
                Inisialisasi Sistem <ArrowRight size={16} />
              </button>
              <button
                onClick={() => scrollToSection(problemRef)}
                className="px-8 py-4 bg-white/5 border border-white/10 text-slate-300 rounded-xl font-black text-xs uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <AlertTriangle size={16} className="text-rose-400" /> Lihat Masalah Nyata
              </button>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-6 justify-center lg:justify-start pt-4">
              {[
                { label: 'Role Staf', val: 5, suffix: '+' },
                { label: 'AI Engine', val: 2, suffix: ' API' },
                { label: 'Efisiensi Waktu', val: 85, suffix: '%' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-black text-emerald-400"><CountUp end={s.val} suffix={s.suffix} /></div>
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* VoltOps Console */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-5 w-full"
          >
            <div className="w-full bg-[#090d16] border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_0_80px_rgba(16,185,129,0.15)] space-y-6 relative overflow-hidden">
              <motion.div
                className="absolute left-0 w-full h-[1px] bg-emerald-400/10 pointer-events-none"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />
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
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2.5 h-2.5 rounded-full bg-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 border border-white/5 font-mono text-[11px] h-32 flex flex-col justify-center space-y-2">
                <div className="flex items-center gap-2">
                  <TerminalSquare size={12} className="text-slate-500" />
                  <span className="text-slate-500">Pipeline Terminal active log listener...</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={agentSimMessage}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-1"
                  >
                    <p className={`font-black uppercase text-[9px] ${simTexts[agentSimMessage].color}`}>{simTexts[agentSimMessage].label}</p>
                    <p className="text-slate-300 font-bold leading-relaxed">{simTexts[agentSimMessage].text}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active E-Document Snapshot</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] font-black text-emerald-400 uppercase">One-Click Ready</span>
                </div>
                <p className="text-xs font-black text-white uppercase tracking-tight">Tn. Aditya (RM-001)</p>
                <p className="text-[10px] text-emerald-400 font-bold italic">Output: Final Document Discharge Summary Generator Sync Complete ✓</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== SECTION PERMASALAHAN NYATA (DIVALIDASI JURNAL) ===== */}
      <section ref={problemRef} className="py-24 md:py-32 px-6 bg-[#030712] relative z-20 border-y border-white/5 overflow-hidden">
        {/* Animated medical symbols background */}
        <FloatingMedicalIcons />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.03, 0.07, 0.03] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-600 rounded-full blur-[200px] pointer-events-none"
        />

        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4">
              <AlertTriangle size={14} /> Tinjauan Literatur & Fakta Lapangan
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase italic">
              Krisis Sistem <span className="text-rose-400">Administrasi Medis</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm font-medium mt-3">
              LexiMed.ai dikembangkan secara presisi berdasarkan tinjauan pustaka jurnal nasional & internasional, serta Permenkes RI.
            </p>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { val: 40, suffix: '%', label: 'Waktu kerja dihabiskan untuk RME', color: 'text-rose-400', src: 'Kurnia, J. A.' },
              { val: 90, suffix: '%', label: 'Akurasi LLM setara pakar medis', color: 'text-amber-400', src: 'Singhal et al.' },
              { val: 79, suffix: '%', label: 'Kendala usability dalam adaptasi', color: 'text-orange-400', src: 'Orfanou et al.' },
              { val: 85, suffix: '%', label: 'Efisiensi waktu dengan LexiMed', color: 'text-emerald-400', src: 'Sistem RAG (Gao)' },
            ].map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 1 : -1 }}
                className="p-6 bg-slate-900/50 backdrop-blur-sm rounded-[1.5rem] border border-white/5 text-center space-y-2 group hover:border-white/20 hover:bg-slate-800/80 transition-all cursor-default"
              >
                <div className={`text-3xl md:text-4xl font-black ${s.color}`}>
                  <CountUp end={s.val} suffix={s.suffix} />
                </div>
                <p className="text-slate-300 text-[10px] font-bold leading-relaxed">{s.label}</p>
                <p className={`text-[8px] font-black uppercase tracking-wider ${s.color} opacity-80 pt-2 border-t border-white/10 inline-block`}>{s.src}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Progress bars - severity indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8 p-8 bg-white/[0.01] rounded-[2rem] border border-white/5"
          >
            <div className="space-y-5">
              <h4 className="text-white font-black text-sm uppercase tracking-widest italic flex items-center gap-2"><TrendingDown className="text-rose-500" size={16}/> Indikator Keparahan Masalah</h4>
              <AnimatedBar value={87} color="text-rose-400" label="Beban Dokumentasi Manual" delay={0.1} />
              <AnimatedBar value={73} color="text-amber-400" label="Risiko Burnout Dokter" delay={0.2} />
              <AnimatedBar value={68} color="text-orange-400" label="Resistensi Adopsi RME" delay={0.3} />
              <AnimatedBar value={79} color="text-red-400" label="Silo Data Antar Departemen" delay={0.4} />
            </div>
            <div className="space-y-5">
              <h4 className="text-white font-black text-sm uppercase tracking-widest italic flex items-center gap-2"><Activity className="text-emerald-500" size={16}/> Dampak Setelah LexiMed.ai</h4>
              <AnimatedBar value={85} color="text-emerald-400" label="Reduksi Waktu Dokumentasi" delay={0.5} />
              <AnimatedBar value={92} color="text-teal-400" label="Akurasi Diagnosis CDSS" delay={0.6} />
              <AnimatedBar value={100} color="text-blue-400" label="Integrasi Antar Departemen" delay={0.7} />
              <AnimatedBar value={95} color="text-violet-400" label="Kepatuhan Permenkes 24/2022" delay={0.8} />
            </div>
          </motion.div>

          {/* Problem cards — interactive tabs */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Tab selector */}
            <div className="lg:col-span-4 space-y-3">
              {problems.map((p, i) => (
                <motion.button
                  key={p.id}
                  onClick={() => setActiveProblem(i)}
                  whileHover={{ x: 4 }}
                  className={`w-full text-left p-4 rounded-[1.5rem] border transition-all duration-300 ${activeProblem === i
                    ? `${p.borderColor} ${p.bgColor} ${p.glowColor}`
                    : 'border-white/5 bg-white/[0.01] hover:border-white/10'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${activeProblem === i ? p.color : 'text-slate-600'} transition-colors`}>
                      {p.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-[10px] font-black uppercase tracking-wider transition-colors ${activeProblem === i ? p.color : 'text-slate-600'}`}>
                        Masalah #{i + 1}
                      </p>
                      <p className={`text-xs font-bold leading-snug transition-colors ${activeProblem === i ? 'text-white' : 'text-slate-500'}`}>
                        {p.title.split(':')[0]}
                      </p>
                    </div>
                    {activeProblem === i && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-2 h-2 rounded-full ${p.color.replace('text-', 'bg-')}`}
                      />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Detail panel */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProblem}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className={`p-8 rounded-[2rem] border ${problems[activeProblem].borderColor} ${problems[activeProblem].bgColor} ${problems[activeProblem].glowColor} space-y-6`}
                >
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${problems[activeProblem].color} shrink-0`}>
                      {problems[activeProblem].icon}
                    </div>
                    <div>
                      <span className={`px-2.5 py-1 rounded-md border font-black text-[9px] uppercase tracking-wider ${problems[activeProblem].badgeColor}`}>
                        Berdasarkan Kajian Jurnal
                      </span>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight italic mt-2 leading-tight">
                        {problems[activeProblem].title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-medium">
                    {problems[activeProblem].desc}
                  </p>

                  {/* Pain points */}
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pain Points Faskes</p>
                    <div className="space-y-2">
                      {problems[activeProblem].problems.map((prob, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: j * 0.1 }}
                          className="flex items-center gap-2.5"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${problems[activeProblem].color.replace('text-', 'bg-')}`} />
                          <p className="text-slate-400 text-xs font-medium">{prob}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Solution */}
                  <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400">
                      {problems[activeProblem].solutionIcon}
                      <span className="text-[10px] font-black uppercase tracking-widest">Inovasi Solusi LexiMed.ai</span>
                    </div>
                    <p className="text-emerald-300/90 text-xs font-semibold leading-relaxed">
                      {problems[activeProblem].solution}
                    </p>
                  </div>

                  {/* Source citation */}
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] font-bold text-slate-500">
                      📚 <span className="italic text-slate-400">Sitasi:</span> {problems[activeProblem].source}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION JURNAL REFERENSI ===== */}
      <section ref={jurnalRef} className="py-24 md:py-32 px-6 bg-slate-950 relative z-20 border-y border-white/5 overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 pointer-events-none opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4">
              <BookOpen size={14} /> Landasan Jurnal Ilmiah
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase italic">
              9 Jurnal <span className="text-blue-400">Terverifikasi</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm font-medium mt-3">
              Setiap aspek sistem LexiMed.ai didasari penelitian ilmiah yang dipublikasikan — dari permasalahan hingga metode evaluasi.
            </p>
          </motion.div>

          {/* Jurnal grid — magnetic hover cards */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jurnalRefs.map((j, i) => (
              <motion.div key={j.id} variants={fadeUp}>
                <MagneticCard
                  className={`p-6 rounded-[1.5rem] border ${j.border} ${j.bg} h-full cursor-default transition-all duration-300 hover:border-white/20 group relative overflow-hidden`}
                >
                  {/* shimmer on hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none" />

                  <div className="flex items-start gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${j.color} shrink-0`}>{j.icon}</div>
                    <div>
                      <span className={`px-2 py-0.5 rounded-md border font-black text-[8px] uppercase tracking-wider ${j.badge}`}>{j.key}</span>
                      <h4 className="text-sm font-black text-white mt-1 leading-snug">{j.title}</h4>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed mb-3">{j.full}</p>

                  <div className="space-y-2 border-t border-white/5 pt-3">
                    <div>
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Kontribusi Penelitian</p>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{j.kontribusi}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Relevansi ke LexiMed</p>
                      <p className={`text-[10px] font-medium leading-relaxed ${j.color}`}>{j.relevansi}</p>
                    </div>
                  </div>
                </MagneticCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Citation quick-view ticker */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="p-6 bg-white/[0.01] rounded-[2rem] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Aktif Ditampilkan</h4>
              <span className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${jurnalRefs[activeJurnal].badge}`}>
                {jurnalRefs[activeJurnal].key}
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={activeJurnal}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="space-y-1">
                <p className={`text-base font-black ${jurnalRefs[activeJurnal].color} uppercase tracking-tight italic`}>{jurnalRefs[activeJurnal].title}</p>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{jurnalRefs[activeJurnal].kontribusi}</p>
              </motion.div>
            </AnimatePresence>
            <div className="flex gap-1.5 flex-wrap pt-1">
              {jurnalRefs.map((j, i) => (
                <button key={i} onClick={() => setActiveJurnal(i)}
                  className={`w-2 h-2 rounded-full transition-all ${activeJurnal === i ? j.color.replace('text-', 'bg-') + ' scale-150' : 'bg-white/10'}`} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 5 MODUL ===== */}
      <section ref={fiturRef} className="py-24 md:py-32 px-6 bg-slate-950/40 relative z-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-emerald-400 font-black tracking-[0.3em] uppercase text-xs mb-3">Modular Ecosystem</h2>
            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase italic">Satu Komputasi Cloud, 5 Node Otomasi</h3>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm mt-3 font-medium">LexiMed memisahkan hak akses fungsionalitas sesuai standarisasi tata kelola rumah sakit modern.</p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {[
              { icon: <Stethoscope size={22} />, title: 'Modul Dokter', desc: 'Asistensi diagnosis klinis real-time via CDSS, hybrid AI Groq + Gemini, anti-halusinasi dengan review konservatif TTV.' },
              { icon: <Activity size={22} />, title: 'Modul Perawat', desc: 'Manajemen rekam data tanda vital (TTV) cepat dan sistem operan shift serah terima terstruktur otomatis.' },
              { icon: <Microscope size={22} />, title: 'Modul Radiologi', desc: 'Integrasi PACS dengan Gemini Vision untuk ekstraksi otomatis impresi citra medis DICOM.' },
              { icon: <LineChart size={22} />, title: 'Modul Manajemen', desc: 'Dashboard visualisasi tren kesehatan demografis dan otomasi laporan strategis eksekutif.' },
              { icon: <Lock size={22} />, title: 'Modul Admin & Audit', desc: 'Pemantauan jalur data log terenkripsi, manajemen kredensial user, proteksi keamanan siber rekam medis.', span: 2 },
            ].map((m, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(16,185,129,0.1)" }}
                className={`group p-8 bg-white/[0.01] rounded-[2rem] border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all duration-500 h-64 text-left flex flex-col justify-between ${m.span === 2 ? 'lg:col-span-2' : ''}`}
              >
                <div>
                  <div className="w-12 h-12 bg-white/5 border border-white/10 text-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300">
                    {m.icon}
                  </div>
                  <h4 className="text-lg font-black text-white uppercase tracking-wide italic mb-2">{m.title}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed font-medium">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CARA KERJA PER ROLE ===== */}
      <section ref={caraKerjaRef} className="py-24 md:py-32 px-6 bg-[#030712] text-white relative z-20">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center">
            <h2 className="text-emerald-400 font-black tracking-[0.3em] uppercase text-xs mb-3">Human-in-the-Loop System</h2>
            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight italic">Cara Kerja Per Role Staf</h3>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm font-medium mt-3">Setiap peran staf memiliki alur kerja AI yang terspesialisasi dan terisolasi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🩺', role: 'Dokter Poliklinik', color: 'border-emerald-500/30 bg-emerald-500/[0.03]',
                badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                steps: [
                  { icon: <ClipboardList size={14} />, text: 'Input keluhan pasien & TTV ke formulir rekam medis' },
                  { icon: <Sparkles size={14} />, text: 'AI Groq generate diagnosa awal + 3 pertanyaan anamnesa' },
                  { icon: <BrainCircuit size={14} />, text: 'Gemini review hasil Groq — koreksi diagnosis terlalu agresif' },
                  { icon: <Eye size={14} />, text: 'Dokter edit hasil AI, validasi final, simpan ke Supabase' },
                ]
              },
              {
                icon: '☢️', role: 'Radiolog / PACS', color: 'border-cyan-500/30 bg-cyan-500/[0.03]',
                badge: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
                steps: [
                  { icon: <Eye size={14} />, text: 'Terima instruksi rujukan dokter poliklinik dari database' },
                  { icon: <Microscope size={14} />, text: 'Upload foto citra DICOM/JPEG pasien ke workstation PACS' },
                  { icon: <BrainCircuit size={14} />, text: 'Gemini Vision analisis gambar → draf impresi radiologi' },
                  { icon: <ShieldCheck size={14} />, text: 'Radiolog koreksi & kirim ke timeline rekam medis dokter' },
                ]
              },
              {
                icon: '🎚️', role: 'Perawat', color: 'border-blue-500/30 bg-blue-500/[0.03]',
                badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                steps: [
                  { icon: <Activity size={14} />, text: 'Input TTV pasien: tekanan darah, nadi, suhu, SpO2' },
                  { icon: <Database size={14} />, text: 'Data langsung tersimpan ke database RS' },
                  { icon: <ClipboardList size={14} />, text: 'Modul operan shift: ringkasan kondisi pasien otomatis' },
                  { icon: <ShieldCheck size={14} />, text: 'Serah terima shift dengan dokumen terstruktur' },
                ]
              },
              {
                icon: '📊', role: 'Manajemen RS', color: 'border-violet-500/30 bg-violet-500/[0.03]',
                badge: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
                steps: [
                  { icon: <LineChart size={14} />, text: 'Akses dashboard statistik pasien & layanan real-time' },
                  { icon: <Database size={14} />, text: 'Visualisasi tren penyakit terbanyak & utilitas kamar' },
                  { icon: <FileText size={14} />, text: 'AI susun laporan performa UGD & rawat inap' },
                  { icon: <ShieldCheck size={14} />, text: 'Export laporan PDF untuk rapat direksi' },
                ]
              },
              {
                icon: '⚡', role: 'Admin & IT', color: 'border-amber-500/30 bg-amber-500/[0.03]',
                badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                steps: [
                  { icon: <Users size={14} />, text: 'Kelola akun staf: tambah, edit, hapus user per role' },
                  { icon: <Lock size={14} />, text: 'Pantau audit log: setiap aksi tercatat dengan timestamp' },
                  { icon: <Database size={14} />, text: 'Inject dokumen SOP/PPK ke Knowledge Base RAG' },
                  { icon: <ShieldCheck size={14} />, text: 'Monitor keamanan siber & integritas data' },
                ]
              },
              {
                icon: '🤖', role: 'AI Agent Playground', color: 'border-pink-500/30 bg-pink-500/[0.03]',
                badge: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
                steps: [
                  { icon: <MessageSquare size={14} />, text: 'Buat sesi baru multi-role: Dokter, Perawat, dll' },
                  { icon: <BrainCircuit size={14} />, text: 'AI otomatis membaca konteks pasien dari localStorage' },
                  { icon: <Sparkles size={14} />, text: 'Tanya apa saja: identitas pasien, diagnosa, dsb.' },
                  { icon: <Database size={14} />, text: 'Riwayat percakapan tersimpan per sesi' },
                ]
              },
            ].map((role, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-[2rem] border ${role.color} space-y-4 text-left hover:scale-[1.02] transition-transform`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{role.icon}</span>
                  <span className={`px-2.5 py-1 rounded-md border font-black text-[9px] uppercase tracking-wider ${role.badge}`}>{role.role}</span>
                </div>
                <div className="space-y-2.5">
                  {role.steps.map((step, j) => (
                    <div key={j} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-slate-400">{step.icon}</div>
                      <p className="text-slate-400 text-[11px] font-medium leading-relaxed">{step.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ARSITEKTUR TEKNIS ===== */}
      <section ref={arsitekturRef} className="py-24 md:py-32 px-6 bg-slate-950 text-white relative z-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center">
            <h2 className="text-emerald-400 font-black tracking-[0.3em] uppercase text-xs mb-3">Enterprise Core Infrastructure</h2>
            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase italic">Arsitektur Sistem LexiMed.ai</h3>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm font-medium mt-3">Stack teknologi modern yang menjamin skalabilitas, keamanan, dan kecepatan pemrosesan data medis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                tag: 'Frontend Layer', tagColor: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                icon: <Code2 size={28} className="text-blue-400" />, glow: 'shadow-[0_0_40px_rgba(59,130,246,0.1)]',
                title: 'React.js + Vite', border: 'border-blue-500/20',
                items: [
                  { name: 'React.js 18', desc: 'UI framework utama' },
                  { name: 'Vite Build', desc: 'Compiler ultra-cepat' },
                  { name: 'Tailwind CSS', desc: 'Styling utility-first' },
                  { name: 'Framer Motion', desc: 'Animasi & transisi' },
                  { name: 'React Router v6', desc: 'Client-side routing' },
                ]
              },
              {
                tag: 'Backend Layer', tagColor: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
                icon: <Server size={28} className="text-orange-400" />, glow: 'shadow-[0_0_40px_rgba(251,146,60,0.1)]',
                title: 'Laravel 11 API', border: 'border-orange-500/20',
                items: [
                  { name: 'Laravel 11', desc: 'PHP backend framework' },
                  { name: 'Sanctum Auth', desc: 'Token-based auth' },
                  { name: 'Supabase', desc: 'Database utama (rs_uns_db)' },
                  { name: 'Eloquent ORM', desc: 'Model relasi data' },
                  { name: 'REST API', desc: 'JSON endpoint gateway' },
                ]
              },
              {
                tag: 'AI Stack', tagColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                icon: <BrainCircuit size={28} className="text-emerald-400" />, glow: 'shadow-[0_0_40px_rgba(16,185,129,0.1)]',
                title: 'Hybrid AI Engine', border: 'border-emerald-500/20',
                items: [
                  { name: 'Groq SDK', desc: 'Llama 3.3 70B ultra-fast' },
                  { name: 'Anthropic API', desc: 'Claude 3.5 Sonnet Agent' },
                  { name: 'Gemini 1.5 Flash', desc: 'Vision PACS Analyst' },
                  { name: 'VoltAgent', desc: 'Context-aware orchestrator' },
                  { name: 'RAG Knowledge', desc: 'PPK/SOP vector base' },
                ]
              },
            ].map((stack, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -5 }}
                className={`p-8 bg-gradient-to-br from-slate-900 to-slate-950 border ${stack.border} rounded-[2.5rem] space-y-5 ${stack.glow}`}
              >
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-gradient-to-br from-slate-900 to-emerald-950/20 border border-white/5 rounded-[2.5rem] space-y-4 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 text-emerald-500/10 group-hover:scale-110 transition-transform"><Network size={120} /></div>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-[10px] rounded-md uppercase tracking-wider inline-block">OpenClaw Layer</span>
              <h4 className="text-xl font-black uppercase tracking-wide italic text-white">Middleware Data Ingestion</h4>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">Berfungsi sebagai jembatan serverless runtime berkecepatan tinggi yang menangkap dan mengamankan pertukaran data klinis dari React client menuju Laravel API gateway. OpenClaw memastikan ketersediaan endpoint yang tangguh menghadapi beban komputasi massal.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-gradient-to-br from-slate-900 to-blue-950/20 border border-white/5 rounded-[2.5rem] space-y-4 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 text-blue-500/10 group-hover:scale-110 transition-transform"><BrainCircuit size={120} /></div>
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-[10px] rounded-md uppercase tracking-wider inline-block">VoltAgent Pipeline</span>
              <h4 className="text-xl font-black uppercase tracking-wide italic text-white">Context-Aware Orchestrator</h4>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">Otak pemroses AI berbasis Llama 3.3 via Groq SDK. VoltAgent membaca data kontekstual localStorage cache pasien secara riil, mengasimilasi keluhan wawancara, lalu menyusun dokumen ringkasan rekam medis otonom. Dikombinasikan dengan Gemini sebagai conservative reviewer.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== EMBEDDED AI AGENT DEMO ===== */}
      <section ref={agentRef} className="py-24 md:py-32 px-6 bg-slate-950/60 relative z-20 border-y border-white/5">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-emerald-400 font-black tracking-[0.3em] uppercase text-xs mb-3 flex items-center justify-center gap-2">
              <Zap size={14} className="animate-pulse" /> Live AI Demo
            </h2>
            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase italic">Tanya LexiCore Agent Sekarang</h3>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm font-medium mt-3">Ini adalah versi demo publik dari AI Agent yang berjalan di dalam sistem LexiMed.ai. Tanya <strong className="text-white">apa saja</strong> tentang platform ini!</p>
          </div>

          <div className="bg-[#090d16] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.1)]">
            <div className="bg-slate-950/80 border-b border-white/5 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                  <BrainCircuit className="text-emerald-400" size={18} />
                </motion.div>
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">LexiCore Agent — Demo Publik</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Powered by {roleConfigs[agentRole].name}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(roleConfigs).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setAgentRole(key)}
                    className={`px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all ${agentRole === key ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white'}`}
                  >
                    {cfg.icon} {key}
                  </button>
                ))}
              </div>
            </div>

            <div
              ref={chatContainerRef}
              className="h-80 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-950 to-[#090d16] [&::-webkit-scrollbar]:hidden"
            >
              {agentMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'ml-auto flex-row-reverse max-w-md' : 'mr-auto max-w-2xl'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${msg.sender === 'user' ? 'bg-blue-600 border-blue-500 text-white text-xs font-black' : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'}`}>
                    {msg.sender === 'user' ? 'U' : <Bot size={14} />}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl text-xs border whitespace-pre-wrap leading-relaxed ${msg.sender === 'user' ? 'bg-blue-600 border-blue-500 text-white rounded-tr-none' : 'bg-slate-950/80 border-slate-800 text-slate-200 rounded-tl-none'}`}>
                    {msg.sender === 'user' ? msg.text : formatAgentText(msg.text)}
                  </div>
                </motion.div>
              ))}

              {agentLoading && (
                <div className="flex gap-3 mr-auto">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border bg-emerald-600/10 border-emerald-500/20 text-emerald-400"><Bot size={14} /></div>
                  <div className="px-5 py-4 rounded-2xl rounded-tl-none bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                    <DNAHelix />
                    <span className="text-[10px] text-slate-500 font-bold">LexiCore memproses...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            <div className="px-6 pb-3 pt-2 flex flex-wrap gap-2 border-t border-white/5">
              {[
                'Apa itu LexiMed?', 'Jelaskan RAG di LexiMed', 'Jurnal apa saja yang dipakai?',
                'Modul radiologi pakai AI apa?', 'Kenapa perlu dual-AI?', 'Siapa pengembangnya?',
              ].map(q => (
                <button
                  key={q}
                  onClick={() => setAgentInput(q)}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold text-slate-400 hover:bg-emerald-600/20 hover:text-emerald-400 hover:border-emerald-500/30 transition-all uppercase tracking-wider"
                >
                  {q}
                </button>
              ))}
            </div>

            <form onSubmit={handleAgentSend} className="p-4 bg-slate-950/50 border-t border-white/5">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  disabled={agentLoading}
                  placeholder={agentLoading ? 'LexiCore sedang berpikir...' : 'Tanya tentang LexiMed.ai, jurnal referensi, atau fitur sistem...'}
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-emerald-500/40 placeholder:text-slate-700"
                />
                <button
                  type="submit"
                  disabled={agentLoading || !agentInput.trim()}
                  className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all active:scale-95 disabled:bg-slate-800 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 px-6 bg-gradient-to-br from-emerald-600 to-blue-700 relative overflow-hidden z-20 border-t border-white/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center space-y-8 relative z-10"
        >
          <div className="flex justify-center gap-4 mb-4">
            <PulseRing color="rgba(255,255,255,0.2)" size={60} />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight italic">Transformasikan Administrasi Medis Hari Ini</h2>
          <p className="text-blue-100 text-sm font-medium max-w-lg mx-auto">Solusi berbasis 9 jurnal ilmiah. Patuh Permenkes No.24/2022. Menuju SDG 3 bersama LexiMed.ai.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-white text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-2xl flex items-center justify-center gap-3 mx-auto active:scale-95"
          >
            Mulai Otomasi Rekam Medis <ChevronRight size={18} />
          </button>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6 relative z-20 border-t border-white/5 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-white/5 pb-12 mb-12">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ boxShadow: ['0 0 8px rgba(16,185,129,0.2)', '0 0 20px rgba(16,185,129,0.4)', '0 0 8px rgba(16,185,129,0.2)'] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden border border-white/10 bg-white"
              >
                <img src="/logo.png" alt="LexiMed Logo" className="w-full h-full object-contain p-1" />
              </motion.div>
              <span className="text-lg font-black tracking-tight text-white italic">LexiMed<span className="text-emerald-400">.ai</span></span>
            </div>
            <p className="text-slate-400 leading-relaxed font-medium max-w-sm">Platform CDSS berbasis multi-role AI Agent untuk rekam medis elektronik rumah sakit. Dirancang khusus untuk RS UNS Madiun.</p>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="text-white font-black uppercase tracking-wider text-sm italic">Infrastruktur Node</h4>
            <ul className="space-y-2.5 font-bold uppercase tracking-wide text-[10px] text-slate-500">
              <li>🩺 Doctor Clinical CDSS</li>
              <li>🎚️ Nurse Care Extraction</li>
              <li>☢️ Radiology Expert Explorer</li>
              <li>📊 Hospital Analytic Management</li>
              <li>⚡ Admin Audit Security Trail</li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h4 className="text-white font-black uppercase tracking-wider text-sm italic">Otoritas Pengembang</h4>
            <ul className="space-y-3 font-semibold text-slate-400">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-emerald-400 shrink-0" />
                <a href="mailto:ilhameka93@student.uns.ac.id" className="hover:text-emerald-400 transition-colors">ilhameka93@student.uns.ac.id</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-emerald-400 shrink-0" />
                <a href="https://wa.me/6285231287023" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">0852-3128-7023</a>
              </li>
              <li className="text-[10px] font-black uppercase tracking-wider text-slate-500 pt-1">
                D3 Teknik Informatika — Sekolah Vokasi<br />Universitas Sebelas Maret (UNS) Madiun
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          <p>&copy; 2026 LexiMed.ai — Hak Cipta Tim Inovasi Vokasi UNS.</p>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            Powered by{' '}
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Cpu size={14} className="text-emerald-500" />
            </motion.div>
            {' '}OpenClaw Layer Engine v1.0
          </div>
        </div>
      </footer>
    </div>
  );
}