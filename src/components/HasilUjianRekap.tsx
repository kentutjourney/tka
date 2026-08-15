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
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Trash2,
  RefreshCw,
  X,
  UserCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface StudentExamResult {
  id: string;
  student_id: string;
  module_id: string;
  nisn: string;
  nama_lengkap: string;
  nama_modul: string;
  mata_pelajaran: string;
  skor: number;
  total_soal: number;
  jawaban_siswa: string | any[];
  waktu_selesai: string;
  created_at: string;
}

export default function HasilUjianRekapComponent({ role = 'superadmin' }: { role?: 'superadmin' | 'admin' | 'pengajar' }) {
  const [results, setResults] = useState<StudentExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('all');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Modal Detail Lembar Jawaban
  const [selectedResult, setSelectedResult] = useState<StudentExamResult | null>(null);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('tka_user');
      let userObj = null;
      if (userStr) {
        try {
          userObj = JSON.parse(userStr);
          setCurrentUser(userObj);
        } catch (e) {}
      }

      // Ambil seluruh hasil ujian dari exam_results
      const { data, error } = await supabase
        .from('exam_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (err: any) {
      console.error('Error fetching exam results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleExportExcel = () => {
    if (results.length === 0) return;

    const exportData = filteredResults.map((r, i) => {
      let parsedAnswers: any[] = [];
      try {
        parsedAnswers = typeof r.jawaban_siswa === 'string' ? JSON.parse(r.jawaban_siswa) : r.jawaban_siswa || [];
      } catch (e) {}
      const benar = parsedAnswers.filter((a) => a.benar).length;

      return {
        No: i + 1,
        NISN: r.nisn,
        'Nama Siswa': r.nama_lengkap,
        'Mata Pelajaran': r.mata_pelajaran,
        'Modul Ujian': r.nama_modul,
        'Nilai Skor (0-100)': Number(r.skor),
        'Jumlah Soal': r.total_soal,
        'Jawaban Benar': benar,
        'Jawaban Salah/Kosong': r.total_soal - benar,
        'Waktu Selesai': new Date(r.waktu_selesai || r.created_at).toLocaleString('id-ID', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap_Nilai_TKA');
    XLSX.writeFile(workbook, `Rekap_Nilai_TKA_SD_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleDeleteResult = async (id: string, nama: string) => {
    if (!confirm(`Hapus data hasil ujian milik ${nama}? Data tidak dapat dikembalikan.`)) return;

    try {
      const { error } = await supabase.from('exam_results').delete().eq('id', id);
      if (error) throw error;
      setResults(results.filter((r) => r.id !== id));
      if (selectedResult?.id === id) setSelectedResult(null);
    } catch (err: any) {
      alert('Gagal menghapus data: ' + err.message);
    }
  };

  const filteredResults = results.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (r.nama_lengkap && r.nama_lengkap.toLowerCase().includes(term)) ||
      (r.nisn && r.nisn.toLowerCase().includes(term)) ||
      (r.nama_modul && r.nama_modul.toLowerCase().includes(term));

    const matchesMapel = selectedMapel === 'all' || r.mata_pelajaran === selectedMapel;
    return matchesSearch && matchesMapel;
  });

  const scores = results.map((r) => Number(r.skor) || 0);
  const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const tuntasCount = scores.filter((s) => s >= 70).length;

  const themePrimary = role === 'pengajar' ? 'emerald' : role === 'admin' ? 'indigo' : 'rose';

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              role === 'pengajar' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : role === 'admin' 
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {role === 'superadmin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Portal Guru Pengajar'}
            </span>
            <span className="text-xs text-slate-400 font-semibold">&bull; Terintegrasi Real-time</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">Hasil & Statistik Nilai Siswa</h2>
          <p className="text-xs text-slate-500 font-medium">
            Memantau skor ujian, persentase ketuntasan, dan lembar jawaban siswa pada modul try out TKA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchResults}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportExcel}
            disabled={filteredResults.length === 0}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50 ${
              role === 'pengajar'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Rekap Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Summary Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Rata-Rata Nilai</span>
            <BarChart3 className={`w-4 h-4 ${role === 'pengajar' ? 'text-emerald-600' : 'text-indigo-600'}`} />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {avgScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Dari {results.length} kali pengerjaan</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Nilai Tertinggi</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-2">
            {maxScore} <span className="text-sm font-normal text-slate-400">poin</span>
          </p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">Skor Maksimal Siswa</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Tuntas (Skor &ge; 70)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-indigo-600 mt-2">
            {tuntasCount} <span className="text-sm font-normal text-slate-400">siswa</span>
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            {results.length > 0 ? Math.round((tuntasCount / results.length) * 100) : 0}% Tingkat Ketuntasan
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Total Siswa Ujian</span>
            <GraduationCap className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {results.length} <span className="text-sm font-normal text-slate-400">sesi</span>
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Seluruh modul try out</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Nama Siswa, NISN, atau Modul..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedMapel}
            onChange={(e) => setSelectedMapel(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition cursor-pointer"
          >
            <option value="all">Semua Mata Pelajaran</option>
            <option value="Matematika">Matematika</option>
            <option value="Bahasa Indonesia">Bahasa Indonesia</option>
            <option value="IPAS">IPAS</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Memuat data hasil ujian siswa...
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">Belum Ada Hasil Ujian</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Siswa yang telah menyelesaikan simulasi try out akan otomatis muncul di tabel ini secara langsung.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[11px] font-bold tracking-wider bg-slate-50/50">
                  <th className="py-4 px-6">Siswa / Peserta</th>
                  <th className="py-4 px-6">Modul & Mata Pelajaran</th>
                  <th className="py-4 px-6">Skor Akhir</th>
                  <th className="py-4 px-6">Statistik Jawaban</th>
                  <th className="py-4 px-6">Waktu Selesai</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredResults.map((res) => {
                  const score = Number(res.skor);
                  const isHigh = score >= 80;
                  const isMed = score >= 65 && score < 80;

                  let parsedAnswers: any[] = [];
                  try {
                    parsedAnswers = typeof res.jawaban_siswa === 'string' ? JSON.parse(res.jawaban_siswa) : res.jawaban_siswa || [];
                  } catch (e) {}
                  const benar = parsedAnswers.filter((a) => a.benar).length;
                  const salah = (res.total_soal || parsedAnswers.length) - benar;

                  return (
                    <tr key={res.id} className="hover:bg-slate-50/70 transition">
                      {/* Siswa */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl text-white flex items-center justify-center text-xs font-black shrink-0 ${
                            role === 'pengajar'
                              ? 'bg-gradient-to-tr from-emerald-500 to-teal-500'
                              : 'bg-gradient-to-tr from-indigo-500 to-purple-500'
                          }`}>
                            {res.nama_lengkap ? res.nama_lengkap.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 uppercase text-xs">{res.nama_lengkap || 'Siswa'}</p>
                            <p className="text-[11px] text-slate-400 font-medium">NISN: {res.nisn}</p>
                          </div>
                        </div>
                      </td>

                      {/* Modul & Mapel */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <p className="font-bold text-xs text-slate-800">{res.nama_modul}</p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                          {res.mata_pelajaran}
                        </span>
                      </td>

                      {/* Skor */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${
                            isHigh
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                              : isMed
                              ? 'bg-amber-50 text-amber-700 border border-amber-300'
                              : 'bg-rose-50 text-rose-700 border border-rose-300'
                          }`}
                        >
                          {score} / 100
                        </span>
                      </td>

                      {/* Statistik Jawaban */}
                      <td className="py-4 px-6 whitespace-nowrap text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            ✓ {benar} Benar
                          </span>
                          <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                            ✗ {salah} Salah
                          </span>
                        </div>
                      </td>

                      {/* Waktu */}
                      <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-400">
                        {new Date(res.waktu_selesai || res.created_at).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>

                      {/* Aksi */}
                      <td className="py-4 px-6 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedResult(res)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                            title="Lihat Detail Lembar Jawaban"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </button>

                          {role === 'superadmin' && (
                            <button
                              onClick={() => handleDeleteResult(res.id, res.nama_lengkap)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Hapus Hasil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* Modal Detail Lembar Jawaban Siswa */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  Lembar Jawaban Siswa
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1 uppercase">
                  {selectedResult.nama_lengkap}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  NISN: <b>{selectedResult.nisn}</b> &bull; Modul: <b>{selectedResult.nama_modul}</b> ({selectedResult.mata_pelajaran})
                </p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Banner in Modal */}
            <div className="my-5 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Total Skor Akhir</p>
                <p className="text-3xl font-black text-emerald-700 mt-0.5">{selectedResult.skor} / 100</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-medium">Waktu Selesai</p>
                <p className="text-xs font-bold text-slate-700">
                  {new Date(selectedResult.waktu_selesai || selectedResult.created_at).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>

            {/* Answers Detail List */}
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Rincian Butir Soal:</h4>
              {(() => {
                let parsed: any[] = [];
                try {
                  parsed = typeof selectedResult.jawaban_siswa === 'string' ? JSON.parse(selectedResult.jawaban_siswa) : selectedResult.jawaban_siswa || [];
                } catch (e) {}

                if (!parsed || parsed.length === 0) {
                  return <p className="text-xs text-slate-400 py-4 text-center">Tidak ada rincian jawaban tersimpan.</p>;
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {parsed.map((ans: any, idx: number) => {
                      const isCorrect = ans.benar;
                      const hasAnswer = Boolean(ans.jawaban);

                      return (
                        <div
                          key={ans.soal_id || idx}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                            isCorrect
                              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 font-semibold'
                              : 'bg-rose-50/80 border-rose-200 text-rose-950 font-semibold'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0">
                              {idx + 1}
                            </span>
                            <span>
                              Jawaban Siswa: <b>{hasAnswer ? ans.jawaban : '(Kosong/Lewat)'}</b>
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 font-bold">
                            {isCorrect ? (
                              <span className="text-emerald-700 flex items-center gap-0.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Benar
                              </span>
                            ) : (
                              <span className="text-rose-700 flex items-center gap-0.5">
                                <XCircle className="w-4 h-4 text-rose-600" />
                                Salah
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedResult(null)}
                className="py-2.5 px-6 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
