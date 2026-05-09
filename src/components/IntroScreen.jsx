import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function IntroScreen({ onFinish }) {
  useEffect(() => {
    // Waktu loading 2.8 detik agar juri bisa melihat animasi intro yang keren
    const timer = setTimeout(() => onFinish(), 2800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div 
      // Efek keluar (exit): Membesar, nge-blur, dan menghilang perlahan
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }} 
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center text-white overflow-hidden"
    >
      {/* Background Ambient Glow (Cahaya biru di latar belakang layar) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.15, scale: 1.5 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="w-72 md:w-96 h-72 md:h-96 bg-blue-500 rounded-full blur-[100px]"
        />
      </div>

      <div className="text-center space-y-8 relative z-10">
        
        {/* LOGO ANIMATION (MENGGUNAKAN LOGO ASLI) */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
          className="relative flex justify-center items-center group mx-auto w-32 h-32 md:w-40 md:h-40"
        >
          {/* Efek Cahaya Berdenyut (Pulsing Glow) persis di belakang logo */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-blue-600 rounded-full blur-[50px] md:blur-[60px]"
          ></motion.div>
          
          {/* Logo Asli (Efek Mengambang / Floating) */}
          <motion.img 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            src="/logo.png" 
            alt="LexiMed.ai Logo" 
            className="w-full h-full object-contain relative z-20 drop-shadow-[0_15px_35px_rgba(16,185,129,0.4)]"
          />
        </motion.div>

        {/* TEXT & TYPOGRAPHY ANIMATION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-4"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
            LexiMed<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">.ai</span>
          </h2>
          <p className="text-slate-400 text-xs md:text-sm tracking-[0.2em] uppercase font-bold">
            AI Healthcare Ecosystem
          </p>

          {/* PROGRESS/LOADING BAR */}
          <div className="w-48 md:w-64 h-1.5 bg-slate-800/80 mx-auto mt-8 rounded-full overflow-hidden shadow-inner border border-slate-700/50 backdrop-blur-sm">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1/2 h-full bg-gradient-to-r from-transparent via-emerald-400 to-blue-500 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}