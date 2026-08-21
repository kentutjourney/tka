'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  BarChart3, 
  LogOut, 
  ShieldCheck, 
  UserCheck, 
  GraduationCap,
  ClipboardCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  role: 'superadmin' | 'admin' | 'pengajar';
  userName?: string;
  userEmail?: string;
}

export default function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('tka_user');
    router.push(role === 'pengajar' ? '/pengajar/login' : '/loginadmin');
  };

  const configs = {
    superadmin: {
      menus: [
        { label: 'Dashboard', sub: 'Ringkasan & Log', href: '/superadmin', icon: LayoutDashboard },
        { label: 'Pengajar', sub: 'Kelola & Approval', href: '/superadmin/pengajar', icon: Users },
        { label: 'Pengajuan Modul', sub: 'Tinjau & Setujui', href: '/superadmin/pengajuan', icon: ClipboardCheck },
        { label: 'Semua Modul', sub: 'Bank Soal TKA', href: '/superadmin/modul', icon: BookOpen },
        { label: 'Nilai Siswa', sub: 'Rekap & Ekspor', href: '/superadmin/hasil', icon: BarChart3 },
      ],
      from: 'from-violet-600',
      to: 'to-purple-700',
      roleLabel: 'Super Admin',
      RoleIcon: ShieldCheck,
    },
    admin: {
      menus: [
        { label: 'Dashboard', sub: 'Ringkasan & Log', href: '/admin', icon: LayoutDashboard },
        { label: 'Data Pengajar', sub: 'Kelola Akun', href: '/admin/pengajar', icon: Users },
        { label: 'Hasil Ujian', sub: 'Rekap Nilai', href: '/admin/hasil', icon: BarChart3 },
      ],
      from: 'from-indigo-600',
      to: 'to-blue-700',
      roleLabel: 'Admin',
      RoleIcon: UserCheck,
    },
    pengajar: {
      menus: [
        { label: 'Beranda', sub: 'Ikhtisar', href: '/pengajar', icon: LayoutDashboard },
        { label: 'Modul & Soal', sub: 'Input & Edit', href: '/pengajar/modul', icon: BookOpen },
        { label: 'Statistik Nilai', sub: 'Hasil Siswa', href: '/pengajar/hasil', icon: BarChart3 },
      ],
      from: 'from-emerald-600',
      to: 'to-teal-700',
      roleLabel: 'Pengajar',
      RoleIcon: GraduationCap,
    },
  };

  const cfg = configs[role];
  const { menus, from, to, roleLabel, RoleIcon } = cfg;

  const initials = userName ? userName.slice(0, 2).toUpperCase() : roleLabel.slice(0, 2).toUpperCase();

  return (
    <aside
      style={{ background: 'linear-gradient(165deg, #0f1117 0%, #161b2e 60%, #1a1232 100%)' }}
      className="w-[240px] flex flex-col h-screen sticky top-0 overflow-hidden"
    >
      {/* Top accent line */}
      <div className={`h-[2px] w-full bg-gradient-to-r ${from} ${to} opacity-80`} />

      {/* Brand */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className={`relative w-9 h-9 rounded-xl bg-gradient-to-br ${from} ${to} flex items-center justify-center shadow-lg`}>
            <Sparkles className="w-[18px] h-[18px] text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0f1117]" />
          </div>
          <div>
            <p className="text-white font-black text-sm leading-none tracking-tight">SDN Kedung Jaya 02</p>
            <p className="text-slate-500 text-[10px] font-medium mt-0.5">Portal Admin TKA SD</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-white/5" />

      {/* User card */}
      <div className="px-4 py-3.5">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/8 backdrop-blur-sm">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${from} ${to} flex items-center justify-center text-white font-black text-xs shrink-0 shadow-md`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate">{userName || roleLabel}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <RoleIcon className="w-2.5 h-2.5 text-violet-400 shrink-0" />
              <p className="text-violet-400 text-[9px] font-bold uppercase tracking-wider truncate">{roleLabel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <p className="px-6 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600 mb-2">Navigasi</p>

      {/* Menu items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-4">
        {menus.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-white'
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {/* Active BG */}
              {isActive && (
                <span className={`absolute inset-0 rounded-xl bg-gradient-to-r ${from} ${to} opacity-85 shadow-lg`} />
              )}
              {/* Left accent bar */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-white/50" />
              )}

              <div className={`relative z-10 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
              }`}>
                <Icon className="w-3.5 h-3.5" />
              </div>

              <div className="flex-1 min-w-0 relative z-10">
                <p className="text-[12px] font-bold leading-none">{item.label}</p>
                <p className={`text-[9px] mt-0.5 font-medium leading-none ${isActive ? 'text-white/60' : 'text-slate-600 group-hover:text-slate-400'}`}>{item.sub}</p>
              </div>

              {isActive && <ChevronRight className="w-3 h-3 text-white/40 relative z-10 shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-5 h-px bg-white/5" />

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200 group"
        >
          <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-rose-500/10 flex items-center justify-center transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </div>
          <span className="text-[12px] font-bold">Keluar</span>
        </button>
      </div>
    </aside>
  );
}
