import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IntroScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => onFinish(), 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div 
      exit={{ y: -1000 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-slate-900 flex items-center justify-center text-white"
    >
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center"
        >
          <span className="text-4xl font-black italic">D</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-bold tracking-[0.3em] uppercase">DARSI SYSTEM</h2>
          <div className="w-48 h-1 bg-slate-800 mx-auto mt-4 rounded-full overflow-hidden">
            <motion.div 
              initial={{ x: -200 }}
              animate={{ x: 200 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-1/2 h-full bg-blue-500"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}