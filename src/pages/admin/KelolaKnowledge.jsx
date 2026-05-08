import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FileUp, 
    Book, 
    Trash2, 
    CheckCircle, 
    Clock, 
    FileText, 
    AlertCircle, 
    Loader2, 
    Database // <-- PERBAIKAN: Sudah ditambahkan di sini
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
    // Ambil token dari localStorage
    const token = localStorage.getItem('access_token');

    // Setup Header Axios Global untuk file ini
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
            // Pastikan res.data adalah array
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
        if (!formData.file) return alert("Pilih file terlebih dahulu!");
        
        setUploading(true);
        
        // Gunakan FormData untuk mengirim file
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
            
            alert("Knowledge Base berhasil diupload & di-indexing ke Vector DB!");
            // Reset form
            setFormData({ title: '', category: 'SOP Pelayanan', version: '1.0', description: '', file: null });
            // Reset input file di DOM
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
        if (window.confirm("Hapus dokumen ini dari otak AI?")) {
            try {
                await axios.delete(`${API_URL}/knowledge/${id}`, config);
                fetchData();
            } catch (err) {
                alert("Gagal menghapus dokumen.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-left font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex items-center gap-4 mb-10 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-200">
                        <Book size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">KNOWLEDGE BASE RAG</h1>
                        <p className="text-slate-500 font-medium">Manajemen memori jangka panjang AI DARSI</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Form Upload */}
                    <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 h-fit">
                        <h2 className="text-xl font-black mb-6 text-slate-800 flex items-center gap-2">
                            <FileUp size={24} className="text-indigo-600"/> Unggah Dokumen
                        </h2>
                        
                        <form onSubmit={handleUpload} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Judul Dokumen</label>
                                <input type="text" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold" 
                                    placeholder="SOP Penanganan Stroke"
                                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Kategori</label>
                                <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold appearance-none cursor-pointer"
                                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                    <option value="SOP Pelayanan">SOP Pelayanan</option>
                                    <option value="Guideline Medis">Guideline Medis</option>
                                    <option value="Alur Administrasi">Alur Administrasi</option>
                                    <option value="Farmakope">Farmakope</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Versi</label>
                                    <input type="text" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 text-indigo-500">File PDF/DOCX</label>
                                    <input type="file" className="text-[10px] mt-2 block w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                                        onChange={e => setFormData({...formData, file: e.target.files[0]})} />
                                </div>
                            </div>

                            <button type="submit" disabled={uploading} className={`w-full p-5 rounded-2xl font-black uppercase tracking-widest transition-all flex justify-center gap-3 shadow-lg ${uploading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}`}>
                                {uploading ? <><Loader2 className="animate-spin" /> Processing...</> : <><Database size={20} /> Sinkronkan ke AI</>}
                            </button>
                        </form>
                    </div>

                    {/* Right Column: List Dokumen */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-black text-slate-800 tracking-tight italic">Dokumen Terindeks</h2>
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-4 py-1.5 rounded-full uppercase">{files.length} File Aktif</span>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={48} /></div>
                        ) : files.length === 0 ? (
                            <div className="bg-white p-20 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
                                <FileText className="mx-auto text-slate-200 mb-4" size={64} />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada dokumen knowledge base.</p>
                            </div>
                        ) : (
                            files.map(file => (
                                <div key={file.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-50 transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                            <FileText size={28} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 text-lg">{file.title}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[9px] bg-slate-100 text-slate-500 px-3 py-1 rounded-md font-black uppercase tracking-tighter group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">{file.category}</span>
                                                <span className="text-[10px] text-slate-400 font-bold tracking-widest italic">VERSION {file.version}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="hidden md:flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                                            <CheckCircle size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">AI Indexed</span>
                                        </div>
                                        <button onClick={() => deleteDoc(file.id)} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KnowledgeBase;