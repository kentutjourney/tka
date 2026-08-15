'use client';

import React, { useEffect, useState, use, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BookOpen, 
  PlusCircle, 
  ArrowLeft, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  Type, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  HelpCircle,
  Clock,
  Timer,
  UploadCloud,
  FileImage,
  X,
  Plus,
  Lock,
  Send,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { parseQuestionOptions, formatOptionsForDatabase, QuestionOption } from '@/lib/optionsHelper';

export default function PengajarDetailModulPage({ params }: { params: Promise<{ modulId: string }> }) {
  const resolvedParams = use(params);
  const modulId = resolvedParams.modulId;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [moduleData, setModuleData] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Add/Edit Question
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [questionForm, setQuestionForm] = useState({
    tipe_input: 'text' as 'text' | 'image',
    pertanyaan: '',
    gambar_url: '',
    jawaban_benar: 'A',
    durasi_detik: 60,
  });

  // Dynamic Options State (A, B, C, D, E, F, G, H, ...)
  const [options, setOptions] = useState<QuestionOption[]>([
    { key: 'A', text: '' },
    { key: 'B', text: '' },
    { key: 'C', text: '' },
    { key: 'D', text: '' },
  ]);

  const [imageFileName, setImageFileName] = useState<string>('');
  const [imageFileSize, setImageFileSize] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [savingQuestion, setSavingQuestion] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('tka_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (e) {}
    }
    fetchModuleAndQuestions();
  }, [modulId]);

  const fetchModuleAndQuestions = async () => {
    try {
      setLoading(true);
      // Fetch module info
      const { data: mod, error: modErr } = await supabase
        .from('modules')
        .select(`
          *,
          pengajar_profiles (
            username,
            email
          )
        `)
        .eq('id', modulId)
        .single();

      if (modErr) throw modErr;
      setModuleData(mod);

      // Fetch questions
      const { data: qData, error: qErr } = await supabase
        .from('questions')
        .select('*')
        .eq('module_id', modulId)
        .order('created_at', { ascending: true });

      if (qErr) throw qErr;
      setQuestions(qData || []);
    } catch (err: any) {
      console.error('Error fetching module details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      tipe_input: 'text',
      pertanyaan: '',
      gambar_url: '',
      jawaban_benar: 'A',
      durasi_detik: 60,
    });
    setOptions([
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' },
    ]);
    setImageFileName('');
    setImageFileSize('');
    setQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q: any) => {
    setEditingQuestion(q);
    setQuestionForm({
      tipe_input: q.tipe_input || 'text',
      pertanyaan: q.pertanyaan,
      gambar_url: q.gambar_url || '',
      jawaban_benar: q.jawaban_benar || 'A',
      durasi_detik: q.durasi_detik || 60,
    });

    // Parse dynamic options safely from question data
    const loadedOptions = parseQuestionOptions(q);
    setOptions(loadedOptions.length >= 2 ? loadedOptions : [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' },
    ]);

    setImageFileName(q.gambar_url ? 'Foto Soal Terpasang' : '');
    setImageFileSize('');
    setQuestionModalOpen(true);
  };

  // Add Option (A, B, C, D, E, F, G, H, ...)
  const handleAddOption = () => {
    if (options.length >= 10) {
      setToastMessage({ type: 'error', text: 'Maksimal 10 pilihan jawaban per soal.' });
      return;
    }
    const nextKey = String.fromCharCode(65 + options.length);
    setOptions([...options, { key: nextKey, text: '' }]);
  };

  // Remove Option
  const handleRemoveOption = (indexToRemove: number) => {
    if (options.length <= 2) {
      setToastMessage({ type: 'error', text: 'Minimal harus ada 2 pilihan jawaban.' });
      return;
    }
    const filtered = options.filter((_, idx) => idx !== indexToRemove);
    const reindexed = filtered.map((opt, idx) => ({
      key: String.fromCharCode(65 + idx),
      text: opt.text,
    }));

    setOptions(reindexed);

    // Reset jawaban benar jika opsi yang terpilih dihapus
    if (!reindexed.some((opt) => opt.key === questionForm.jawaban_benar)) {
      setQuestionForm((prev) => ({ ...prev, jawaban_benar: 'A' }));
    }
  };

  const handleOptionTextChange = (index: number, newText: string) => {
    const updated = [...options];
    updated[index].text = newText;
    setOptions(updated);
  };

  // File Upload Handling
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setToastMessage({ type: 'error', text: 'Format file tidak didukung. Harap pilih gambar (PNG, JPG, JPEG, WEBP).' });
      return;
    }

    const maxSizeInBytes = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSizeInBytes) {
      setToastMessage({ type: 'error', text: 'Ukuran gambar terlalu besar! Maksimal 50 MB.' });
      return;
    }

    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    setImageFileName(file.name);
    setImageFileSize(sizeFormatted);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      setQuestionForm((prev) => ({
        ...prev,
        gambar_url: base64String,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setQuestionForm((prev) => ({ ...prev, gambar_url: '' }));
    setImageFileName('');
    setImageFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isOwner = moduleData?.pengajar_id === currentUser?.id || currentUser?.role === 'superadmin';
  const isApproved = moduleData?.status_approval === 'approved';
  const isPending = moduleData?.status_approval === 'pending';

  // Logika Re-Approval jika modul sudah pernah di-ACC
  const revertToPendingIfApproved = async () => {
    if (moduleData?.status_approval === 'approved') {
      await supabase
        .from('modules')
        .update({ status_approval: 'pending', updated_at: new Date().toISOString() })
        .eq('id', modulId);

      await supabase.from('activity_logs').insert([{
        user_id: currentUser?.id || null,
        action: 'Modul Perlu Re-ACC',
        details: `Pengajar @${currentUser?.username || 'user'} mengedit soal pada modul "${moduleData?.nama_modul}" yang sudah disetujui. Modul dikembalikan ke status Pending untuk persetujuan ulang Super Admin.`,
      }]);

      setToastMessage({ type: 'error', text: '⚠️ Modul ini sebelumnya sudah di-ACC. Karena Anda mengubah soal, modul otomatis kembali ke status "Menunggu Persetujuan" dan harus di-ACC ulang oleh Super Admin.' });
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionForm.pertanyaan.trim()) {
      setToastMessage({ type: 'error', text: 'Teks pertanyaan wajib diisi.' });
      return;
    }

    const emptyOption = options.find((opt) => !opt.text.trim());
    if (emptyOption) {
      setToastMessage({ type: 'error', text: `Pilihan ${emptyOption.key} masih kosong. Silakan isi atau hapus opsi tersebut.` });
      return;
    }

    setSavingQuestion(true);

    // Format opsi dinamis dengan helper universal
    const dbOptions = formatOptionsForDatabase(options);

    const payload = {
      tipe_input: questionForm.tipe_input,
      pertanyaan: questionForm.pertanyaan,
      gambar_url: questionForm.tipe_input === 'image' ? questionForm.gambar_url : null,
      ...dbOptions,
      jawaban_benar: questionForm.jawaban_benar,
      durasi_detik: questionForm.durasi_detik,
      username: currentUser?.username,
      nama_modul: moduleData?.nama_modul,
    };

    try {
      if (editingQuestion) {
        const res = await fetch('/api/questions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingQuestion.id,
            ...payload,
          }),
        });

        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.message);

        setToastMessage({ type: 'success', text: 'Soal berhasil diperbarui!' });
      } else {
        const res = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module_id: modulId,
            ...payload,
          }),
        });

        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.message);

        setToastMessage({ type: 'success', text: 'Soal baru berhasil ditambahkan!' });
      }

      await revertToPendingIfApproved();
      setQuestionModalOpen(false);
      fetchModuleAndQuestions();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message || 'Gagal menyimpan soal.' });
    } finally {
      setSavingQuestion(false);
      setTimeout(() => setToastMessage(null), 6000);
    }
  };

  const handleDeleteQuestion = async (q: any) => {
    if (!confirm('Apakah Anda yakin ingin menghapus soal ini?')) return;

    try {
      const res = await fetch(`/api/questions?id=${q.id}&username=${currentUser?.username}&nama_modul=${encodeURIComponent(moduleData?.nama_modul || 'Modul')}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message);

      await revertToPendingIfApproved();
      if (moduleData?.status_approval !== 'approved') {
        setToastMessage({ type: 'success', text: 'Soal berhasil dihapus.' });
      }
      fetchModuleAndQuestions();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: 'Gagal menghapus soal.' });
    } finally {
      setTimeout(() => setToastMessage(null), 6000);
    }
  };

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

      {/* Back & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/pengajar/modul"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Modul</span>
        </Link>
      </div>

      {/* Status Banners */}
      {moduleData && isApproved && (
        <div className="p-4 rounded-2xl border border-emerald-300 bg-emerald-50 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-emerald-800">✅ Modul Ini Sudah Disetujui Super Admin & Siap untuk Try Out Siswa</p>
            <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">
              Jika Anda menambah, mengubah, atau menghapus soal, modul akan otomatis kembali ke status <b>Menunggu Persetujuan</b> dan harus di-ACC ulang oleh Super Admin sebelum bisa digunakan siswa.
            </p>
          </div>
        </div>
      )}

      {moduleData && isPending && (
        <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50 flex items-start gap-3">
          <Send className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-amber-800">⏳ Modul Menunggu Persetujuan Super Admin</p>
            <p className="text-[11px] text-amber-700 mt-0.5 font-medium">
              Modul ini sudah diajukan dan sedang menunggu ACC dari Super Admin. Anda masih bisa menambah/mengubah soal, tapi persetujuan akan diperlukan ulang.
            </p>
          </div>
        </div>
      )}

      {/* Module Info Banner */}
      {moduleData && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {moduleData.mata_pelajaran}
              </span>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                {moduleData.kelas}
              </span>
              {isApproved && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck className="w-3 h-3" />
                  Disetujui (Siap Try Out)
                </span>
              )}
              {isPending && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                  <Clock className="w-3 h-3" />
                  Menunggu Persetujuan
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-900">{moduleData.nama_modul}</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Dibuat oleh: <b className="text-slate-800">@{moduleData.pengajar_profiles?.username || 'Pengajar'}</b> &bull; Total: <b className="text-emerald-700">{questions.length} Soal</b>
            </p>
          </div>

          {isOwner && (
            <div className="flex flex-col gap-2">
              <button
                onClick={handleOpenAddQuestion}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Tambah Soal Baru</span>
              </button>
              {isApproved && (
                <p className="text-[10px] text-amber-700 font-bold text-center flex items-center justify-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  Edit soal → perlu ACC ulang
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          Daftar Soal Latihan & Bank Soal
        </h3>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Memuat daftar soal...
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-700">Belum Ada Soal di Modul Ini</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Klik tombol "+ Tambah Soal Baru" di atas untuk memasukkan pertanyaan teks/gambar, atur pilihan ganda custom (A-H), dan durasi detik.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const qOptions = parseQuestionOptions(q);

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Timer className="w-3 h-3 text-indigo-600" />
                            <span>Durasi: {q.durasi_detik || 60} Detik</span>
                          </span>
                          {q.tipe_input === 'image' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <FileImage className="w-3 h-3" />
                              <span>Soal Bergambar</span>
                            </span>
                          )}
                          <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {qOptions.length} Pilihan Jawaban
                          </span>
                        </div>

                        <p className="text-sm font-bold text-slate-900 leading-relaxed">
                          {q.pertanyaan}
                        </p>

                        {q.tipe_input === 'image' && q.gambar_url && (
                          <div className="mt-2 rounded-2xl overflow-hidden border border-slate-200 max-w-md bg-slate-50 p-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={q.gambar_url}
                              alt="Ilustrasi Soal"
                              className="w-full max-h-72 object-contain rounded-xl"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {isOwner && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenEditQuestion(q)}
                          className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                          title="Edit Soal"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Hapus Soal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {qOptions.map((opt) => {
                      const isCorrect = q.jawaban_benar === opt.key;
                      return (
                        <div
                          key={opt.key}
                          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-3 transition ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-black shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-slate-300 text-slate-700'
                            }`}
                          >
                            {opt.key}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                          {isCorrect && (
                            <span className="text-[10px] uppercase font-black text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                              Kunci Jawaban
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Soal */}
      {questionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150 my-8">
            <h3 className="text-xl font-black text-slate-900 mb-1">
              {editingQuestion ? 'Edit Soal' : 'Tambah Soal Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">
              Masukkan pertanyaan, upload/geser foto (maks. 50 MB), atur opsi pilihan ganda custom (A, B, C, D, E, F, G, H, dst.), dan durasi pengerjaan
            </p>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              {/* Type Switcher */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                <button
                  type="button"
                  onClick={() => setQuestionForm({ ...questionForm, tipe_input: 'text' })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    questionForm.tipe_input === 'text'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Soal Teks Murni</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuestionForm({ ...questionForm, tipe_input: 'image' })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    questionForm.tipe_input === 'image'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Soal Bergambar (Upload/Geser Foto)</span>
                </button>
              </div>

              {/* Durasi Pengerjaan Per Soal */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-emerald-600" />
                  <span>Durasi Waktu Pengerjaan Soal (Detik)</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[15, 30, 45, 60, 90, 120].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setQuestionForm({ ...questionForm, durasi_detik: sec })}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer ${
                        questionForm.durasi_detik === sec
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {sec} Detik {sec === 60 ? '(1 Menit)' : sec === 120 ? '(2 Menit)' : ''}
                    </button>
                  ))}
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-600 ml-1">
                    <span>Custom:</span>
                    <input
                      type="number"
                      min={5}
                      max={600}
                      value={questionForm.durasi_detik}
                      onChange={(e) => setQuestionForm({ ...questionForm, durasi_detik: Number(e.target.value) })}
                      style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                      className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-center"
                    />
                    <span>detik</span>
                  </div>
                </div>
              </div>

              {/* Pertanyaan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Isi Pertanyaan Soal
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ketikkan teks pertanyaan soal..."
                  value={questionForm.pertanyaan}
                  onChange={(e) => setQuestionForm({ ...questionForm, pertanyaan: e.target.value })}
                  style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                  className="w-full p-4 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              {/* Upload Foto (Drag & Drop atau Pilih File Komputer max 50MB) */}
              {questionForm.tipe_input === 'image' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Foto / Gambar Soal (PNG, JPG, JPEG, WEBP &bull; Maks. 50 MB)
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {questionForm.gambar_url ? (
                    <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-emerald-200 bg-white shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={questionForm.gambar_url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 truncate max-w-xs">
                            {imageFileName || 'Foto Soal Terpasang'}
                          </p>
                          {imageFileSize && (
                            <p className="text-[11px] text-emerald-700 font-semibold">{imageFileSize}</p>
                          )}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[11px] font-bold text-emerald-600 hover:underline mt-1 block cursor-pointer"
                          >
                            Ganti Gambar
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                        title="Hapus Gambar"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                        isDragging
                          ? 'border-emerald-500 bg-emerald-50/80 scale-[1.01]'
                          : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-emerald-400'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-emerald-600">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          <span className="text-emerald-600 hover:underline">Klik untuk pilih gambar</span> dari komputer atau <span className="text-slate-900">geser (drag & drop)</span> ke sini
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Format: PNG, JPG, JPEG, WEBP (Kapasitas maksimal hingga <b>50 MB</b>)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dynamic Multiple Choice Options */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Pilihan Jawaban & Kunci Jawaban Benar (Bisa Tambah / Hapus Opsi)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Opsi ({String.fromCharCode(65 + options.length)})</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {options.map((item, index) => (
                    <div key={item.key} className="flex items-center gap-3">
                      {/* Radio button for correct answer */}
                      <label className="flex items-center gap-1.5 cursor-pointer shrink-0" title={`Pilih ${item.key} sebagai Kunci Jawaban`}>
                        <input
                          type="radio"
                          name="jawaban_benar"
                          checked={questionForm.jawaban_benar === item.key}
                          onChange={() => setQuestionForm({ ...questionForm, jawaban_benar: item.key })}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="font-black text-xs text-slate-800 w-5">{item.key}</span>
                      </label>

                      {/* Text Input */}
                      <input
                        type="text"
                        required
                        placeholder={`Jawaban pilihan ${item.key}...`}
                        value={item.text}
                        onChange={(e) => handleOptionTextChange(index, e.target.value)}
                        style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                        className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                      />

                      {/* Delete Option Button */}
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0"
                          title={`Hapus Opsi ${item.key}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-slate-500 font-medium pt-1">
                  💡 <i>Klik tombol bulat di samping huruf untuk memilih kunci jawaban yang benar. Anda dapat menambah opsi (misal A, B, C, D, E, F, G, H, dst.) atau menghapus opsi hingga tersisa 2 pilihan (misal Benar/Salah).</i>
                </p>
              </div>

              {/* Action buttons */}
              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuestionModalOpen(false)}
                  className="py-3 px-5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingQuestion}
                  className="py-3 px-6 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {savingQuestion ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Soal...</span>
                    </>
                  ) : (
                    <span>{editingQuestion ? 'Perbarui Soal' : 'Simpan Soal'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
