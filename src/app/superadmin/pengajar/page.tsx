'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Mail, 
  ShieldCheck, 
  AlertCircle, 
  Search, 
  Loader2,
  Send,
  UserCheck
} from 'lucide-react';

export default function SuperAdminPengajarPage() {
  const [pengajars, setPengajars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  // Modal State for Approval Confirmation
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    pengajar: any | null;
    actionType: 'approve' | 'reject' | 'delete';
  }>({
    isOpen: false,
    pengajar: null,
    actionType: 'approve',
  });
  const [processingAction, setProcessingAction] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPengajars = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pengajar_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPengajars(data || []);
    } catch (err: any) {
      console.error('Error fetching pengajars:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengajars();
  }, []);

  const handleOpenConfirm = (pengajar: any, actionType: 'approve' | 'reject' | 'delete') => {
    setConfirmModal({
      isOpen: true,
      pengajar,
      actionType,
    });
  };

  const handleExecuteAction = async () => {
    const { pengajar, actionType } = confirmModal;
    if (!pengajar) return;

    setProcessingAction(true);

    try {
      if (actionType === 'delete') {
        const res = await fetch(`/api/superadmin/pengajar?id=${pengajar.id}`, {
          method: 'DELETE',
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.message);

        // Catat log
        await supabase.from('activity_logs').insert([
          {
            user_id: null,
            action: 'Hapus Akun Pengajar',
            details: `Super Admin menghapus pengajar @${pengajar.username} (${pengajar.email}).`,
          },
        ]);

        setToastMessage({ type: 'success', text: `Pengajar @${pengajar.username} berhasil dihapus!` });
      } else {
        const newStatus = actionType === 'approve' ? 'approved' : 'rejected';
        const res = await fetch('/api/superadmin/pengajar', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: pengajar.id,
            status: newStatus,
            email: pengajar.email,
            username: pengajar.username,
          }),
        });

        const result = await res.json();
        if (!result.success) throw new Error(result.message);

        // Catat log
        await supabase.from('activity_logs').insert([
          {
            user_id: pengajar.id,
            action: actionType === 'approve' ? 'Approval Pengajar' : 'Penolakan Pengajar',
            details: actionType === 'approve'
              ? `Super Admin MENYETUJUI akun @${pengajar.username} dan mengirimkan email konfirmasi ke ${pengajar.email}.`
              : `Super Admin MENOLAK pendaftaran @${pengajar.username} (tanpa email).`,
          },
        ]);

        setToastMessage({
          type: 'success',
          text: result.message || (actionType === 'approve' ? 'Pengajar disetujui & email dikirim!' : 'Pengajar ditolak.'),
        });
      }

      setConfirmModal({ isOpen: false, pengajar: null, actionType: 'approve' });
      fetchPengajars();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message || 'Gagal memproses aksi.' });
    } finally {
      setProcessingAction(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const filteredPengajars = pengajars.filter((p) => {
    const matchesTab = activeTab === 'all' ? true : p.status === activeTab;
    const matchesSearch =
      p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const pendingCount = pengajars.filter((p) => p.status === 'pending').length;
  const approvedCount = pengajars.filter((p) => p.status === 'approved').length;
  const rejectedCount = pengajars.filter((p) => p.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Manajemen & Approval Pengajar</h2>
          <p className="text-sm text-slate-500 mt-1">
            Hanya Super Admin yang berhak menyetujui, menolak, atau menghapus guru pengajar
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Menunggu ACC</span>
            {pendingCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'approved'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Disetujui</span>
            <span className="text-[10px] text-slate-400">({approvedCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'rejected'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Ditolak</span>
            <span className="text-[10px] text-slate-400">({rejectedCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({pengajars.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari username atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Pengajar List Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Memuat data pengajar...
          </div>
        ) : filteredPengajars.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Tidak ada data pengajar pada kategori ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[11px] font-bold tracking-wider bg-slate-50/50">
                  <th className="py-4 px-6">Pengajar</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Tanggal Daftar</th>
                  <th className="py-4 px-6">Status Akun</th>
                  <th className="py-4 px-6 text-right">Aksi Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPengajars.map((pengajar) => {
                  return (
                    <tr key={pengajar.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-black text-sm border border-slate-200">
                            {pengajar.username ? pengajar.username.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm">@{pengajar.username}</span>
                            <span className="block text-[11px] text-slate-400">ID: {pengajar.id.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{pengajar.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-500">
                        {new Date(pengajar.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {pengajar.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                            Menunggu ACC
                          </span>
                        )}
                        {pengajar.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Disetujui (Aktif)
                          </span>
                        )}
                        {pengajar.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Ditolak
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {pengajar.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleOpenConfirm(pengajar, 'approve')}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1 shadow-sm"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleOpenConfirm(pengajar, 'reject')}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition flex items-center gap-1 border border-slate-200"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Tolak
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleOpenConfirm(pengajar, 'delete')}
                            title="Hapus Akun Pengajar"
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
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

      {/* Approval / Rejection / Delete Confirmation Modal */}
      {confirmModal.isOpen && confirmModal.pengajar && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="text-center space-y-3">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
                  confirmModal.actionType === 'approve'
                    ? 'bg-emerald-100 text-emerald-600'
                    : confirmModal.actionType === 'reject'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-rose-100 text-rose-600'
                }`}
              >
                {confirmModal.actionType === 'approve' && <Send className="w-7 h-7" />}
                {confirmModal.actionType === 'reject' && <XCircle className="w-7 h-7" />}
                {confirmModal.actionType === 'delete' && <Trash2 className="w-7 h-7" />}
              </div>

              <h3 className="text-xl font-black text-slate-800">
                {confirmModal.actionType === 'approve' && 'Konfirmasi Persetujuan Akun'}
                {confirmModal.actionType === 'reject' && 'Konfirmasi Penolakan Akun'}
                {confirmModal.actionType === 'delete' && 'Konfirmasi Hapus Akun'}
              </h3>

              <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 text-left space-y-2 border border-slate-200">
                <p>
                  Pengajar: <b>@{confirmModal.pengajar.username}</b> ({confirmModal.pengajar.email})
                </p>
                {confirmModal.actionType === 'approve' && (
                  <p className="text-emerald-700 font-medium">
                    &bull; Ketika Anda klik <b>Yes (Approve)</b>, sistem akan menyetujui akun ini dan <b>langsung mengirimkan email konfirmasi</b> ke alamat email pengajar tersebut.
                  </p>
                )}
                {confirmModal.actionType === 'reject' && (
                  <p className="text-amber-700 font-medium">
                    &bull; Ketika Anda klik <b>Yes (Tolak)</b>, pendaftaran pengajar akan ditolak dan <b>tidak dikirimkan email</b>.
                  </p>
                )}
                {confirmModal.actionType === 'delete' && (
                  <p className="text-rose-700 font-medium">
                    &bull; Akun pengajar ini akan dihapus secara permanen dari basis data.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                disabled={processingAction}
                onClick={() => setConfirmModal({ isOpen: false, pengajar: null, actionType: 'approve' })}
                className="py-3 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Batal / No
              </button>
              <button
                type="button"
                disabled={processingAction}
                onClick={handleExecuteAction}
                className={`py-3 px-4 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                  confirmModal.actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
                    : confirmModal.actionType === 'reject'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20'
                }`}
              >
                {processingAction ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>
                    Yes, {confirmModal.actionType === 'approve' ? 'Approve & Kirim Email' : confirmModal.actionType === 'reject' ? 'Tolak Akun' : 'Hapus Akun'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
