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

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Cari berdasarkan username ATAU email
    const { data: userProfile, error } = await supabase
      .from('pengajar_profiles')
      .select('*')
      .or(`email.eq.${cleanIdentifier},username.eq.${cleanIdentifier}`)
      .maybeSingle();

    if (error || !userProfile) {
      return NextResponse.json(
        { success: false, message: 'Akun pengajar tidak ditemukan. Periksa username/email Anda.' },
        { status: 404 }
      );
    }

    // Verifikasi password
    if (userProfile.password && userProfile.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Password yang Anda masukkan salah.' },
        { status: 401 }
      );
    }

    // Cek status persetujuan akun
    if (userProfile.status === 'pending') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Akun Anda masih dalam antrean persetujuan (PENDING) oleh Super Admin. Mohon tunggu verifikasi.' 
        },
        { status: 403 }
      );
    }

    if (userProfile.status === 'rejected') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Mohon maaf, pendaftaran akun pengajar Anda telah ditolak oleh Super Admin.' 
        },
        { status: 403 }
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
