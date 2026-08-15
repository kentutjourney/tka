'use client';

import React, { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { parseQuestionOptions } from '@/lib/optionsHelper';
import { ArrowLeft, Clock, AlertCircle, Play, CheckCircle2, ChevronRight, Loader2, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function UjianSiswaPage({ params }: { params: Promise<{ modulId: string }> }) {
  const resolvedParams = use(params);
  const modulId = resolvedParams.modulId;
  const router = useRouter();

  const [siswa, setSiswa] = useState<any>(null);
  const [moduleData, setModuleData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Exam State
  const [examStarted, setExamStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<{ soal_id: string; jawaban: string; benar: boolean }[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const sessionData = sessionStorage.getItem('tka_siswa');
    if (!sessionData) {
      router.push('/siswatka');
      return;
    }
    setSiswa(JSON.parse(sessionData));
    fetchData();
  }, [router, modulId]);

  const fetchData = async () => {
    try {
      // Fetch Module
      const { data: mod, error: modErr } = await supabase
        .from('modules')
        .select('*')
        .eq('id', modulId)
        .single();
      if (modErr) throw modErr;
      setModuleData(mod);

      // Fetch Questions
      const { data: qData, error: qErr } = await supabase
        .from('questions')
        .select('*')
        .eq('module_id', modulId)
        .order('created_at', { ascending: true });
      if (qErr) throw qErr;
      setQuestions(qData || []);
    } catch (err: any) {
      setError('Gagal memuat data ujian: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Start the exam
  const handleStartExam = () => {
    if (questions.length === 0) return;
    setExamStarted(true);
    startTimerForQuestion(0);
  };

  // Timer logic
  const startTimerForQuestion = (index: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const duration = questions[index]?.durasi_detik || 60;
    setTimeLeft(duration);
    setSelectedOption('');

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeUp(index);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleTimeUp = (index: number) => {
    // Waktu habis, otomatis record jawaban kosong atau yang sedang dipilih (jika blm klik lanjut)
    // Untuk safety, kalau waktu habis kita anggap tidak menjawab atau pakai yang terakhir diklik
    saveAnswer(index, selectedOption);
    goToNextQuestion(index);
  };

  const saveAnswer = (index: number, answerKey: string) => {
    const q = questions[index];
    const isCorrect = answerKey === q.jawaban_benar;
    
    setAnswers((prev) => {
      const newAnswers = [...prev];
      // Hapus jawaban sebelumnya untuk soal ini jika ada (meskipun alurnya maju terus)
      const existingIdx = newAnswers.findIndex(a => a.soal_id === q.id);
      if (existingIdx >= 0) {
        newAnswers[existingIdx] = { soal_id: q.id, jawaban: answerKey, benar: isCorrect };
      } else {
        newAnswers.push({ soal_id: q.id, jawaban: answerKey, benar: isCorrect });
      }
      return newAnswers;
    });
  };

  const handleNextClick = () => {
    saveAnswer(currentQIndex, selectedOption);
    goToNextQuestion(currentQIndex);
  };

  const goToNextQuestion = (currentIndex: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (currentIndex + 1 < questions.length) {
      setCurrentQIndex(currentIndex + 1);
      startTimerForQuestion(currentIndex + 1);
    } else {
      // Selesai
      submitExam();
    }
  };

  const submitExam = async () => {
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Pastikan jawaban terakhir (jika ada yg terlewat) sudah tersimpan di state (React state bisa telat, jadi kita kirim state + current answer)
    // Tapi karena goToNextQuestion menset jawaban dulu, asumsikan sudah beres.
    // Wait for state to settle just in case, but safe bet is passing final answers array.
    // To be perfectly safe, we'll build the final array from current state + current uncommitted selection if we submit directly on last question.
    
    // Namun karena handleNextClick memanggil saveAnswer, lalu memanggil submitExam secara sinkron, 
    // state 'answers' mungkin belum terupdate. Mari kita hitung ulang.
    const q = questions[currentQIndex];
    const isCorrect = selectedOption === q?.jawaban_benar;
    
    let finalAnswers = [...answers];
    const existingIdx = finalAnswers.findIndex(a => a.soal_id === q?.id);
    if (existingIdx >= 0) {
        finalAnswers[existingIdx] = { soal_id: q.id, jawaban: selectedOption, benar: isCorrect };
    } else {
        if(q) finalAnswers.push({ soal_id: q.id, jawaban: selectedOption, benar: isCorrect });
    }

    try {
      const payload = {
        student_id: siswa.id,
        module_id: modulId,
        nisn: siswa.nisn,
        nama_lengkap: siswa.nama_lengkap,
        nama_modul: moduleData.nama_modul,
        mata_pelajaran: moduleData.mata_pelajaran,
        total_soal: questions.length,
        jawaban_siswa: finalAnswers,
      };

      const res = await fetch('/api/siswatka/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      router.replace(`/siswatka/hasil/${modulId}`);
    } catch (err: any) {
      alert('Gagal mengirim jawaban: ' + err.message);
      setSubmitting(false);
    }
  };

  if (!siswa || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <p className="text-slate-800 font-bold text-lg mb-4">{error}</p>
        <Link href="/siswatka/menu" className="text-indigo-600 font-bold hover:underline">Kembali ke Menu Utama</Link>
      </div>
    );
  }

  // --- TAMPILAN START (BELUM MULAI) ---
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <BookOpen className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-slate-800 mb-2">Apakah Kamu Sudah Siap?</h1>
          <p className="text-slate-500 font-medium mb-8">
            Kamu akan mengerjakan modul <b>{moduleData?.nama_modul}</b> ({moduleData?.mata_pelajaran}).
          </p>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-left space-y-4 mb-8">
            <div className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="font-bold">Total Soal: <span className="text-indigo-600">{questions.length} Butir</span></span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <Clock className="w-5 h-5 text-amber-500" />
              <span className="font-medium">Tiap soal memiliki <b>waktu/timer masing-masing</b>. Jika waktu habis, otomatis lanjut ke soal berikutnya.</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <span className="font-medium text-rose-600">Pastikan koneksi internet lancar dan jangan tutup/refresh browser saat ujian berlangsung!</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href={`/siswatka/menu/${encodeURIComponent(moduleData?.mata_pelajaran || '')}`}
              className="px-6 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
            >
              Belum Siap, Kembali
            </Link>
            <button
              onClick={handleStartExam}
              disabled={questions.length === 0}
              className="px-8 py-3.5 rounded-xl font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className="w-5 h-5" />
              <span>{questions.length === 0 ? 'Belum Ada Soal' : 'Mulai Sekarang!'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- TAMPILAN UJIAN BERLANGSUNG ---
  const currentQ = questions[currentQIndex];
  const qOptions = parseQuestionOptions(currentQ);
  const totalQ = questions.length;
  const isLastQuestion = currentQIndex === totalQ - 1;

  // Calculate percentage for progress bar based on time
  const maxTime = currentQ.durasi_detik || 60;
  const timePercentage = (timeLeft / maxTime) * 100;
  const isWarningTime = timeLeft <= 10;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation / Progress */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{moduleData?.mata_pelajaran}</span>
            <span className="text-sm font-black text-slate-800">{moduleData?.nama_modul}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-400">Soal ke</span>
              <div className="text-lg font-black text-indigo-700">{currentQIndex + 1} <span className="text-slate-300 text-sm">/ {totalQ}</span></div>
            </div>
            
            {/* Timer Badge */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-lg transition-colors border-2 ${isWarningTime ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
              <Clock className={`w-5 h-5 ${isWarningTime ? 'text-rose-500' : 'text-slate-400'}`} />
              <span className="w-8 text-center">{timeLeft}s</span>
            </div>
          </div>
        </div>
        
        {/* Progress Bar (Time) */}
        <div className="h-1.5 w-full bg-slate-100 overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-linear ${isWarningTime ? 'bg-rose-500' : 'bg-indigo-500'}`}
            style={{ width: `${timePercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col">
        {submitting ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mb-6" />
            <h2 className="text-2xl font-black text-slate-800 mb-2">Menyimpan Hasil...</h2>
            <p className="text-slate-500 font-medium">Mohon tunggu sebentar, jangan tutup halaman ini.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 md:p-10 flex-1 flex flex-col">
            
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-black text-lg mb-4">
                {currentQIndex + 1}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed">
                {currentQ.pertanyaan}
              </h2>
              
              {currentQ.tipe_input === 'image' && currentQ.gambar_url && (
                <div className="mt-6 rounded-2xl overflow-hidden border-2 border-slate-100 max-w-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={currentQ.gambar_url} alt="Gambar Soal" className="w-full h-auto" />
                </div>
              )}
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
              {qOptions.map((opt) => {
                const isSelected = selectedOption === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedOption(opt.key)}
                    className={`text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group cursor-pointer ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-600/10' 
                        : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                    }`}>
                      {opt.key}
                    </div>
                    <span className={`font-semibold text-sm md:text-base ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleNextClick}
                className="px-8 py-4 rounded-2xl font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 transition flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
              >
                <span>{isLastQuestion ? 'Selesai & Kumpulkan' : 'Selanjutnya'}</span>
                {isLastQuestion ? <CheckCircle2 className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
