'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  BarChart3, 
  FileText, 
  LogOut, 
  ShieldCheck, 
  UserCheck, 
  GraduationCap,
  ClipboardCheck
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

  const getRoleBadge = () => {
    switch (role) {
      case 'superadmin':
        return {
          title: 'Super Admin',
          icon: <ShieldCheck className="w-5 h-5 text-red-500" />,
          badgeClass: 'bg-red-50 text-red-600 border-red-200',
          gradient: 'from-rose-600 to-red-600',
        };
      case 'admin':
        return {
          title: 'Admin',
          icon: <UserCheck className="w-5 h-5 text-indigo-500" />,
          badgeClass: 'bg-indigo-50 text-indigo-600 border-indigo-200',
          gradient: 'from-indigo-600 to-blue-600',
        };
      case 'pengajar':
        return {
          title: 'Pengajar',
          icon: <GraduationCap className="w-5 h-5 text-emerald-500" />,
          badgeClass: 'bg-emerald-50 text-emerald-600 border-emerald-200',
          gradient: 'from-emerald-600 to-teal-600',
        };
    }
  };

  const roleInfo = getRoleBadge();

  const superAdminMenus = [
    { label: 'Dashboard & Log', href: '/superadmin', icon: LayoutDashboard },
    { label: 'Manajemen Pengajar', href: '/superadmin/pengajar', icon: Users },
    { label: 'Pengajuan Modul', href: '/superadmin/pengajuan', icon: ClipboardCheck },
    { label: 'Semua Modul Soal', href: '/superadmin/modul', icon: BookOpen },
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

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shadow-sm">
      {/* Brand & Logo */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${roleInfo.gradient} flex items-center justify-center text-white font-black text-xs shadow-md shadow-slate-200 text-center leading-none`}>
          SDN 02
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-sm leading-tight tracking-tight">SDN Kedung Jaya 02</h2>
          <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 mt-1 rounded-full font-medium border ${roleInfo.badgeClass}`}>
            {roleInfo.icon}
            {roleInfo.title}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Menu Utama
        </p>
        {menus.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? `bg-gradient-to-r ${roleInfo.gradient} text-white shadow-md shadow-slate-200`
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User Info & Logout Button */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70 m-4 rounded-2xl">
        <div className="flex items-center justify-between gap-2">
          <div className="truncate">
            <p className="text-sm font-bold text-slate-800 truncate">
              {userName || (role === 'superadmin' ? 'Ziqi (Super)' : role === 'admin' ? 'Ilham (Admin)' : 'Pengajar')}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {userEmail || `${role}@tka-sd.com`}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Keluar / Logout"
            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
