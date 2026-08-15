import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Email/Username dan Password wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();

    // Cari berdasarkan username (case-insensitive)
    const { data: byUsername } = await supabase
      .from('pengajar_profiles')
      .select('*')
      .ilike('username', cleanIdentifier)
      .maybeSingle();

    let userProfile = byUsername;

    // Jika tidak ketemu berdasarkan username, cari berdasarkan email (case-insensitive)
    if (!userProfile) {
      const { data: byEmail } = await supabase
        .from('pengajar_profiles')
        .select('*')
        .ilike('email', cleanIdentifier)
        .maybeSingle();
      userProfile = byEmail;
    }

    if (!userProfile) {
      return NextResponse.json(
        { success: false, message: `Akun "${cleanIdentifier}" tidak ditemukan. Periksa kembali username atau email Anda.` },
        { status: 200 }
      );
    }

    // Verifikasi password
    if (userProfile.password && userProfile.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Password yang Anda masukkan salah.' },
        { status: 200 }
      );
    }

    // Cek status persetujuan akun
    if (userProfile.status === 'pending') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Akun Anda masih dalam antrean persetujuan (PENDING) oleh Super Admin. Buka menu Manajemen Pengajar di Super Admin untuk menyetujui akun ini.' 
        },
        { status: 200 }
      );
    }

    if (userProfile.status === 'rejected') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Mohon maaf, pendaftaran akun pengajar Anda telah ditolak oleh Super Admin.' 
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userProfile.id,
        username: userProfile.username,
        email: userProfile.email,
        role: 'pengajar',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
