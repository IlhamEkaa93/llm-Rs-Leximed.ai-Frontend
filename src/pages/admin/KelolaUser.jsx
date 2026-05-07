import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserPlus, Search, Edit2, Trash2, ShieldCheck, 
  UserCog, Filter, CheckCircle, User, Loader2, Database, X, PlusCircle, Users, GraduationCap, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function KelolaUser() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('staff');
  const [isSaving, setIsSaving] = useState(false);
  
  // FORM DATA DENGAN TAMBAHAN SPESIALIS & UNIT
  const [formData, setFormData] = useState({ 
    id: '', 
    name: '', 
    role: 'dokter', 
    email: '', 
    specialization: '', // Khusus Dokter
    unit: '',           // Khusus Perawat
    norm: '',           // Khusus Pasien
    birth_date: '',     // Khusus Pasien
    gender: 'Laki-laki' // Khusus Pasien
  });

  const API_URL = "http://localhost:8000/api";
  const token = localStorage.getItem('access_token');

  // --- 1. FETCH DATA DARI DATABASE (POSTGRESQL) ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/staff`, {
        headers: { 
          "Authorization": `Bearer ${token}`, 
          "Accept": "application/json" 
        }
      });
      if (!response.ok) throw new Error("Gagal mengambil data dari server");
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.warn("Backend offline. Menggunakan data demo sebagai fallback.");
      setUsers([
        { id: 'DOC-001', name: 'dr. Ahmad Hidayat', role: 'dokter', specialization: 'Sp.PD', email: 'ahmad@rsuns.ac.id' },
        { id: 'NUR-002', name: 'Ns. Siti Aminah', role: 'perawat', unit: 'ICU', email: 'siti@rsuns.ac.id' },
        { id: 'ADM-003', name: 'Budi Santoso', role: 'admin', email: 'budi@rsuns.ac.id' }
      ]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- 2. LOGIKA SEARCH & FILTER TAB ---
  useEffect(() => {
    const result = users.filter(u => 
      (activeFilter === 'Semua' || u.role?.toLowerCase() === activeFilter.toLowerCase()) &&
      ((u.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (u.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(result);
  }, [searchTerm, activeFilter, users]);

  // --- 3. HANDLER MODAL (OPEN/CLOSE) ---
  const openModal = (type) => {
    setModalType(type);
    setFormData({ 
      id: '', name: '', role: 'dokter', email: '', 
      specialization: '', unit: '', norm: '', birth_date: '', gender: 'Laki-laki' 
    });
    setShowModal(true);
  };

  // --- 4. FUNGSI SIMPAN KE BACKEND VOLT (POSTGRESQL) ---
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const endpoint = modalType === 'staff' ? `${API_URL}/staff` : `${API_URL}/patients`;
    
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}`, 
          "Accept": "application/json" 
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert("Data Berhasil Disinkronisasi ke PostgreSQL RS UNS!");
        setShowModal(false);
        fetchData(); // Refresh data di tabel setelah berhasil simpan
      } else {
        const errorData = await response.json();
        alert("Gagal Menyimpan: " + (errorData.message || "Periksa kembali data Anda."));
      }
    } catch (err) {
      alert("Error: Gagal terhubung ke Laravel. Pastikan backend di port 8000 aktif.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-left">
      
      {/* Header Utama */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 mb-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight italic uppercase">
            <UserCog size={32} className="text-blue-600" /> Manajemen Otoritas
          </h1>
          <p className="text-slate-500 font-medium">Pengelolaan akses tenaga medis dan registrasi pasien induk.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95" 
            onClick={() => openModal('patient')}
          >
            <PlusCircle size={20} /> Registrasi Pasien
          </button>
          <button 
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95" 
            onClick={() => openModal('staff')}
          >
            <UserPlus size={20} /> Tambah Staf
          </button>
        </div>
      </div>

      {/* Kontrol Pencarian & Filter */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Cari NIP, Nama Staf, atau ID..." 
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-500 transition-all font-bold text-slate-700 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-slate-200/50 p-1.5 rounded-2xl gap-1 overflow-x-auto w-full md:w-auto hide-scrollbar">
          {['Semua', 'Dokter', 'Perawat', 'Admin'].map(t => (
            <button 
              key={t} 
              className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                activeFilter === t ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setActiveFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel Utama Staf */}
      <div className="max-w-7xl mx-auto bg-white rounded-[40px] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest">
            <Database size={16} className="text-blue-500" /> HIS PostgreSQL Link Active
          </div>
          <span className="text-[10px] bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full font-black uppercase tracking-widest border border-blue-100">
            {filteredUsers.length} Personil Terdaftar
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">NIP / ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role & Spesialisasi</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Institusi</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && users.length === 0 ? (
                <tr><td colSpan="5" className="py-20 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={40} /></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-medium">Tidak ada data yang ditemukan.</td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-6">
                    <code className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 font-mono border border-slate-200">
                      {u.id}
                    </code>
                  </td>
                  <td className="px-8 py-6 font-bold text-slate-800">{u.name}</td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col items-start gap-1">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                        u.role === 'dokter' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        u.role === 'perawat' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {u.role}
                      </span>
                      {(u.specialization || u.unit) && (
                        <span className="text-xs font-bold text-slate-400 italic flex items-center gap-1">
                          {u.role === 'dokter' ? <GraduationCap size={12}/> : <MapPin size={12}/>}
                          {u.specialization || u.unit}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-slate-500 font-medium">{u.email}</td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-2">
                      <button className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all" title="Edit Data"><Edit2 size={16} /></button>
                      <button className="p-3 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all" title="Hapus Akses"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM DINAMIS */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">
                    {modalType === 'staff' ? 'Pendaftaran Staf Medis' : 'Registrasi Pasien Baru'}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Sistem Informasi Medis RS UNS</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                {modalType === 'staff' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID Akses / NIP</label>
                      <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-800 transition-all font-mono" placeholder="DOC-001" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap + Gelar</label>
                      <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-800 transition-all" placeholder="dr. Jane Doe, Sp.PD" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role Otoritas</label>
                      <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-blue-500 focus:bg-white outline-none font-black text-slate-800 transition-all appearance-none uppercase" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="dokter">Dokter</option>
                        <option value="perawat">Perawat</option>
                        <option value="admin">Admin IT</option>
                        <option value="radiologi">Radiologi</option>
                        <option value="manajemen">Manajemen</option>
                      </select>
                    </div>

                    {/* FIELD DINAMIS BERDASARKAN ROLE */}
                    {formData.role === 'dokter' ? (
                      <div className="space-y-2 animate-fade-in">
                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 flex items-center gap-1">
                          <GraduationCap size={14}/> Spesialisasi
                        </label>
                        <input type="text" className="w-full bg-blue-50/50 border-2 border-blue-100 rounded-2xl py-4 px-6 focus:border-blue-500 outline-none font-bold text-blue-700 transition-all" placeholder="Contoh: Sp.PD" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} required />
                      </div>
                    ) : formData.role === 'perawat' ? (
                      <div className="space-y-2 animate-fade-in">
                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1 flex items-center gap-1">
                          <MapPin size={14}/> Unit Kerja / Bangsal
                        </label>
                        <input type="text" className="w-full bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl py-4 px-6 focus:border-emerald-500 outline-none font-bold text-emerald-700 transition-all" placeholder="Contoh: ICU" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} required />
                      </div>
                    ) : (
                      <div className="space-y-2"></div> /* Spacer kosong untuk role lain */
                    )}

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Institusi</label>
                      <input type="email" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-800 transition-all" placeholder="nama@rsuns.ac.id" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor RM (NORM)</label>
                      <input type="text" className="w-full bg-blue-50/50 border-2 border-blue-100 rounded-2xl py-4 px-6 focus:border-blue-500 outline-none font-bold text-blue-600 transition-all font-mono" placeholder="RM-1228" value={formData.norm} onChange={e => setFormData({...formData, norm: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Pasien KTP</label>
                      <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-800 transition-all" placeholder="Tn. Ahmad" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 transition-all shadow-xl mt-4 ${
                    isSaving ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-blue-600 text-white shadow-slate-200 active:scale-95'
                  }`} 
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
                  {isSaving ? "Sinkronisasi Data..." : "Simpan ke PostgreSQL RS UNS"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Compliance Footer */}
      <div className="max-w-7xl mx-auto mt-12 p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 flex flex-col md:flex-row items-start md:items-center gap-6 text-blue-900 shadow-sm">
        <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shrink-0">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h4 className="text-lg font-black tracking-tight italic leading-none">Security Audit Trail Active</h4>
          <p className="text-sm font-medium mt-2 opacity-80 leading-relaxed max-w-3xl">
            Sesuai standar SRS 7.6, setiap pendaftaran personil medis dan registrasi data pasien terekam secara permanen dalam database audit rumah sakit demi menjaga integritas data klinis DARSI.
          </p>
        </div>
      </div>
    </div>
  );
}