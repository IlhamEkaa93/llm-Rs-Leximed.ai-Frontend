import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Activity } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden flex flex-col items-center justify-center p-6 relative">
      {/* Animasi Latar Belakang (Blob) */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute -top-20 -left-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10" 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 15, repeat: Infinity, delay: 2 }}
        className="absolute -bottom-20 -right-20 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-50 -z-10" 
      />

      {/* Konten Utama */}
      <div className="max-w-4xl w-full text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Zap size={14} /> AI-Powered Medical System
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight">
            DARSI <span className="text-blue-600">RS</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mt-6 max-w-2xl mx-auto leading-relaxed">
            Sistem rekam medis cerdas berbasis Llama 3 untuk asisten diagnosis dokter dan dokumentasi keperawatan yang presisi.
          </p>
        </motion.div>

        {/* Tombol Aksi */}
        <motion.div 
          className="flex flex-col md:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button 
            onClick={() => navigate('/login')}
            className="group px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg flex items-center gap-3 hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200"
          >
            Masuk ke Sistem <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all">
            Pelajari Fitur
          </button>
        </motion.div>

        {/* Fitur Highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
        >
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm text-left">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck />
            </div>
            <h3 className="font-black text-slate-800">PostgreSQL Secure</h3>
            <p className="text-sm text-slate-500 mt-2">Data medis terenkripsi dan tersimpan aman di database rumah sakit.</p>
          </div>
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm text-left">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <Zap />
            </div>
            <h3 className="font-black text-slate-800">Llama 3 AI</h3>
            <p className="text-sm text-slate-500 mt-2">Analisis data klinis otomatis untuk draf SOAP dan SBAR perawat.</p>
          </div>
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm text-left">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <Activity />
            </div>
            <h3 className="font-black text-slate-800">RAG Guideline</h3>
            <p className="text-sm text-slate-500 mt-2">Pencarian pedoman klinis (PPK) cerdas berdasarkan kondisi pasien.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}