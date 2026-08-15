import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { nisn, nama_lengkap } = await request.json();

    if (!nisn || !nama_lengkap) {
      return NextResponse.json(
        { success: false, message: 'NISN dan Nama Lengkap wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanNisn = nisn.trim();
    const cleanNama = nama_lengkap.trim();

    // Cari siswa berdasarkan NISN (karena NISN unik)
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('nisn', cleanNisn)
      .maybeSingle();

    if (error || !student) {
      return NextResponse.json(
        { success: false, message: 'Data siswa tidak ditemukan. Periksa kembali NISN Anda.' },
        { status: 404 }
      );
    }

    // Verifikasi nama (opsional, bisa dibuat case-insensitive atau parsial)
    if (student.nama_lengkap.toLowerCase() !== cleanNama.toLowerCase()) {
      return NextResponse.json(
        { success: false, message: 'Nama lengkap tidak cocok dengan NISN yang dimasukkan.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        nisn: student.nisn,
        nama_lengkap: student.nama_lengkap,
        kelas: student.kelas,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
