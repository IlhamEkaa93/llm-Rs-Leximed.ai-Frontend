import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileUp, Book, Trash2, CheckCircle, 
    FileText, Loader2, Database, Server, Sparkles 
} from 'lucide-react';

const KnowledgeBase = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        category: 'SOP Pelayanan',
        version: '1.0',
        description: '',
        file: null
    });

    const API_URL = "http://localhost:8000/api";
    const token = localStorage.getItem('access_token');

    // Setup Header Axios Global
    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/knowledge`, config);
            setFiles(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Gagal mengambil data:", err);
            if (err.response?.status === 401) {
                alert("Sesi Anda habis. Silakan login kembali.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!formData.file) return alert("Pilih file dokumen (PDF/DOCX) terlebih dahulu!");
        
        setUploading(true);
        
        const data = new FormData();
        data.append('title', formData.title);
        data.append('category', formData.category);
        data.append('version', formData.version);
        data.append('description', formData.description || '-');
        data.append('file', formData.file);

        try {
            await axios.post(`${API_URL}/knowledge`, data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                }
            });
            
            // Reset form
            setFormData({ title: '', category: 'SOP Pelayanan', version: '1.0', description: '', file: null });
            e.target.reset();
            fetchData();
        } catch (err) {
            console.error("Upload error:", err);
            alert(err.response?.data?.message || "Gagal upload dokumen.");
        } finally {
            setUploading(false);
        }
    };

    const deleteDoc = async (id) => {
        if (window.confirm("Peringatan: Menghapus dokumen ini akan menghapusnya dari otak AI LexiMed. Lanjutkan?")) {
            try {
                // Optimistic delete UI
                setFiles(files.filter(f => f.id !== id)); 
                await axios.delete(`${API_URL}/knowledge/${id}`, config);
            } catch (err) {
                alert("Gagal menghapus dokumen.");
                fetchData(); // Rollback jika gagal
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f7f9] p-4 md:p-8 text-left font-sans pb-24 overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
                
                {/* HEADER SECTION */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none rotate-12 -scale-x-100"><Server size={250} /></div>
                    
                    <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
                        <div className="p-4 md:p-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-xl shadow-emerald-200 shrink-0">
                            <Database size={28} className="md:w-8 md:h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase italic leading-none">RAG Knowledge Base</h1>
                            <p className="text-emerald-600 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] mt-2">Manajemen Memori Jangka Panjang LexiMed.ai</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 flex items-center gap-3 relative z-10 w-full md:w-auto">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <div className="text-left">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vector DB Status</p>
                           <p className="text-sm font-bold text-slate-800 leading-none mt-1">Connected & Synchronized</p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT COLUMN: FORM UPLOAD */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-4 h-fit">
                        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-100 transition-colors duration-500" />
                            
                            <h2 className="text-xl font-black mb-6 text-slate-800 flex items-center gap-3 relative z-10 uppercase tracking-tight">
                                <FileUp size={24} className="text-emerald-500"/> Inject Dokumen
                            </h2>
                            
                            <form onSubmit={handleUpload} className="space-y-5 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Judul Dokumen</label>
                                    <input type="text" className="w-full p-4 md:p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-bold text-sm md:text-base text-slate-700 shadow-inner" 
                                        placeholder="Misal: SOP Penanganan Stroke..."
                                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Kategori Indeks</label>
                                    <div className="relative">
                                        <select className="w-full p-4 md:p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-bold text-sm md:text-base text-slate-700 shadow-inner appearance-none cursor-pointer"
                                            value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                            <option value="SOP Pelayanan">SOP Pelayanan / Klinis</option>
                                            <option value="Guideline Medis">Guideline Medis Nasional</option>
                                            <option value="Alur Administrasi">Alur Administrasi RS</option>
                                            <option value="Farmakope">Farmakope & Obat</option>
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L7 8L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Versi</label>
                                        <input type="text" className="w-full p-4 md:p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 text-sm md:text-base text-center outline-none focus:border-emerald-500 shadow-inner transition-all" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] ml-2">File (PDF/DOCX)</label>
                                        {/* Styled File Input */}
                                        <div className="relative w-full h-full min-h-[50px]">
                                            <input type="file" required
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                                onChange={e => setFormData({...formData, file: e.target.files[0]})} 
                                            />
                                            <div className={`absolute inset-0 w-full h-full border-2 border-dashed rounded-2xl flex items-center justify-center flex-col transition-all ${formData.file ? 'border-teal-500 bg-teal-50' : 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'}`}>
                                                {formData.file ? (
                                                    <span className="text-[10px] font-bold text-teal-800 truncate px-2 text-center w-full">{formData.file.name}</span>
                                                ) : (
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">+ Pilih File</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" disabled={uploading} 
                                    className={`w-full py-5 rounded-2xl md:rounded-[1.5rem] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 shadow-xl mt-4 text-xs md:text-sm ${
                                        uploading 
                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' 
                                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500 shadow-emerald-900/30 active:scale-95'
                                    }`}
                                >
                                    {uploading ? (
                                        <><Loader2 className="animate-spin" size={18}/> Mengekstrak ke Vector DB...</>
                                    ) : (
                                        <><Database size={18} /> Sinkronisasi ke AI</>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Info Card */}
                        <div className="mt-6 p-6 md:p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-start gap-4">
                            <Sparkles className="text-emerald-500 shrink-0 mt-1" size={20} />
                            <p className="text-[10px] md:text-xs text-emerald-800 font-medium leading-relaxed">
                                Dokumen yang Anda unggah akan otomatis dipecah (chunking) dan diubah menjadi nilai vektor. AI LexiMed akan langsung mempelajari dokumen ini.
                            </p>
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN: LIST DOKUMEN TERINDEKS */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-8 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-4">
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight italic uppercase">Daftar Indeks Pengetahuan</h2>
                            <span className="bg-white border border-slate-200 text-emerald-700 text-[9px] md:text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-sm self-start sm:self-auto">
                                {files.length} Dokumen Memori Aktif
                            </span>
                        </div>

                        <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 pb-10 hide-scrollbar">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                                        <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Mengambil Data Vector DB...</p>
                                    </motion.div>
                                ) : files.length === 0 ? (
                                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="bg-white p-20 text-center rounded-[3rem] border-2 border-dashed border-slate-200 shadow-sm">
                                        <Book className="mx-auto text-slate-200 mb-6" size={80} />
                                        <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-sm">Belum Ada Dokumen</p>
                                        <p className="text-slate-400 text-xs mt-2 font-medium">Unggah SOP pertama Anda di panel sebelah kiri.</p>
                                    </motion.div>
                                ) : (
                                    files.map((file, i) => (
                                        <motion.div 
                                            layout
                                            initial={{ opacity: 0, y: 20 }} 
                                            animate={{ opacity: 1, y: 0 }} 
                                            exit={{ opacity: 0, scale: 0.9, transition: {duration: 0.2} }}
                                            transition={{ delay: i * 0.05 }}
                                            key={file.id} 
                                            className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-50/50 transition-all group"
                                        >
                                            <div className="flex items-start sm:items-center gap-4 md:gap-6">
                                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shrink-0">
                                                    <FileText size={28} className="md:w-8 md:h-8" />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="font-black text-slate-800 text-lg md:text-xl leading-tight line-clamp-1 group-hover:text-emerald-800 transition-colors">{file.title}</h3>
                                                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
                                                        <span className="text-[8px] md:text-[9px] bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1 rounded-lg font-black uppercase tracking-widest group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                                                            {file.category}
                                                        </span>
                                                        <span className="text-[9px] md:text-[10px] text-slate-400 font-bold tracking-widest italic">
                                                            VER {file.version}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                                                <div className="flex items-center gap-1.5 text-teal-600 bg-teal-50 px-4 py-2 rounded-full border border-teal-100">
                                                    <CheckCircle size={14} />
                                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">AI Indexed</span>
                                                </div>
                                                <button 
                                                    onClick={() => deleteDoc(file.id)} 
                                                    className="p-3 bg-white border border-slate-200 text-slate-300 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200 rounded-xl transition-all shadow-sm active:scale-90"
                                                    title="Hapus dari memori AI"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default KnowledgeBase;