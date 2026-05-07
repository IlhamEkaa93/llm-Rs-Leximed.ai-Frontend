import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// --- KOMPONEN ANIMASI & LANDING ---
import IntroScreen from './components/IntroScreen';
import LandingPage from './pages/LandingPage';

// --- LAYOUT ---
import AdminLayout from './layouts/AdminLayout';

// --- HALAMAN AUTENTIKASI ---
import Login from './pages/auth/Login';

// --- FITUR KHUSUS ADMIN ---
import DashboardAdmin from './pages/admin/DashboardAdmin';
import KelolaUser from './pages/admin/KelolaUser';
import KelolaTemplate from './pages/admin/KelolaTemplate';
import KelolaKnowledge from './pages/admin/KelolaKnowledge';
import AuditLog from './pages/admin/AuditLog';
import PatientInput from './pages/admin/PatientInput';

// --- FITUR KHUSUS DOKTER ---
import DashboardDokter from './pages/dokter/DashboardDokter';
import DataRekamMedis from './pages/dokter/DataRekamMedis';
import RingkasanMedis from './pages/dokter/RingkasanMedis';
import ResumeMedis from './pages/dokter/ResumeMedis';
import PedomanKlinis from './pages/dokter/PedomanKlinis';
import EditHasilAI from './pages/dokter/EditHasilAI';
import ApproveFinal from './pages/dokter/ApproveFinal';
import InputKlinis from './pages/dokter/InputKlinis';

// --- FITUR KHUSUS PERAWAT ---
import DashboardPerawat from './pages/perawat/DashboardPerawat';
import HandoverShift from './pages/perawat/HandoverShift';
import TambahCatatan from './pages/perawat/TambahCatatan';
import SimpanHandover from './pages/perawat/SimpanHandover';

// --- FITUR KHUSUS RADIOLOGI ---
import DashboardRadiologi from './pages/radiologi/DashboardRadiologi';
import InputRadiologi from './pages/radiologi/InputRadiologi';
import AnalisisRadiologi from './pages/radiologi/AnalisisRadiologi';

// --- FITUR KHUSUS MANAJEMEN / DIREKTUR (BARU) ---
import DashboardManajemen from './pages/manajemen/DashboardManajemen';

// --- FITUR UMUM ---
import Pengaturan from './pages/common/Pengaturan';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        {showIntro && (
          <IntroScreen key="intro-animation" onFinish={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {!showIntro && (
        <Routes>
          {/* Landing & Auth */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Grup Rute Dokter */}
          <Route path="/dashboard" element={<AdminLayout><DashboardDokter /></AdminLayout>} />
          <Route path="/dokter/input" element={<AdminLayout><InputKlinis /></AdminLayout>} />
          <Route path="/data-medis" element={<AdminLayout><DataRekamMedis /></AdminLayout>} />
          <Route path="/ringkasan" element={<AdminLayout><RingkasanMedis /></AdminLayout>} />
          <Route path="/resume" element={<AdminLayout><ResumeMedis /></AdminLayout>} />
          <Route path="/pedoman" element={<AdminLayout><PedomanKlinis /></AdminLayout>} />
          <Route path="/edit-ai" element={<AdminLayout><EditHasilAI /></AdminLayout>} />
          <Route path="/approve" element={<AdminLayout><ApproveFinal /></AdminLayout>} />

          {/* Grup Rute Perawat */}
          <Route path="/dashboardperawat" element={<AdminLayout><DashboardPerawat /></AdminLayout>} />
          <Route path="/handover" element={<AdminLayout><HandoverShift /></AdminLayout>} />
          <Route path="/tambah-catatan" element={<AdminLayout><TambahCatatan /></AdminLayout>} />
          <Route path="/simpan-handover" element={<AdminLayout><SimpanHandover /></AdminLayout>} />

          {/* Grup Rute Admin */}
          <Route path="/dashboard-admin" element={<AdminLayout><DashboardAdmin /></AdminLayout>} />
          <Route path="/kelola-user" element={<AdminLayout><KelolaUser /></AdminLayout>} />
          <Route path="/kelola-template" element={<AdminLayout><KelolaTemplate /></AdminLayout>} />
          <Route path="/kelola-knowledge" element={<AdminLayout><KelolaKnowledge /></AdminLayout>} />
          <Route path="/log" element={<AdminLayout><AuditLog /></AdminLayout>} />
          <Route path="/admin/input-pasien" element={<AdminLayout><PatientInput /></AdminLayout>} />

          {/* Grup Rute Radiologi */}
          <Route path="/dashboard-radiologi" element={<AdminLayout><DashboardRadiologi /></AdminLayout>} />
          <Route path="/radiologi/input" element={<AdminLayout><InputRadiologi /></AdminLayout>} />
          <Route path="/radiologi/analisis" element={<AdminLayout><AnalisisRadiologi /></AdminLayout>} />

          {/* Grup Rute Manajemen / Direktur (BARU) */}
          <Route path="/dashboard-manajemen" element={<AdminLayout><DashboardManajemen /></AdminLayout>} />

          {/* Fitur Umum */}
          <Route path="/pengaturan" element={<AdminLayout><Pengaturan /></AdminLayout>} />

          {/* Fallback ke Landing Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}