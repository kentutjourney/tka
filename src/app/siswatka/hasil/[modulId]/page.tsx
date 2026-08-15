'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Trophy, ArrowLeft, Loader2, CheckCircle2, XCircle, ChevronRight, BarChart } from 'lucide-react';
import Link from 'next/link';

export default function HasilUjianSiswaPage({ params }: { params: Promise<{ modulId: string }> }) {
  const resolvedParams = use(params);
  const modulId = resolvedParams.modulId;
  const router = useRouter();

  const [siswa, setSiswa] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionData = sessionStorage.getItem('tka_siswa');
    if (!sessionData) {
      router.push('/siswatka');
      return;
    }
    const studentInfo = JSON.parse(sessionData);
    setSiswa(studentInfo);
    
    fetchResult(studentInfo.id);
  }, [router, modulId]);

  const fetchResult = async (studentId: string) => {
    try {
      // Ambil hasil ujian terbaru untuk siswa ini pada modul ini
      const { data, error } = await supabase
        .from('exam_results')
        .select('*')
        .eq('student_id', studentId)
        .eq('module_id', modulId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setResult(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Hasil Ujian Tidak Ditemukan</h2>
        <Link href="/siswatka/menu" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20">
          Kembali ke Menu
        </Link>
      </div>
    );
  }

  // Parse JSON answers
  let answers: any[] = [];
  try {
    answers = typeof result.jawaban_siswa === 'string' 
      ? JSON.parse(result.jawaban_siswa) 
      : result.jawaban_siswa;
  } catch(e) {}

  const benarCount = answers.filter((a) => a.benar).length;
  const salahCount = result.total_soal - benarCount;

  // Determine grade colors based on score
  const isExcellent = result.skor >= 85;
  const isGood = result.skor >= 70 && result.skor < 85;
  const isPoor = result.skor < 70;

  let gradeColor = 'text-indigo-600';
  let gradeBg = 'bg-indigo-100';
  let gradeMessage = 'Selesai!';

  if (isExcellent) {
    gradeColor = 'text-emerald-600';
    gradeBg = 'bg-emerald-100';
    gradeMessage = 'Luar Biasa! Pertahankan!';
  } else if (isGood) {
    gradeColor = 'text-blue-600';
    gradeBg = 'bg-blue-100';
    gradeMessage = 'Kerja Bagus! Tingkatkan Terus!';
  } else if (isPoor) {
    gradeColor = 'text-amber-600';
    gradeBg = 'bg-amber-100';
    gradeMessage = 'Tetap Semangat & Belajar Lagi Ya!';
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Summary */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-200 text-center relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-3 ${gradeBg.replace('100', '500')}`}></div>
          
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${gradeBg} mb-6`}>
            <Trophy className={`w-12 h-12 ${gradeColor}`} />
          </div>

          <h1 className="text-3xl font-black text-slate-800 mb-2">Nilai Try Out Kamu</h1>
          <p className="text-slate-500 font-medium text-lg mb-8">{gradeMessage}</p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 w-full max-w-[200px] shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Nilai Akhir</p>
              <p className={`text-6xl font-black ${gradeColor}`}>{result.skor}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-2" />
                <p className="text-2xl font-black text-emerald-700">{benarCount}</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase">Jawaban Benar</p>
              </div>
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
                <XCircle className="w-6 h-6 text-rose-500 mb-2" />
                <p className="text-2xl font-black text-rose-700">{salahCount}</p>
                <p className="text-[10px] font-bold text-rose-600 uppercase">Salah / Kosong</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl inline-flex mx-auto border border-slate-200">
            <BarChart className="w-4 h-4 text-slate-400" />
            <span>Modul: <b className="text-slate-700">{result.nama_modul}</b></span>
            <span className="text-slate-300">|</span>
            <span>Mapel: <b className="text-slate-700">{result.mata_pelajaran}</b></span>
          </div>
        </div>

        {/* Action Button */}
        <Link 
          href="/siswatka/menu"
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Menu Utama</span>
        </Link>

      </div>
    </div>
  );
}
