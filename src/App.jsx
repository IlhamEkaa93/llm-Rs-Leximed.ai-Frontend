import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import IntroScreen from './components/IntroScreen';
import LandingPage from './pages/LandingPage';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/auth/Login';

// Admin Pages
import DashboardAdmin from './pages/admin/DashboardAdmin';
import KelolaUser from './pages/admin/KelolaUser';
import KelolaKnowledge from './pages/admin/KelolaKnowledge';
import KelolaTemplate from './pages/admin/KelolaTemplate';
import AuditLog from './pages/admin/AuditLog';
import PatientInput from './pages/admin/PatientInput';
import AIGovernance from './pages/admin/AIGovernance';

// Dokter Pages
import DashboardDokter from './pages/dokter/DashboardDokter';
import DataRekamMedis from './pages/dokter/DataRekamMedis';
import RingkasanMedis from './pages/dokter/RingkasanMedis';
import ResumeMedis from './pages/dokter/ResumeMedis';
import PedomanKlinis from './pages/dokter/PedomanKlinis';
import EditHasilAI from './pages/dokter/EditHasilAI';
import ApproveFinal from './pages/dokter/ApproveFinal';
import InputKlinis from './pages/dokter/InputKlinis';

// Perawat Pages
import DashboardPerawat from './pages/perawat/DashboardPerawat';
import HandoverShift from './pages/perawat/HandoverShift';
import TambahCatatan from './pages/perawat/TambahCatatan';
import DraftDokumentasi from './pages/perawat/DraftDokumentasi';
import ValidasiAIPerawat from './pages/perawat/ValidasiAIPerawat';

// Asisten Pages
import DashboardAsisten from './pages/asisten/DashboardAsisten';
import InputAsisten from './pages/asisten/InputAsisten'; 

// Radiologi Pages
import DashboardRadiologi from './pages/radiologi/DashboardRadiologi';
import InputRadiologi from './pages/radiologi/InputRadiologi';
import AnalisisRadiologi from './pages/radiologi/AnalisisRadiologi';

// Manajemen & Common
import DashboardManajemen from './pages/manajemen/DashboardManajemen';
import ArsipLaporan from './pages/common/ArsipLaporan';
import Pengaturan from './pages/common/Pengaturan';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <BrowserRouter>
      {/* INTRO ANIMATION */}
      <AnimatePresence mode="wait">
        {showIntro && (
          <IntroScreen key="intro-animation" onFinish={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {!showIntro && (
        <Routes>
          {/* --- 1. PUBLIC ROUTES (Tanpa Sidebar/Layout) --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* --- 2. PROTECTED ROUTES (Otomatis dapat Sidebar via AdminLayout) --- */}
          {/* Pola element={<AdminLayout />} adalah yang paling stabil di v6 */}
          <Route element={<AdminLayout />}>
            
            {/* Dashboard General */}
            <Route path="/dashboard" element={<DashboardDokter />} />

            {/* Modul Dokter */}
            <Route path="/dashboard-dokter" element={<DashboardDokter />} />
            <Route path="/input-klinis" element={<InputKlinis />} />
            <Route path="/data-medis" element={<DataRekamMedis />} />
            <Route path="/ringkasan" element={<RingkasanMedis />} />
            <Route path="/resume" element={<ResumeMedis />} />
            <Route path="/pedoman" element={<PedomanKlinis />} />
            <Route path="/edit-ai" element={<EditHasilAI />} />
            <Route path="/approve" element={<ApproveFinal />} />

            {/* Modul Asisten */}
            <Route path="/dashboard-asisten" element={<DashboardAsisten />} />
            <Route path="/asisten/input-pemeriksaan" element={<InputAsisten />} />

            {/* Modul Admin */}
            <Route path="/dashboard-admin" element={<DashboardAdmin />} />
            <Route path="/kelola-user" element={<KelolaUser />} />
            <Route path="/kelola-template" element={<KelolaTemplate />} />
            <Route path="/kelola-knowledge" element={<KelolaKnowledge />} />
            <Route path="/log" element={<AuditLog />} />
            <Route path="/ai-governance" element={<AIGovernance />} />
            <Route path="/admin/input-pasien" element={<PatientInput />} />

            {/* Modul Perawat (Poin 11-15) */}
            <Route path="/dashboard-perawat" element={<DashboardPerawat />} />
            <Route path="/tambah-catatan" element={<TambahCatatan />} />
            <Route path="/handover" element={<HandoverShift />} />
            <Route path="/draft-dokumentasi" element={<DraftDokumentasi />} />
            <Route path="/validasi-ai" element={<ValidasiAIPerawat />} />

            {/* Modul Radiologi */}
            <Route path="/dashboard-radiologi" element={<DashboardRadiologi />} />
            <Route path="/radiologi/input" element={<InputRadiologi />} />
            <Route path="/radiologi/analisis" element={<AnalisisRadiologi />} />

            {/* Modul Manajemen & Common */}
            <Route path="/dashboard-manajemen" element={<DashboardManajemen />} />
            <Route path="/arsip-laporan" element={<ArsipLaporan />} />
            <Route path="/pengaturan" element={<Pengaturan />} />

          </Route>

          {/* --- 3. FALLBACK --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}