import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Upload, Database, Search, Trash2, FileText, 
  CheckCircle2, RefreshCw, Loader2, AlertCircle, FilePlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function KelolaKnowledge() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const fileInputRef = useRef(null);
  const API_URL = "http://localhost:8000/api";
  const token = localStorage.getItem('access_token');

  // --- 1. FETCH DATA DARI LARAVEL ---
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/documents`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      if (!response.ok) throw new Error("Gagal mengambil data dari server");
      
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      console.warn("Backend offline. Menggunakan data demo.");
      setDocuments([
        { id: 1, title: 'PPK Tata Laksana Pneumonia 2024.pdf', size: '2.4 MB', status: 'Indexed' },
        { id: 2, title: 'SOP Alur Gawat Darurat RS UNS.pdf', size: '1.1 MB', status: 'Indexed' },
        { id: 3, title: 'Pedoman Terapi Hipertensi.pdf', size: '3.5 MB', status: 'Processing' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  // --- 2. LOGIKA PENCARIAN ---
  useEffect(() => {
    const results = documents.filter(doc => 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDocs(results);
  }, [searchTerm, documents]);

  // --- 3. FUNGSI UPLOAD KE BACKEND (RAG ENGINE) ---
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validasi ukuran (Maks 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return alert("Ukuran file maksimal adalah 10MB.");
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    try {
      const response = await fetch(`${API_URL}/documents/upload`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: formData
      });

      if (response.ok) {
        alert("Dokumen berhasil diunggah dan sedang diproses oleh RAG Engine.");
        fetchDocuments(); // Refresh tabel
      } else {
        const errorData = await response.json();
        alert("Gagal mengunggah: " + (errorData.message || "Terjadi kesalahan."));
      }
    } catch (error) {
      alert("Error: Gagal terhubung ke server Laravel.");
    } finally {
      setIsUploading(false);
      // Reset input file
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- 4. FUNGSI HAPUS DOKUMEN ---
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus dokumen ini dari Knowledge Base?")) return;

    try {
      const response = await fetch(`${API_URL}/documents/${id}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        setDocuments(documents.filter(doc => doc.id !== id));
      } else {
        alert("Gagal menghapus dokumen.");
      }
    } catch (error) {
      alert("Error: Gagal menghubungi server.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-left">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 mb-10">
        <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
          <Database size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Knowledge Base (RAG)</h1>
          <p className="text-slate-500 font-medium mt-1">Kelola dokumen referensi klinis sebagai sumber pengetahuan utama LLM.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Kolom Kiri: Upload & Status */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Card Upload */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 text-center transition-all">
            <h3 className="text-xl font-black text-slate-800 mb-2">Unggah Pedoman</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Format PDF/DOCX (Maks 10MB)</p>
            
            <input 
              type="file" 
              accept=".pdf,.doc,.docx,.txt" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`w-full flex flex-col items-center justify-center gap-4 p-10 rounded-[2rem] border-2 border-dashed transition-all ${
                isUploading 
                ? 'border-slate-300 bg-slate-50 cursor-not-allowed' 
                : 'border-amber-300 bg-amber-50/50 hover:bg-amber-100 hover:border-amber-400 cursor-pointer'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 size={48} className="text-slate-400 animate-spin" />
                  <span className="font-bold text-slate-500 text-sm">Memproses Vektor...</span>
                </>
              ) : (
                <>
                  <FilePlus size={48} className="text-amber-500" />
                  <span className="font-bold text-amber-700 text-sm">Pilih File & Proses RAG</span>
                </>
              )}
            </button>
          </div>

          {/* Card Status */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-10">
              <Database size={120} />
            </div>
            <div className="relative z-10">
              <h4 className="text-lg font-black flex items-center gap-2 mb-6">
                <RefreshCw size={20} className="text-blue-400" /> Status Vector Engine
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-white/10">
                  <span className="text-sm font-medium text-slate-300">Total Terindeks</span>
                  <strong className="text-xl font-black text-white">{documents.length} File</strong>
                </div>
                <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-white/10">
                  <span className="text-sm font-medium text-slate-300">Status Gateway</span>
                  <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Daftar Dokumen */}
        <div className="xl:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
            <div>
               <h3 className="text-xl font-black text-slate-800">Database Dokumen</h3>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">SOP & Pedoman Praktik Klinis</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari dokumen..." 
                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-amber-500 font-bold text-sm shadow-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1 p-2">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Dokumen</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ukuran</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status RAG</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading && documents.length === 0 ? (
                  <tr><td colSpan="4" className="py-20 text-center"><Loader2 className="animate-spin text-amber-500 mx-auto" size={40} /></td></tr>
                ) : filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                      <AlertCircle className="text-slate-300 mx-auto mb-3" size={40} />
                      <p className="text-slate-500 font-bold text-sm">Tidak ada dokumen yang ditemukan.</p>
                    </td>
                  </tr>
                ) : filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-6 flex items-center gap-4">
                      <div className="p-3 bg-slate-100 rounded-xl text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                        <FileText size={20} />
                      </div>
                      <span className="font-bold text-slate-800">{doc.title}</span>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-slate-500">{doc.size}</td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                        doc.status.toLowerCase() === 'indexed' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {doc.status.toLowerCase() === 'indexed' ? <CheckCircle2 size={14} /> : <RefreshCw size={14} className="animate-spin" />}
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Hapus Dokumen"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}