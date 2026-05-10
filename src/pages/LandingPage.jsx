import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, Zap, Activity, Cpu, UserCheck, 
  Database, FileText, ChevronDown, Menu, X, BrainCircuit, 
  Stethoscope, Microscope, LineChart, Lock, ChevronRight, PlayCircle
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const heroRef = useRef(null);
  const fiturRef = useRef(null);
  const caraKerjaRef = useRef(null);
  
  // Efek Parallax
  const { scrollYProgress } = useScroll();
  const yPos = useTransform(scrollYProgress, [0, 1], [0, 300]);

  // Deteksi Scroll untuk Navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (ref) => {
    setMobileMenuOpen(false);
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Variasi Animasi
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 15 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden font-sans selection:bg-blue-500 selection:text-white">
      
      {/* ===== HEADER / NAVBAR ===== */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection(heroRef)}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <BrainCircuit className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              LexiMed<span className="text-blue-600">.ai</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 font-semibold text-slate-600">
            <button onClick={() => scrollToSection(heroRef)} className="hover:text-blue-600 transition-colors">Beranda</button>
            <button onClick={() => scrollToSection(fiturRef)} className="hover:text-blue-600 transition-colors">Fitur Unggulan</button>
            <button onClick={() => scrollToSection(caraKerjaRef)} className="hover:text-blue-600 transition-colors">Cara Kerja</button>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/20">
              Masuk Sistem <ArrowRight size={18} />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-slate-900 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200 shadow-xl overflow-hidden"
            >
              <div className="flex flex-col px-6 py-4 space-y-4 font-bold text-slate-700">
                <button onClick={() => scrollToSection(heroRef)} className="text-left py-2 border-b border-slate-100">Beranda</button>
                <button onClick={() => scrollToSection(fiturRef)} className="text-left py-2 border-b border-slate-100">Fitur Unggulan</button>
                <button onClick={() => scrollToSection(caraKerjaRef)} className="text-left py-2 border-b border-slate-100">Cara Kerja</button>
                <button onClick={() => navigate('/login')} className="py-3 bg-blue-600 text-white rounded-xl flex justify-center items-center gap-2 mt-4 shadow-lg shadow-blue-600/30">
                  Masuk Sistem <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section ref={heroRef} className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background Orbs */}
        <motion.div style={{ y: yPos }} animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-0 -left-20 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] -z-10" />
        <motion.div style={{ y: yPos }} animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }} transition={{ duration: 20, repeat: Infinity, delay: 2, ease: "linear" }} className="absolute bottom-0 -right-20 w-[600px] h-[600px] bg-emerald-400/20 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" animate="show" variants={staggerContainer} className="text-center lg:text-left z-10">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md text-blue-700 rounded-full text-xs md:text-sm font-black uppercase tracking-widest mb-6 border border-blue-200/50 shadow-sm">
              <Zap size={16} className="text-amber-500 fill-amber-500" /> Revolusi AI Medis Vokasi
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Sistem Medis <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Berbasis AI.</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-600 mt-6 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Otomatisasi ringkasan rekam medis, operan shift, analisis radiologi, hingga laporan eksekutif dalam satu ekosistem LLM canggih. Akurat, Aman, dan Super Cepat.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mt-10">
              <button onClick={() => navigate('/login')} className="w-full sm:w-auto group px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 active:scale-95">
                Coba LexiMed Sekarang <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => scrollToSection(caraKerjaRef)} className="w-full sm:w-auto px-8 py-4 bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
                <PlayCircle size={20} className="text-slate-400" /> Lihat Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Floating UI Elements Illustration */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.5 }} className="hidden lg:block relative h-[600px] w-full">
            {/* Card 1 */}
            <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-10 right-10 w-80 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-2xl shadow-blue-900/10 z-20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><Stethoscope size={24} /></div>
                <div><h4 className="font-bold text-slate-900">Dr. Ilham Eka</h4><p className="text-xs text-slate-500 font-medium">Spesialis Penyakit Dalam</p></div>
              </div>
              <div className="space-y-3">
                <div className="h-2 bg-slate-100 rounded-full w-full overflow-hidden"><div className="h-full bg-emerald-500 w-full animate-pulse"></div></div>
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1"><ShieldCheck size={14}/> AI Summary Generated</p>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-64 left-0 w-72 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl shadow-emerald-900/20 z-30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><Cpu className="text-emerald-400" size={20} /><span className="text-white font-bold text-sm">LexiCore v1.0</span></div>
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-md">Processing</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">"Pasien terindikasi dehidrasi ringan berdasarkan parameter vital. Rekomendasi rehidrasi IV sesuai SOP RS."</p>
            </motion.div>

            {/* Background Graphic */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-[1px] border-slate-200/50 rounded-full border-dashed animate-[spin_60s_linear_infinite]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-[1px] border-blue-200/50 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
          </motion.div>
        </div>
      </section>

      {/* ===== FITUR UNGGULAN SECTION ===== */}
      <section ref={fiturRef} className="py-24 px-6 bg-white relative z-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-blue-600 font-black tracking-widest uppercase text-sm mb-3">Kapabilitas Sistem</h2>
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Satu Platform, Lima Modul Profesional</h3>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">LexiMed dirancang spesifik untuk mengatasi beban administratif setiap departemen di fasilitas kesehatan Anda.</p>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <motion.div variants={fadeUp} className="group p-8 bg-slate-50 rounded-[2.5rem] hover:bg-blue-600 transition-colors duration-300">
              <div className="w-16 h-16 bg-white text-blue-600 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                <Stethoscope size={32} />
              </div>
              <h4 className="text-xl font-black text-slate-900 group-hover:text-white mb-3">Modul Dokter</h4>
              <p className="text-slate-500 group-hover:text-blue-100 leading-relaxed text-sm">Otomatisasi resume medis SOAP dan pencarian pedoman klinis (RAG) instan saat menangani pasien.</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={fadeUp} className="group p-8 bg-slate-50 rounded-[2.5rem] hover:bg-emerald-600 transition-colors duration-300">
              <div className="w-16 h-16 bg-white text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                <Activity size={32} />
              </div>
              <h4 className="text-xl font-black text-slate-900 group-hover:text-white mb-3">Modul Perawat</h4>
              <p className="text-slate-500 group-hover:text-emerald-100 leading-relaxed text-sm">Pembuatan catatan keperawatan dan operan shift (Handover SBAR) otomatis dari narasi bebas atau suara.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeUp} className="group p-8 bg-slate-50 rounded-[2.5rem] hover:bg-purple-600 transition-colors duration-300">
              <div className="w-16 h-16 bg-white text-purple-600 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                <Microscope size={32} />
              </div>
              <h4 className="text-xl font-black text-slate-900 group-hover:text-white mb-3">Modul Radiologi</h4>
              <p className="text-slate-500 group-hover:text-purple-100 leading-relaxed text-sm">Ekstraksi temuan klinis dari teks bacaan radiografer menjadi kesimpulan terstruktur yang siap divalidasi.</p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={fadeUp} className="group p-8 bg-slate-50 rounded-[2.5rem] hover:bg-amber-500 transition-colors duration-300">
              <div className="w-16 h-16 bg-white text-amber-500 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                <LineChart size={32} />
              </div>
              <h4 className="text-xl font-black text-slate-900 group-hover:text-white mb-3">Modul Manajemen</h4>
              <p className="text-slate-500 group-hover:text-amber-100 leading-relaxed text-sm">Dashboard analitik *real-time* dan pembuatan laporan eksekutif otomatis untuk Direktur / CEO RS.</p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div variants={fadeUp} className="group p-8 bg-slate-50 rounded-[2.5rem] hover:bg-slate-800 transition-colors duration-300 lg:col-span-2">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-16 h-16 shrink-0 bg-white text-slate-800 rounded-2xl flex items-center justify-center shadow-sm mb-6 md:mb-0 group-hover:scale-110 transition-transform duration-300">
                  <Lock size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 group-hover:text-white mb-3">Keamanan & Tata Kelola IT (Admin)</h4>
                  <p className="text-slate-500 group-hover:text-slate-300 leading-relaxed text-sm max-w-xl">
                    Dilengkapi dengan *Security Audit Trail* (pencatatan aktivitas) yang sesuai dengan standar HIPAA dan rekam medis elektronik (RME) Kemenkes RI.
                  </p>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* ===== CARA KERJA SECTION ===== */}
      <section ref={caraKerjaRef} className="py-24 px-6 bg-slate-950 text-white relative z-20 overflow-hidden">
        {/* Dekorasi Garis */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-blue-500/30 to-transparent hidden lg:block"></div>
        
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Integritas Human-in-the-Loop</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">AI kami bekerja sangat cepat, namun keputusan akhir tetap berada di tangan profesional medis.</p>
          </div>

          <div className="space-y-12 lg:space-y-0">
            {/* Step 1 & 2 */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 relative z-10 text-right lg:mr-auto lg:ml-0 shadow-2xl">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-black text-xl mb-6 ml-auto shadow-lg shadow-blue-500/30">1</div>
                <h3 className="text-2xl font-bold mb-3 text-white">Input Data Mentah</h3>
                <p className="text-slate-400">Tenaga medis mengetik keluhan bebas, hasil observasi berantakan, atau *copy-paste* catatan lama ke dalam sistem LexiMed.</p>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 relative z-10 lg:mt-32 shadow-2xl shadow-emerald-900/20">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center font-black text-xl mb-6 shadow-lg shadow-emerald-500/30">2</div>
                <h3 className="text-2xl font-bold mb-3 text-white">Ekstraksi LLM</h3>
                <p className="text-slate-400">Mesin AI memahami konteks medis, merapikan data menjadi format standar (seperti SOAP atau SBAR), dan mencari diagnosis terkait di *Knowledge Base* RS.</p>
              </motion.div>
            </div>

            {/* Step 3 & 4 */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 mt-12 lg:-mt-16">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 relative z-10 text-right lg:mr-auto lg:ml-0 shadow-2xl shadow-purple-900/20">
                <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-black text-xl mb-6 ml-auto shadow-lg shadow-purple-500/30">3</div>
                <h3 className="text-2xl font-bold mb-3 text-white">Validasi Dokter/Perawat</h3>
                <p className="text-slate-400">Draf hasil AI disajikan ke layar. Tenaga medis berhak mengedit, menambah, atau menolak narasi buatan AI sebelum disimpan.</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 relative z-10 lg:mt-32 shadow-2xl">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-black text-xl mb-6 shadow-lg shadow-blue-500/30">4</div>
                <h3 className="text-2xl font-bold mb-3 text-white">Finalisasi & Rekam Log</h3>
                <p className="text-slate-400">Data tersimpan permanen ke Database PostgreSQL, dapat diakses kapan saja, dan terenkripsi beserta catatan log *Audit Trail*.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA (Call to Action) ===== */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-600 to-emerald-600 relative overflow-hidden">
        {/* Dekorasi BG CTA */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Siap Meringankan Beban Administrasi Rumah Sakit?</h2>
          <p className="text-blue-100 text-xl mb-10 font-medium">Bergabung dengan ekosistem kesehatan masa depan berbasis Kecerdasan Buatan.</p>
          <button onClick={() => navigate('/login')} className="px-10 py-5 bg-white text-blue-700 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all shadow-2xl shadow-blue-900/50 flex items-center justify-center gap-3 mx-auto active:scale-95">
            Mulai Gunakan LexiMed <ChevronRight size={24} />
          </button>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6 relative z-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BrainCircuit className="text-white" size={18} />
              </div>
              <span className="text-xl font-black tracking-tight text-white">LexiMed.ai</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm mb-6">
              Platform pendukung keputusan klinis (CDSS) cerdas berbasis Large Language Model khusus untuk alur kerja kesehatan di Indonesia.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-white font-bold mb-4">Modul Sistem</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Dokter & Spesialis</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Perawat & Bidan</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Instalasi Radiologi</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Manajemen & Direksi</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-white font-bold mb-4">Dukungan</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Panduan Pengguna</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Keamanan Data (HIPAA)</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Kontak Tim IT</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
          <p>© 2026 LexiMed.ai — Inovasi AI Kesehatan Vokasi UNS. All rights reserved.</p>
          <div className="flex items-center gap-2 text-slate-500">
            Ditenagai oleh <Cpu size={14} className="text-blue-500"/> LexiCore v1.0
          </div>
        </div>
      </footer>
    </div>
  );
}
