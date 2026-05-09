import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Activity, Cpu, UserCheck, Database, FileText, ChevronDown } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const fiturRef = useRef(null);
  
  // Untuk efek parallax saat di-scroll
  const { scrollYProgress } = useScroll();
  const yPos = useTransform(scrollYProgress, [0, 1], [0, 200]);

  const scrollToFitur = () => {
    fiturRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Variasi animasi stagger (muncul bergantian)
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden font-sans">
      
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center p-6 z-10">
        
        {/* Animasi Latar Belakang (Blob) */}
        <motion.div 
          style={{ y: yPos }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-72 md:w-96 h-72 md:h-96 bg-blue-200 rounded-full blur-3xl opacity-40 -z-10" 
        />
        <motion.div 
          style={{ y: yPos }}
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 15, repeat: Infinity, delay: 2, ease: "linear" }}
          className="absolute -bottom-10 -right-10 md:-bottom-20 md:-right-20 w-80 md:w-96 h-80 md:h-96 bg-emerald-200 rounded-full blur-3xl opacity-40 -z-10" 
        />

        {/* Konten Utama Hero */}
        <div className="max-w-5xl w-full text-center space-y-8 mt-10 md:mt-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/10 to-emerald-600/10 text-blue-700 rounded-full text-xs md:text-sm font-black uppercase tracking-widest mb-6 border border-blue-100 shadow-sm">
              <Zap size={16} className="text-emerald-500" /> AI-Powered Healthcare
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-tight tracking-tight">
              LexiMed<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">.ai</span>
            </h1>
            
            <p className="text-base md:text-xl text-slate-600 mt-6 max-w-3xl mx-auto leading-relaxed font-medium px-4">
              "Satu AI untuk Seluruh Alur Rumah Sakit: Mengotomatisasi Ringkasan Medis, Rekomendasi Guideline, Operan Shift, Analisis Radiologi, dan Laporan Eksekutif dalam Hitungan Detik."
            </p>
          </motion.div>

          {/* Tombol Aksi */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto group px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-blue-600 hover:shadow-blue-500/30 transition-all shadow-2xl shadow-slate-300"
            >
              Masuk ke Sistem <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={scrollToFitur}
              className="w-full sm:w-auto px-8 py-4 bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 hover:border-blue-200 transition-all flex items-center justify-center gap-2"
            >
              Pelajari Fitur <ChevronDown size={20} className="text-slate-400" />
            </button>
          </motion.div>

          {/* Fitur Highlights Pendek */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 px-4"
          >
            {/* Card 1 */}
            <motion.div variants={itemVariants} className="p-6 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-slate-200/50 text-left hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                <ShieldCheck size={28} />
              </div>
              <h3 className="font-black text-slate-800 text-lg">On-Premise Ready</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">Data medis terenkripsi dan dapat diintegrasikan aman di server rumah sakit Anda.</p>
            </motion.div>
            
            {/* Card 2 */}
            <motion.div variants={itemVariants} className="p-6 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-slate-200/50 text-left hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                <Zap size={28} />
              </div>
              <h3 className="font-black text-slate-800 text-lg">Advanced LLM</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">Ditenagai Large Language Model mutakhir untuk pemahaman narasi klinis yang kompleks.</p>
            </motion.div>
            
            {/* Card 3 */}
            <motion.div variants={itemVariants} className="p-6 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-slate-200/50 text-left hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                <Activity size={28} />
              </div>
              <h3 className="font-black text-slate-800 text-lg">RAG Architecture</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">Rekomendasi cerdas yang divalidasi langsung oleh SOP dan Clinical Pathway resmi.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== CARA KERJA SECTION ===== */}
      <section ref={fiturRef} className="py-24 px-6 bg-slate-900 text-white relative z-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Bagaimana LexiMed.ai Bekerja?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Alur kerja sistematis yang menggabungkan kecerdasan buatan (AI) dengan validasi tenaga profesional (Human-in-the-loop).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative p-6 bg-slate-800 rounded-3xl border border-slate-700"
            >
              <div className="absolute -top-5 -left-5 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center font-black text-xl border-4 border-slate-900">1</div>
              <FileText className="text-blue-400 mb-4" size={40} strokeWidth={1.5} />
              <h3 className="text-xl font-bold mb-2">Input Data Klinis</h3>
              <p className="text-slate-400 text-sm">Dokter, perawat, atau radiolog memasukkan rekam medis, keluhan, atau hasil tes ke dalam sistem LexiMed.</p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative p-6 bg-slate-800 rounded-3xl border border-slate-700"
            >
              <div className="absolute -top-5 -left-5 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center font-black text-xl border-4 border-slate-900">2</div>
              <Cpu className="text-emerald-400 mb-4" size={40} strokeWidth={1.5} />
              <h3 className="text-xl font-bold mb-2">Pemrosesan AI & RAG</h3>
              <p className="text-slate-400 text-sm">Sistem memproses input menggunakan LLM dan mencocokkannya dengan SOP/Guideline rumah sakit (Vector Database).</p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative p-6 bg-slate-800 rounded-3xl border border-slate-700"
            >
              <div className="absolute -top-5 -left-5 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center font-black text-xl border-4 border-slate-900">3</div>
              <UserCheck className="text-purple-400 mb-4" size={40} strokeWidth={1.5} />
              <h3 className="text-xl font-bold mb-2">Validasi Profesional</h3>
              <p className="text-slate-400 text-sm">LexiMed menyajikan draf hasil. Tenaga medis memvalidasi (Approve, Edit, atau Reject) untuk menjamin akurasi 100%.</p>
            </motion.div>

            {/* Step 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative p-6 bg-slate-800 rounded-3xl border border-slate-700"
            >
              <div className="absolute -top-5 -left-5 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center font-black text-xl border-4 border-slate-900">4</div>
              <Database className="text-amber-400 mb-4" size={40} strokeWidth={1.5} />
              <h3 className="text-xl font-bold mb-2">Dokumen Final</h3>
              <p className="text-slate-400 text-sm">Draft yang disetujui otomatis tersimpan aman di database sebagai rekam medis resmi atau laporan manajemen.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOOTER SEDERHANA */}
      <footer className="bg-slate-950 text-slate-500 py-8 text-center text-sm z-20 relative">
        <p>© 2026 LexiMed.ai — Inovasi AI untuk Pelayanan Kesehatan Vokasi. All rights reserved.</p>
      </footer>
    </div>
  );
}