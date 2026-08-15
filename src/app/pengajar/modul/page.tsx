'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BookOpen, 
  PlusCircle, 
  Search, 
  Trash2, 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Lock,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function PengajarModulPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mine' | 'all'>('mine');
  const [searchTerm, setSearchTerm] = useState('');

  // Multi-step modal for creating module
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    kategori: 'Bahasa Indonesia',
    mata_pelajaran: 'Bahasa Indonesia',
    kelas: 'Kelas 4',
    nama_modul: '',
  });
  const [creating, setCreating] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('tka_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (e) {}
    }
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('modules')
        .select(`
          *,
          pengajar_profiles (
            username,
            email
          ),
          questions (count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModules(data || []);
    } catch (err: any) {
      console.error('Error fetching modules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_modul.trim()) {
      setToastMessage({ type: 'error', text: 'Silakan isi nama modul.' });
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pengajar_id: currentUser?.id,
          username: currentUser?.username,
          kategori: formData.kategori,
          mata_pelajaran: formData.mata_pelajaran,
          kelas: formData.kelas,
          nama_modul: formData.nama_modul.trim(),
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Gagal membuat modul.');
      }

      setToastMessage({ type: 'success', text: `Modul "${formData.nama_modul}" berhasil dibuat!` });
      setCreateModalOpen(false);
      setStep(1);
      setFormData({
        kategori: 'Bahasa Indonesia',
        mata_pelajaran: 'Bahasa Indonesia',
        kelas: 'Kelas 4',
        nama_modul: '',
      });
      fetchModules();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message || 'Gagal membuat modul.' });
    } finally {
      setCreating(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleDeleteModule = async (mod: any) => {
    if (mod.pengajar_id !== currentUser?.id && currentUser?.role !== 'superadmin') {
      alert('Anda tidak memiliki izin untuk menghapus modul milik pengajar lain.');
      return;
    }

    if (!confirm(`Hapus modul "${mod.nama_modul}" beserta seluruh soalnya?`)) return;

    try {
      const res = await fetch(`/api/modules?id=${mod.id}&username=${currentUser?.username}&nama_modul=${encodeURIComponent(mod.nama_modul)}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message);

      setToastMessage({ type: 'success', text: 'Modul berhasil dihapus.' });
      fetchModules();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message || 'Gagal menghapus modul.' });
    } finally {
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleAjukanTryout = async (mod: any) => {
    try {
      const res = await fetch('/api/modules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: mod.id,
          status_approval: 'pending',
          username: currentUser?.username,
          nama_modul: mod.nama_modul,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message);

      setToastMessage({ type: 'success', text: `Modul "${mod.nama_modul}" berhasil diajukan untuk Try Out TKA SD!` });
      fetchModules();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: 'Gagal mengajukan modul.' });
    } finally {
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const filteredModules = modules.filter((m) => {
    const isMine = m.pengajar_id === currentUser?.id;
    const matchesTab = activeTab === 'mine' ? isMine : true;
    const matchesSearch =
      m.nama_modul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.mata_pelajaran.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-2 shadow-lg transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Manajemen Modul & Bank Soal</h2>
          <p className="text-sm text-slate-500 mt-1">
            Buat modul, susun latihan soal pilihan ganda, dan ajukan materi untuk try out siswa
          </p>
        </div>

        <button
          onClick={() => {
            setStep(1);
            setCreateModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Tambah Modul Baru</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('mine')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'mine'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Modul Saya ({modules.filter((m) => m.pengajar_id === currentUser?.id).length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Modul Pengajar ({modules.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari modul atau mata pelajaran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>
      </div>

      {/* Modules Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Memuat daftar modul...
        </div>
      ) : filteredModules.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">Belum Ada Modul</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {activeTab === 'mine'
              ? 'Anda belum membuat modul soal. Silakan klik tombol "+ Tambah Modul Baru" untuk memulai.'
              : 'Belum ada modul yang dibuat oleh pengajar lain.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((mod) => {
            const isMine = mod.pengajar_id === currentUser?.id;
            const questionCount = mod.questions?.[0]?.count || 0;
            const creatorName = mod.pengajar_profiles?.username || 'Pengajar';

            return (
              <div
                key={mod.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {mod.mata_pelajaran}
                    </span>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                      {mod.kelas}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 mb-1 leading-snug group-hover:text-emerald-600 transition">
                    {mod.nama_modul}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 mb-4">
                    <span>Oleh: <b>@{creatorName}</b></span>
                    <span>&bull;</span>
                    <span className="text-emerald-700 font-bold">{questionCount} Soal</span>
                  </div>

                  <div className="mb-4">
                    {mod.status_approval === 'draft' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        Draft (Belum Diajukan)
                      </span>
                    )}
                    {mod.status_approval === 'pending' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        Diajukan untuk Try Out
                      </span>
                    )}
                    {mod.status_approval === 'approved' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Disetujui untuk Try Out
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <Link
                    href={`/pengajar/modul/${mod.id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold text-center transition flex items-center justify-center gap-1.5"
                  >
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                    <span>{isMine ? 'Kelola & Input Soal' : 'Lihat Bank Soal'}</span>
                  </Link>

                  {isMine && (
                    <div className="flex items-center gap-2 pt-1">
                      {mod.status_approval === 'draft' && (
                        <button
                          onClick={() => handleAjukanTryout(mod)}
                          className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition flex items-center justify-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Ajukan Try Out</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteModule(mod)}
                        title="Hapus Modul"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {!isMine && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                      <Lock className="w-3 h-3" />
                      <span>Modul pengajar lain (hanya bisa dilihat)</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Wizard: Tambah Modul Baru */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            {/* Steps indicator */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Langkah {step} dari 2
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {step === 1 ? 'Pilih Kategori & Kelas' : 'Beri Nama Modul Soal'}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-emerald-500' : 'bg-slate-200'}`}></span>
                <span className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-emerald-500' : 'bg-slate-200'}`}></span>
              </div>
            </div>

            <form onSubmit={handleCreateModule} className="space-y-4">
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Mata Pelajaran / Bahasa
                    </label>
                    <select
                      value={formData.mata_pelajaran}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mata_pelajaran: e.target.value,
                          kategori: e.target.value,
                        })
                      }
                      style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition cursor-pointer"
                    >
                      <option value="Bahasa Indonesia" className="text-slate-900 font-semibold bg-white py-1">Bahasa Indonesia</option>
                      <option value="Matematika" className="text-slate-900 font-semibold bg-white py-1">Matematika</option>
                      <option value="IPAS (Ilmu Pengetahuan Alam & Sosial)" className="text-slate-900 font-semibold bg-white py-1">IPAS (Ilmu Pengetahuan Alam & Sosial)</option>
                      <option value="Bahasa Inggris" className="text-slate-900 font-semibold bg-white py-1">Bahasa Inggris</option>
                      <option value="Pendidikan Pancasila" className="text-slate-900 font-semibold bg-white py-1">Pendidikan Pancasila</option>
                      <option value="Seni Budaya" className="text-slate-900 font-semibold bg-white py-1">Seni Budaya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Tingkat Kelas SD
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'].map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setFormData({ ...formData, kelas: k })}
                          className={`py-3 px-2 rounded-xl text-xs font-black border-2 transition cursor-pointer ${
                            formData.kelas === k
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-sm'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCreateModalOpen(false)}
                      className="py-3 px-5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="py-3 px-6 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      <span>Lanjut: Beri Nama Modul</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-3.5 bg-emerald-50 rounded-2xl text-xs text-emerald-900 font-bold border border-emerald-200">
                    Kategori Terpilih: <span className="text-emerald-700">{formData.mata_pelajaran} ({formData.kelas})</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Nama / Judul Modul Soal
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Latihan TKA Bab 1 - Membaca Pemahaman"
                      value={formData.nama_modul}
                      onChange={(e) => setFormData({ ...formData, nama_modul: e.target.value })}
                      style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                      Setelah modul dibuat, Anda dapat langsung mengklik modul tersebut untuk memasukkan soal-soal.
                    </p>
                  </div>

                  <div className="pt-4 flex justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="py-3 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Kembali</span>
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="py-3 px-6 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Menyimpan Modul...</span>
                        </>
                      ) : (
                        <span>Selesai & Buat Modul</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
