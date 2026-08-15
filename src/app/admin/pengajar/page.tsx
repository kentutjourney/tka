'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  Search, 
  Download, 
  Mail, 
  CheckCircle2, 
  Clock, 
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminPengajarPage() {
  const [pengajars, setPengajars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
      console.error('Error fetching pengajars for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengajars();
  }, []);

  const handleExportData = () => {
    if (pengajars.length === 0) return;

    const exportRows = pengajars.map((p, index) => ({
      No: index + 1,
      Username: p.username,
      Email: p.email,
      Status: p.status,
      'Tanggal Mendaftar': new Date(p.created_at).toLocaleDateString('id-ID'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Pengajar');
    XLSX.writeFile(workbook, `Data_Pengajar_TKA_SD_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const filteredPengajars = pengajars.filter((p) =>
    p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Notice Read Only */}
      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center justify-between">
        <span>
          <b>Mode Pantau (Read-Only)</b>: Wewenang persetujuan (approval) & penghapusan pengajar hanya dimiliki oleh <b>Super Admin</b>.
        </span>
      </div>

      {/* Header & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Daftar Guru & Pengajar</h2>
          <p className="text-sm text-slate-500 mt-1">
            Melihat seluruh profil pengajar yang terdaftar dalam sistem TKA SD
          </p>
        </div>

        <button
          onClick={handleExportData}
          disabled={pengajars.length === 0}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Data Pengajar (.xlsx)</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama pengajar atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Memuat daftar pengajar...
          </div>
        ) : filteredPengajars.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Tidak ada pengajar yang sesuai dengan pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[11px] font-bold tracking-wider bg-slate-50/50">
                  <th className="py-4 px-6">Pengajar</th>
                  <th className="py-4 px-6">Email Terdaftar</th>
                  <th className="py-4 px-6">Tanggal Bergabung</th>
                  <th className="py-4 px-6">Status Akun</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPengajars.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                            {p.username ? p.username.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm">@{p.username}</span>
                            <span className="block text-[11px] text-slate-400">ID: {p.id.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-500">
                        {new Date(p.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {p.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Aktif (Approved)
                          </span>
                        )}
                        {p.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Menunggu Approval
                          </span>
                        )}
                        {p.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Ditolak
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
