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
  Zap,
  ChevronRight
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
    if (role === 'pengajar') {
      router.push('/pengajar/login');
    } else {
      router.push('/loginadmin');
    }
  };

  const roleConfig = {
    superadmin: {
      label: 'Super Admin',
      icon: ShieldCheck,
      accent: 'from-rose-500 to-pink-600',
      accentSoft: 'bg-rose-500/10 text-rose-400',
      activeBg: 'from-rose-500 to-pink-600',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      dot: 'bg-rose-400',
    },
    admin: {
      label: 'Admin',
      icon: UserCheck,
      accent: 'from-indigo-500 to-blue-600',
      accentSoft: 'bg-indigo-500/10 text-indigo-400',
      activeBg: 'from-indigo-500 to-blue-600',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      dot: 'bg-indigo-400',
    },
    pengajar: {
      label: 'Pengajar',
      icon: GraduationCap,
      accent: 'from-emerald-500 to-teal-600',
      accentSoft: 'bg-emerald-500/10 text-emerald-400',
      activeBg: 'from-emerald-500 to-teal-600',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
  };

  const cfg = roleConfig[role];
  const RoleIcon = cfg.icon;

  const superAdminMenus = [
    { label: 'Dashboard & Log', href: '/superadmin', icon: LayoutDashboard },
    { label: 'Manajemen Pengajar', href: '/superadmin/pengajar', icon: Users },
    { label: 'Pengajuan Modul', href: '/superadmin/pengajuan', icon: ClipboardCheck },
    { label: 'Semua Modul Soal', href: '/superadmin/modul', icon: BookOpen },
    { label: 'Hasil Nilai Siswa', href: '/superadmin/hasil', icon: BarChart3 },
  ];

  const adminMenus = [
    { label: 'Dashboard & Log', href: '/admin', icon: LayoutDashboard },
    { label: 'Data Pengajar', href: '/admin/pengajar', icon: Users },
    { label: 'Hasil Ujian Siswa', href: '/admin/hasil', icon: BarChart3 },
  ];

  const pengajarMenus = [
    { label: 'Beranda', href: '/pengajar', icon: LayoutDashboard },
    { label: 'Modul & Input Soal', href: '/pengajar/modul', icon: BookOpen },
    { label: 'Hasil & Statistik Nilai', href: '/pengajar/hasil', icon: BarChart3 },
  ];

  const menus = role === 'superadmin' ? superAdminMenus : role === 'admin' ? adminMenus : pengajarMenus;

  const getInitials = (name?: string) => {
    if (!name) return role === 'superadmin' ? 'SA' : 'AD';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="w-64 bg-slate-900 flex flex-col h-screen sticky top-0 shadow-xl shadow-black/20">
      {/* Top gradient line */}
      <div className={`h-0.5 w-full bg-gradient-to-r ${cfg.accent}`} />

      {/* Brand */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cfg.accent} flex items-center justify-center shadow-lg`}>
            <Zap className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
          </div>
          <div>
            <h2 className="font-black text-white text-sm leading-tight">SDN Kedung Jaya 02</h2>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Portal Manajemen TKA</p>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-5 py-3 border-b border-slate-800">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${cfg.badge}`}>
          <RoleIcon className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold uppercase tracking-wider">{cfg.label}</span>
          <div className={`ml-auto w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-3">Menu Utama</p>
        {menus.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 relative ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {isActive && (
                <span className={`absolute inset-0 rounded-xl bg-gradient-to-r ${cfg.activeBg} opacity-90`} />
              )}
              <Icon className={`w-4 h-4 relative z-10 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
              <span className="relative z-10 text-[13px]">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto relative z-10 text-white/60" />}
            </Link>
          );
        })}
      </nav>

      {/* User Profile + Logout */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-800/70 border border-slate-700/50">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cfg.accent} flex items-center justify-center text-white font-black text-xs shrink-0`}>
            {getInitials(userName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">{userName || cfg.label}</p>
            <p className="text-[10px] text-slate-500 truncate">{userEmail || `${role}@tka.com`}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Keluar"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
