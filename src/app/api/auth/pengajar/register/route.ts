import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Semua field wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');
    const cleanEmail = email.trim().toLowerCase();

    // 1. Cek apakah username sudah dipakai
    const { data: existingUser } = await supabase
      .from('pengajar_profiles')
      .select('id')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Username ini sudah digunakan oleh pengajar lain.' },
        { status: 400 }
      );
    }

    // 2. Cek apakah email sudah dipakai
    const { data: existingEmail } = await supabase
      .from('pengajar_profiles')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: 'Email ini sudah terdaftar.' },
        { status: 400 }
      );
    }

    // 3. Masukkan ke tabel pengajar_profiles dengan status 'pending'
    const newId = crypto.randomUUID();
    const { data: newPengajar, error: insertError } = await supabase
      .from('pengajar_profiles')
      .insert([
        {
          id: newId,
          email: cleanEmail,
          username: cleanUsername,
          password: password, // Menyimpan password untuk autentikasi langsung
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (insertError) {
      // Jika kolom password belum ada, coba tanpa kolom password atau lempar error
      return NextResponse.json(
        { success: false, message: insertError.message },
        { status: 500 }
      );
    }

    // 4. Catat ke activity logs
    await supabase.from('activity_logs').insert([
      {
        user_id: newId,
        action: 'Pendaftaran Pengajar Baru',
        details: `Pengajar @${cleanUsername} (${cleanEmail}) mendaftar dan menunggu approval Super Admin.`,
      },
    ]);

    return NextResponse.json({
      success: true,
      message: 'Pendaftaran berhasil! Akun Anda sedang menunggu persetujuan (ACC) dari Super Admin.',
      data: newPengajar,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
