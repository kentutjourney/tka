'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Trophy, 
  ArrowLeft, 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Clock, 
  Eye, 
  Sparkles,
  BarChart3,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function SiswaRiwayatPage() {
  const router = useRouter();
  const [siswa, setSiswa] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState<any | null>(null);

  useEffect(() => {
    const sessionData = sessionStorage.getItem('tka_siswa');
    if (!sessionData) {
      router.push('/siswatka');
      return;
    }
    const studentInfo = JSON.parse(sessionData);
    setSiswa(studentInfo);
    fetchStudentHistory(studentInfo.id, studentInfo.nisn);
  }, [router]);

  const fetchStudentHistory = async (studentId: string, nisn: string) => {
    try {
      setLoading(true);
      // Cari berdasarkan student_id atau nisn
      const { data, error } = await supabase
        .from('exam_results')
        .select('*')
        .or(`student_id.eq.${studentId},nisn.eq.${nisn}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (err: any) {
      console.error('Error fetching student history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!siswa) return null;

  const totalUjian = history.length;
  const scores = history.map((h) => Number(h.skor) || 0);
  const avgScore = totalUjian > 0 ? (scores.reduce((a, b) => a + b, 0) / totalUjian).toFixed(1) : 0;
  const bestScore = totalUjian > 0 ? Math.max(...scores) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/siswatka/menu"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-slate-600 hover:text-indigo-600 font-bold text-sm shadow-sm border border-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Menu Utama</span>
          </Link>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400">Peserta Ujian</span>
            <p className="text-sm font-black text-indigo-700 uppercase">{siswa.nama_lengkap}</p>
          </div>
        </div>

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Laporan Hasil Simulasi TKA
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Riwayat Ujian & Nilai Saya</h1>
            <p className="text-indigo-100 text-xs md:text-sm max-w-md font-medium">
              Semua hasil modul dan try out yang sudah pernah kamu kerjakan tersimpan di sini.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <div className="text-center px-3">
              <p className="text-[11px] font-bold uppercase text-indigo-200">Total Ujian</p>
              <p className="text-2xl font-black">{totalUjian}</p>
            </div>
            <div className="w-[1px] h-8 bg-white/20"></div>
            <div className="text-center px-3">
              <p className="text-[11px] font-bold uppercase text-indigo-200">Rata-Rata</p>
              <p className="text-2xl font-black text-amber-300">{avgScore}</p>
            </div>
            <div className="w-[1px] h-8 bg-white/20"></div>
            <div className="text-center px-3">
              <p className="text-[11px] font-bold uppercase text-indigo-200">Nilai Terbaik</p>
              <p className="text-2xl font-black text-emerald-300">{bestScore}</p>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Daftar Modul yang Sudah Dikerjakan
          </h3>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
              <p className="text-xs text-slate-500 font-medium">Memuat riwayat ujian kamu...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Trophy className="w-14 h-14 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">Kamu Belum Mengerjakan Ujian</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Silakan pilih mata pelajaran di Menu Utama, lalu kerjakan modul latihan untuk melihat nilaimu di sini.
              </p>
              <Link
                href="/siswatka/menu"
                className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
              >
                Pilih Modul Ujian Sekarang
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item, idx) => {
                const score = Number(item.skor) || 0;
                const isExcellent = score >= 85;
                const isGood = score >= 70 && score < 85;

                let parsedAnswers: any[] = [];
                try {
                  parsedAnswers = typeof item.jawaban_siswa === 'string' ? JSON.parse(item.jawaban_siswa) : item.jawaban_siswa || [];
                } catch (e) {}
                const benar = parsedAnswers.filter((a) => a.benar).length;
                const totalSoal = item.total_soal || parsedAnswers.length;

                return (
                  <div
                    key={item.id || idx}
                    className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-300 transition"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {item.mata_pelajaran}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(item.waktu_selesai || item.created_at).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      <h4 className="text-lg font-black text-slate-900 leading-tight">
                        {item.nama_modul}
                      </h4>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          ✓ {benar} Benar
                        </span>
                        <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                          ✗ {totalSoal - benar} Salah / Kosong
                        </span>
                        <span className="text-slate-400 font-medium">
                          Total: {totalSoal} Soal
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Nilai Skor</p>
                        <p
                          className={`text-3xl font-black ${
                            isExcellent
                              ? 'text-emerald-600'
                              : isGood
                              ? 'text-indigo-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {score}
                          <span className="text-xs font-semibold text-slate-400">/100</span>
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedDetail(item)}
                        className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Jawaban</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Modal Detail Jawaban Siswa */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                  {selectedDetail.mata_pelajaran}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{selectedDetail.nama_modul}</h3>
                <p className="text-xs text-slate-500">
                  Dikerjakan pada {new Date(selectedDetail.waktu_selesai || selectedDetail.created_at).toLocaleString('id-ID')}
                </p>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Banner in Modal */}
            <div className="my-5 p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-indigo-800 font-bold uppercase">Nilai Skor Akhir</p>
                <p className="text-3xl font-black text-indigo-700 mt-0.5">{selectedDetail.skor} / 100</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Status: Selesai
                </span>
              </div>
            </div>

            {/* Answers breakdown */}
            <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Rincian Jawaban Soal:</h4>
              {(() => {
                let parsed: any[] = [];
                try {
                  parsed = typeof selectedDetail.jawaban_siswa === 'string' ? JSON.parse(selectedDetail.jawaban_siswa) : selectedDetail.jawaban_siswa || [];
                } catch (e) {}

                if (!parsed || parsed.length === 0) {
                  return <p className="text-xs text-slate-400 py-4 text-center">Tidak ada data rincian butir soal.</p>;
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {parsed.map((ans: any, idx: number) => {
                      const isCorrect = ans.benar;
                      const hasAnswer = Boolean(ans.jawaban);

                      return (
                        <div
                          key={ans.soal_id || idx}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-semibold'
                              : 'bg-rose-50 border-rose-200 text-rose-950 font-semibold'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0">
                              {idx + 1}
                            </span>
                            <span>
                              Jawaban: <b>{hasAnswer ? ans.jawaban : '(Kosong)'}</b>
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
                onClick={() => setSelectedDetail(null)}
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
