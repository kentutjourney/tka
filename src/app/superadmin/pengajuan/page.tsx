'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  Eye,
  Search,
  Timer,
  User,
  Loader2,
  FileText,
  ArrowRight,
  Shield,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminPengajuanPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Detail / Preview Modal
  const [detailModal, setDetailModal] = useState<{ open: boolean; module: any | null }>({ open: false, module: null });
  const [detailQuestions, setDetailQuestions] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Reject reason modal
  const [rejectModal, setRejectModal] = useState<{ open: boolean; module: any | null }>({ open: false, module: null });
  const [rejectReason, setRejectReason] = useState('');

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
        .order('updated_at', { ascending: false });

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

  const handleApprove = async (mod: any) => {
    if (!confirm(`Setujui modul "${mod.nama_modul}" untuk Try Out siswa?`)) return;

    setActionLoading(mod.id);
    try {
      const { error } = await supabase
        .from('modules')
        .update({
          status_approval: 'approved',
          reject_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', mod.id);

      if (error) throw error;

      await supabase.from('activity_logs').insert([{
        user_id: null,
        action: 'Super Admin ACC Modul',
        details: `Super Admin menyetujui modul "${mod.nama_modul}" milik @${mod.pengajar_profiles?.username || 'unknown'} untuk Try Out siswa TKA SD.`,
      }]);

      setToastMessage({ type: 'success', text: `Modul "${mod.nama_modul}" berhasil disetujui! Modul siap diakses siswa.` });
      fetchModules();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message || 'Gagal menyetujui modul.' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const openRejectModal = (mod: any) => {
    setRejectModal({ open: true, module: mod });
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!rejectModal.module) return;
    const mod = rejectModal.module;

    setActionLoading(mod.id);
    try {
      const { error } = await supabase
        .from('modules')
        .update({
          status_approval: 'rejected',
          reject_reason: rejectReason || 'Tidak memenuhi syarat.',
          updated_at: new Date().toISOString(),
        })
        .eq('id', mod.id);

      if (error) throw error;

      await supabase.from('activity_logs').insert([{
        user_id: null,
        action: 'Super Admin Tolak Modul',
        details: `Super Admin menolak modul "${mod.nama_modul}" milik @${mod.pengajar_profiles?.username || 'unknown'}. Alasan: ${rejectReason || 'Tidak memenuhi syarat.'}`,
      }]);

      setToastMessage({ type: 'success', text: `Modul "${mod.nama_modul}" ditolak. Pengajar akan diminta merevisi.` });
      setRejectModal({ open: false, module: null });
      fetchModules();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message || 'Gagal menolak modul.' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleOpenDetail = async (mod: any) => {
    setDetailModal({ open: true, module: mod });
    setLoadingDetail(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('module_id', mod.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setDetailQuestions(data || []);
    } catch (err) {
      setDetailQuestions([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredModules = modules.filter((m) => {
    const matchesStatus = filterStatus === 'all' || m.status_approval === filterStatus;
    const matchesSearch =
      m.nama_modul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.mata_pelajaran.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.pengajar_profiles?.username && m.pengajar_profiles.username.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const countByStatus = (status: string) => modules.filter((m) => m.status_approval === status).length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-2 shadow-lg ${
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
      <div>
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <ClipboardCheck className="w-7 h-7 text-rose-600" />
          Pengajuan & Persetujuan Modul
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Tinjau dan setujui modul yang diajukan pengajar untuk Try Out siswa TKA SD. Modul yang di-ACC akan bisa dikerjakan siswa.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Menunggu ACC', count: countByStatus('pending'), color: 'amber', icon: Clock },
          { label: 'Disetujui (Siap)', count: countByStatus('approved'), color: 'emerald', icon: CheckCircle2 },
          { label: 'Ditolak', count: countByStatus('rejected'), color: 'rose', icon: XCircle },
          { label: 'Draft', count: countByStatus('draft'), color: 'slate', icon: FileText },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                <span className={`text-2xl font-black text-${stat.color}-700`}>{stat.count}</span>
              </div>
              <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto">
          {[
            { key: 'pending', label: `Menunggu ACC (${countByStatus('pending')})` },
            { key: 'approved', label: `Disetujui (${countByStatus('approved')})` },
            { key: 'rejected', label: `Ditolak (${countByStatus('rejected')})` },
            { key: 'all', label: `Semua (${modules.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterStatus === tab.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari modul atau pengajar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          />
        </div>
      </div>

      {/* Module Cards */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Memuat pengajuan modul...
        </div>
      ) : filteredModules.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
          <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-700">
            {filterStatus === 'pending' ? 'Tidak Ada Pengajuan Baru' : 'Tidak Ada Modul di Kategori Ini'}
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {filterStatus === 'pending'
              ? 'Belum ada pengajar yang mengajukan modul baru. Pengajuan baru akan muncul di sini.'
              : 'Coba filter dengan kategori lain atau periksa daftar semua modul.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredModules.map((mod) => {
            const pengajar = mod.pengajar_profiles;
            const questionCount = mod.questions?.[0]?.count || 0;
            const isPending = mod.status_approval === 'pending';
            const isApproved = mod.status_approval === 'approved';
            const isRejected = mod.status_approval === 'rejected';
            const isDraft = mod.status_approval === 'draft';

            return (
              <div
                key={mod.id}
                className={`bg-white rounded-3xl border p-6 shadow-sm transition-all ${
                  isPending
                    ? 'border-amber-300 bg-amber-50/20'
                    : isApproved
                    ? 'border-emerald-200'
                    : isRejected
                    ? 'border-rose-200'
                    : 'border-slate-200/80'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Module Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {mod.mata_pelajaran}
                      </span>
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                        {mod.kelas}
                      </span>

                      {/* Status Badge */}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                          <Clock className="w-3 h-3" />
                          Menunggu Persetujuan
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Disetujui (Siap Try Out)
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                          <XCircle className="w-3 h-3" />
                          Ditolak
                        </span>
                      )}
                      {isDraft && (
                        <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Draft (Belum Diajukan)
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-slate-900">{mod.nama_modul}</h3>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <b className="text-slate-700">@{pengajar?.username || 'Unknown'}</b>
                      </span>
                      <span>&bull;</span>
                      <span className="font-bold text-indigo-700">{questionCount} Soal</span>
                      <span>&bull;</span>
                      <span>
                        {new Date(mod.updated_at || mod.created_at).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>

                    {/* Show reject reason if rejected */}
                    {isRejected && mod.reject_reason && (
                      <div className="mt-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
                        <b>Alasan Penolakan:</b> {mod.reject_reason}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Preview / Lihat Soal */}
                    <button
                      onClick={() => handleOpenDetail(mod)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Lihat Soal</span>
                    </button>

                    {/* Approve Button (only for pending) */}
                    {isPending && (
                      <button
                        onClick={() => handleApprove(mod)}
                        disabled={actionLoading === mod.id}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoading === mod.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>ACC / Setujui</span>
                      </button>
                    )}

                    {/* Reject Button (only for pending) */}
                    {isPending && (
                      <button
                        onClick={() => openRejectModal(mod)}
                        className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Tolak</span>
                      </button>
                    )}

                    {/* Revoke approval (for already approved) */}
                    {isApproved && (
                      <button
                        onClick={() => openRejectModal(mod)}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cabut Persetujuan</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-rose-600" />
              Tolak Modul
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Modul "<b>{rejectModal.module?.nama_modul}</b>" oleh @{rejectModal.module?.pengajar_profiles?.username} akan ditolak. Pengajar bisa merevisi dan mengajukan ulang.
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Alasan Penolakan (Opsional)
              </label>
              <textarea
                rows={3}
                placeholder="Misal: Soal belum lengkap, pertanyaan kurang jelas, gambar belum terlampir..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                className="w-full p-4 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-semibold text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <button
                onClick={() => setRejectModal({ open: false, module: null })}
                className="py-3 px-5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === rejectModal.module?.id}
                className="py-3 px-6 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition flex items-center gap-1.5 shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading === rejectModal.module?.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span>Konfirmasi Tolak</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail / Preview Modal */}
      {detailModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-3xl w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Preview Soal: {detailModal.module?.nama_modul}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {detailModal.module?.mata_pelajaran} &bull; {detailModal.module?.kelas} &bull; Oleh @{detailModal.module?.pengajar_profiles?.username}
                </p>
              </div>
              <button
                onClick={() => setDetailModal({ open: false, module: null })}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Memuat soal-soal...
              </div>
            ) : detailQuestions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="font-semibold text-slate-600">Belum ada soal di modul ini.</p>
                <p className="text-xs mt-1">Pengajar belum memasukkan soal ke modul ini.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {detailQuestions.map((q, idx) => {
                  const qOptions: { key: string; text: string }[] = [];
                  if (q.opsi_a) qOptions.push({ key: 'A', text: q.opsi_a });
                  if (q.opsi_b) qOptions.push({ key: 'B', text: q.opsi_b });
                  if (q.opsi_c) qOptions.push({ key: 'C', text: q.opsi_c });
                  if (q.opsi_d) qOptions.push({ key: 'D', text: q.opsi_d });
                  if (q.opsi_e) qOptions.push({ key: 'E', text: q.opsi_e });

                  return (
                    <div key={q.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <Timer className="w-3 h-3" />
                              {q.durasi_detik || 60} Detik
                            </span>
                            {q.tipe_input === 'image' && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Bergambar
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-slate-900">{q.pertanyaan}</p>

                          {q.tipe_input === 'image' && q.gambar_url && (
                            <div className="rounded-xl overflow-hidden border border-slate-200 max-w-sm bg-white p-1">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={q.gambar_url} alt="Ilustrasi" className="max-h-48 object-contain rounded-lg mx-auto" />
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {qOptions.map((opt) => {
                              const isCorrect = q.jawaban_benar === opt.key;
                              return (
                                <div
                                  key={opt.key}
                                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                                    isCorrect
                                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-black'
                                      : 'bg-white border-slate-200 text-slate-700'
                                  }`}
                                >
                                  <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                                    isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {opt.key}
                                  </span>
                                  <span className="flex-1">{opt.text}</span>
                                  {isCorrect && <span className="text-[9px] uppercase font-black text-emerald-700 bg-emerald-200 px-1.5 py-0.5 rounded-full">Kunci</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Action Bar in Detail */}
            {detailModal.module?.status_approval === 'pending' && (
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setDetailModal({ open: false, module: null });
                    openRejectModal(detailModal.module);
                  }}
                  className="py-3 px-5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Tolak Modul</span>
                </button>
                <button
                  onClick={() => {
                    handleApprove(detailModal.module);
                    setDetailModal({ open: false, module: null });
                  }}
                  className="py-3 px-6 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ACC / Setujui Modul Ini</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
