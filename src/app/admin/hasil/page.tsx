'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BarChart3, 
  Search, 
  FileSpreadsheet, 
  GraduationCap, 
  Trophy, 
  Calendar, 
  BookOpen, 
  ArrowUpDown 
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminHasilPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('all');

  const fetchResults = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_results')
        .select(`
          *,
          modules (
            nama_modul,
            mata_pelajaran,
            kelas
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (err: any) {
      console.error('Error fetching student results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleExportExcel = () => {
    if (results.length === 0) return;

    const exportData = results.map((r, i) => ({
      No: i + 1,
      'Nama Siswa': r.student_name,
      'Modul Soal': r.modules?.nama_modul || '-',
      'Mata Pelajaran': r.modules?.mata_pelajaran || r.bahasa_pengerjaan || '-',
      'Kelas': r.modules?.kelas || '-',
      'Nilai / Skor': Number(r.nilai),
      'Tanggal Pengerjaan': new Date(r.created_at).toLocaleString('id-ID'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hasil_Ujian_TKA_SD');
    XLSX.writeFile(workbook, `Rekap_Nilai_TKA_SD_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const filteredResults = results.filter((r) => {
    const matchesSearch =
      r.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.modules?.nama_modul && r.modules.nama_modul.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMapel = selectedMapel === 'all' || r.modules?.mata_pelajaran === selectedMapel;
    return matchesSearch && matchesMapel;
  });

  const scores = results.map((r) => Number(r.nilai));
  const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const minScore = scores.length > 0 ? Math.min(...scores) : 0;

  return (
    <div className="space-y-6">
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Rekap Hasil Nilai Ujian Siswa</h2>
          <p className="text-sm text-slate-500 mt-1">
            Data statistik nilai siswa pada try out & latihan TKA SD
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          disabled={results.length === 0}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Download Rekap Nilai (.xlsx)</span>
        </button>
      </div>

      {/* Summary Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Rata-Rata Nilai</span>
            <BarChart3 className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-slate-800 mt-2">{avgScore} <span className="text-sm font-normal text-slate-400">/ 100</span></p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Nilai Tertinggi</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-2">{maxScore} <span className="text-sm font-normal text-slate-400">poin</span></p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Total Siswa Mengerjakan</span>
            <GraduationCap className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-slate-800 mt-2">{results.length} <span className="text-sm font-normal text-slate-400">siswa</span></p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama siswa atau modul..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        <select
          value={selectedMapel}
          onChange={(e) => setSelectedMapel(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        >
          <option value="all">Semua Mata Pelajaran</option>
          <option value="Bahasa Indonesia">Bahasa Indonesia</option>
          <option value="Matematika">Matematika</option>
          <option value="IPAS">IPAS</option>
          <option value="Bahasa Inggris">Bahasa Inggris</option>
        </select>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Memuat hasil ujian...
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Belum ada data pengerjaan ujian siswa.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[11px] font-bold tracking-wider bg-slate-50/50">
                  <th className="py-4 px-6">Nama Siswa</th>
                  <th className="py-4 px-6">Modul Soal</th>
                  <th className="py-4 px-6">Mata Pelajaran & Kelas</th>
                  <th className="py-4 px-6">Skor / Nilai</th>
                  <th className="py-4 px-6">Waktu Selesai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredResults.map((res) => {
                  const score = Number(res.nilai);
                  const isHigh = score >= 80;
                  const isMed = score >= 65 && score < 80;

                  return (
                    <tr key={res.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6 whitespace-nowrap font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                            {res.student_name.charAt(0).toUpperCase()}
                          </div>
                          <span>{res.student_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-700">
                        {res.modules?.nama_modul || '-'}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-600">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold mr-2">
                          {res.modules?.mata_pelajaran || res.bahasa_pengerjaan || '-'}
                        </span>
                        <span>{res.modules?.kelas || '-'}</span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${
                            isHigh
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isMed
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {score} / 100
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-400">
                        {new Date(res.created_at).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
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
