import React from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  ShieldCheck, 
  UserCheck, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  School,
  Building2,
  Award
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation Top */}
      <header className="border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-emerald-500/20">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg leading-none">SD Negeri Kedung Jaya 02</h1>
              <span className="text-[11px] text-emerald-400 font-medium tracking-wide">Portal Latihan & Try Out TKA SD</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/loginadmin"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Login Admin & Super Admin
            </Link>
            <Link
              href="/pengajar/login"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Portal Guru Pengajar</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sistem Akademik Resmi &bull; SD Negeri Kedung Jaya 02</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl leading-tight sm:leading-tight text-white mb-6">
          Portal Latihan & Try Out Tes Kemampuan Akademik (TKA)
        </h2>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Pusat pembuatan bank soal modul, pelaksanaan evaluasi try out siswa, serta pemantauan statistik nilai terpadu <b>Sekolah Dasar Kedung Jaya 02</b>.
        </p>

        {/* Portal Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-left">
          {/* Card Pengajar */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Guru Pengajar</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Input modul mata pelajaran, bank soal teks/gambar (pilihan ganda A-B-C-D), dan evaluasi hasil nilai siswa SDN Kedung Jaya 02.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <Link
                href="/pengajar/login"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold text-center block transition shadow-md shadow-emerald-600/20"
              >
                Masuk Portal Pengajar
              </Link>
              <Link
                href="/pengajar/register"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold text-center block transition"
              >
                Daftar Pengajar Baru (Perlu ACC)
              </Link>
            </div>
          </div>

          {/* Card Admin */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Admin Monitoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Monitoring statistik kegiatan guru pengajar secara realtime, data try out, dan unduh rekapitulasi nilai ujian siswa (.xlsx).
              </p>
            </div>
            <Link
              href="/loginadmin"
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold text-center block transition shadow-md shadow-indigo-600/20"
            >
              Masuk Sebagai Admin
            </Link>
          </div>

          {/* Card Super Admin */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Super Admin</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Persetujuan (ACC) pendaftaran guru dengan notifikasi email otomatis, kelola akun pengajar, dan kendali penuh seluruh modul.
              </p>
            </div>
            <Link
              href="/loginadmin"
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold text-center block transition shadow-md shadow-rose-600/20"
            >
              Masuk Super Admin
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 px-6 py-6 text-center text-xs text-slate-600">
        &copy; {new Date().getFullYear()} Sekolah Dasar Kedung Jaya 02 &bull; Hak Cipta Dilindungi
      </footer>
    </div>
  );
}
