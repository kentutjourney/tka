'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BookOpen, 
  Search, 
  Trash2, 
  Edit3, 
  User, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Eye
} from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminModulPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('all');

  // Edit Modal State
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    module: any | null;
  }>({
    isOpen: false,
    module: null,
  });
  const [editForm, setEditForm] = useState({
    nama_modul: '',
    mata_pelajaran: '',
    kategori: '',
    kelas: '',
    status_approval: 'draft',
  });
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  useEffect(() => {
    fetchModules();
  }, []);

  const handleOpenEdit = (mod: any) => {
    setEditModal({ isOpen: true, module: mod });
    setEditForm({
      nama_modul: mod.nama_modul,
      mata_pelajaran: mod.mata_pelajaran,
      kategori: mod.kategori,
      kelas: mod.kelas,
      status_approval: mod.status_approval || 'draft',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.module) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('modules')
        .update({
          nama_modul: editForm.nama_modul,
          mata_pelajaran: editForm.mata_pelajaran,
          kategori: editForm.kategori,
          kelas: editForm.kelas,
          status_approval: editForm.status_approval,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editModal.module.id);

      if (error) throw error;

      // Catat log Super Admin
      await supabase.from('activity_logs').insert([
        {
          user_id: null,
          action: 'Super Admin Edit Modul',
          details: `Super Admin mengedit modul "${editForm.nama_modul}" (Milik pengajar @${editModal.module.pengajar_profiles?.username || 'unknown'}).`,
        },
      ]);

      setToastMessage({ type: 'success', text: 'Modul berhasil diperbarui oleh Super Admin!' });
      setEditModal({ isOpen: false, module: null });
      fetchModules();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message || 'Gagal menyimpan perubahan modul.' });
    } finally {
      setSaving(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleDeleteModule = async (mod: any) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus modul "${mod.nama_modul}" beserta seluruh soalnya?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('modules').delete().eq('id', mod.id);
      if (error) throw error;

      await supabase.from('activity_logs').insert([
        {
          user_id: null,
          action: 'Super Admin Hapus Modul',
          details: `Super Admin menghapus modul "${mod.nama_modul}" milik @${mod.pengajar_profiles?.username || 'unknown'}.`,
        },
      ]);

      setToastMessage({ type: 'success', text: `Modul "${mod.nama_modul}" berhasil dihapus!` });
      fetchModules();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message || 'Gagal menghapus modul.' });
    } finally {
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const filteredModules = modules.filter((m) => {
    const matchesSearch =
      m.nama_modul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.mata_pelajaran.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.pengajar_profiles?.username && m.pengajar_profiles.username.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesKategori = selectedKategori === 'all' || m.kategori === selectedKategori;
    return matchesSearch && matchesKategori;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Manajemen Semua Modul Soal</h2>
          <p className="text-sm text-slate-500 mt-1">
            Super Admin memiliki akses penuh untuk meninjau, mengedit, dan menghapus modul dari semua pengajar
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama modul, mapel, atau pembuat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          >
            <option value="all">Semua Kategori</option>
            <option value="Bahasa Indonesia">Bahasa Indonesia</option>
            <option value="Matematika">Matematika</option>
            <option value="IPAS">IPAS (Sains & Sosial)</option>
            <option value="Bahasa Inggris">Bahasa Inggris</option>
            <option value="Pendidikan Pancasila">Pendidikan Pancasila</option>
          </select>
        </div>
      </div>

      {/* Modules Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Memuat semua modul...
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Belum ada modul yang sesuai dengan pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[11px] font-bold tracking-wider bg-slate-50/50">
                  <th className="py-4 px-6">Nama Modul</th>
                  <th className="py-4 px-6">Mapel & Kelas</th>
                  <th className="py-4 px-6">Dibuat Oleh</th>
                  <th className="py-4 px-6">Jumlah Soal</th>
                  <th className="py-4 px-6">Terakhir Diedit</th>
                  <th className="py-4 px-6 text-right">Aksi Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredModules.map((mod) => {
                  const pengajar = mod.pengajar_profiles;
                  const questionCount = mod.questions?.[0]?.count || 0;

                  return (
                    <tr key={mod.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">{mod.nama_modul}</span>
                            <span className="text-[11px] text-slate-400">ID: {mod.id.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                          {mod.mata_pelajaran || mod.kategori}
                        </span>
                        <span className="block text-[11px] text-slate-500 mt-0.5 font-medium">{mod.kelas}</span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                            {pengajar?.username ? pengajar.username.charAt(0).toUpperCase() : 'G'}
                          </div>
                          <div>
                            <span className="font-bold">@{pengajar?.username || 'Tidak diketahui'}</span>
                            <p className="text-[10px] text-slate-400">{pengajar?.email || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-xs font-bold text-slate-800">
                        <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {questionCount} Soal
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-500">
                        {new Date(mod.updated_at || mod.created_at).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(mod)}
                            title="Edit Modul Ini"
                            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteModule(mod)}
                            title="Hapus Modul"
                            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <h3 className="text-xl font-black text-slate-800 mb-1">Edit Modul (Super Admin)</h3>
            <p className="text-xs text-slate-500 mb-5">
              Mengubah konfigurasi modul milik @{editModal.module?.pengajar_profiles?.username}
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nama Modul
                </label>
                <input
                  type="text"
                  required
                  value={editForm.nama_modul}
                  onChange={(e) => setEditForm({ ...editForm, nama_modul: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.mata_pelajaran}
                    onChange={(e) => setEditForm({ ...editForm, mata_pelajaran: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Kelas
                  </label>
                  <select
                    value={editForm.kelas}
                    onChange={(e) => setEditForm({ ...editForm, kelas: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Kelas 1">Kelas 1</option>
                    <option value="Kelas 2">Kelas 2</option>
                    <option value="Kelas 3">Kelas 3</option>
                    <option value="Kelas 4">Kelas 4</option>
                    <option value="Kelas 5">Kelas 5</option>
                    <option value="Kelas 6">Kelas 6</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Status Approval Tryout
                </label>
                <select
                  value={editForm.status_approval}
                  onChange={(e) => setEditForm({ ...editForm, status_approval: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="draft">Draft (Belum Diajukan)</option>
                  <option value="pending">Pending (Menunggu Uji Coba)</option>
                  <option value="approved">Approved (Siap Dijalankan di Try Out TKA SD)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditModal({ isOpen: false, module: null })}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
