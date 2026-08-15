'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, User, Hash, Lock, MapPin, Calendar, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function SiswaLoginPage() {
  const router = useRouter();
  
  const [nisn, setNisn] = useState('');
  const [password, setPassword] = useState('');
  const [namaPeserta, setNamaPeserta] = useState('');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  
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
        body: JSON.stringify({ 
          nisn, 
          password,
          nama_peserta: namaPeserta,
          tempat_lahir: tempatLahir,
          tanggal_lahir: tanggalLahir
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Gagal masuk. Periksa kembali data Anda.');
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

      <div className="w-full max-w-lg relative z-10 my-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-2xl mb-4 transform rotate-3">
            <BookOpen className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md tracking-tight">KARTU LOGIN SIMULASI</h1>
          <p className="text-indigo-100 font-bold mt-2 text-sm sm:text-base">TES KEMAMPUAN AKADEMIK SD/MI TAHUN 2026</p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-white/20">
          <div className="mb-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-xs sm:text-sm text-indigo-800 font-medium">
            <p>👋 <b>Halo Siswa/i!</b> Silakan lengkapi form di bawah ini sesuai dengan data Anda.</p>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-xs">
              <li>Jika ini <b>login pertama Anda</b>, pastikan data yang diisi benar karena akan dikunci.</li>
              <li>Jika ini <b>login kedua kalinya</b>, data harus sama persis dengan isian pertama Anda.</li>
            </ul>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* NISN & Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">NISN</label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 1020402700"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-bold text-sm transition"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-bold text-sm transition"
                  />
                </div>
              </div>
            </div>

            {/* Nama Peserta */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Nama Peserta</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: PESERTA 0010"
                  value={namaPeserta}
                  onChange={(e) => setNamaPeserta(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-bold text-sm uppercase transition"
                />
              </div>
            </div>

            {/* Tempat & Tanggal Lahir Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Tempat Lahir</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: KOTA BOGOR"
                    value={tempatLahir}
                    onChange={(e) => setTempatLahir(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-bold text-sm uppercase transition"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Tanggal Lahir</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={tanggalLahir}
                    onChange={(e) => setTanggalLahir(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-bold text-sm transition"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-4 px-6 rounded-2xl font-black text-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.02]"
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
        
        <p className="text-center text-white/80 text-sm mt-8 font-medium">
          &copy; {new Date().getFullYear()} TKA SD/MI &bull; Semangat Belajar!
        </p>
      </div>
    </div>
  );
}
