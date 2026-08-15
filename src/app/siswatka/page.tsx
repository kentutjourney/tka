'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, User, Hash, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function SiswaLoginPage() {
  const router = useRouter();
  const [nisn, setNisn] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/siswatka/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nisn, nama_lengkap: namaLengkap }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Gagal masuk. Periksa kembali NISN dan Nama Lengkap.');
        setLoading(false);
        return;
      }

      // Simpan data siswa di sessionStorage (sementara, hilang kalau tutup browser)
      sessionStorage.setItem('tka_siswa', JSON.stringify(data.student));
      
      router.push('/siswatka/menu');
    } catch (err: any) {
      setErrorMsg('Terjadi kesalahan koneksi. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-2xl mb-4 transform rotate-3">
            <BookOpen className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-black text-white drop-shadow-md tracking-tight">Portal TKA Siswa</h1>
          <p className="text-indigo-100 font-medium mt-2">SD Negeri Kedung Jaya 02</p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl border border-white/20">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Masuk untuk Memulai Ujian</h2>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Nomor Induk Siswa Nasional (NISN)
              </label>
              <div className="relative">
                <Hash className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: 0012345678"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-bold transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Nama Lengkap Siswa
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Sesuai absen kelas"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-bold transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 px-6 rounded-2xl font-black text-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Memeriksa Data...</span>
                </>
              ) : (
                <>
                  <span>Masuk Portal Ujian</span>
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center text-white/70 text-sm mt-8 font-medium">
          &copy; {new Date().getFullYear()} TKA SD Negeri Kedung Jaya 02
        </p>
      </div>
    </div>
  );
}
