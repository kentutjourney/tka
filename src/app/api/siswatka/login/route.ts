import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { nisn, password, nama_peserta, tempat_lahir, tanggal_lahir } = await request.json();

    if (!nisn || !password || !nama_peserta || !tempat_lahir || !tanggal_lahir) {
      return NextResponse.json(
        { success: false, message: 'Semua field (NISN, Password, Nama, Tempat, Tanggal Lahir) wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanNisn = nisn.trim();
    const cleanPassword = password.trim();
    const cleanNama = nama_peserta.trim().toUpperCase();
    const cleanTempat = tempat_lahir.trim().toUpperCase();

    // 1. Cari siswa berdasarkan NISN
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

    // 2. Verifikasi Password
    if (student.password !== cleanPassword) {
      return NextResponse.json(
        { success: false, message: 'Password salah. Periksa kembali password Anda.' },
        { status: 401 }
      );
    }

    // 3. Cek apakah ini login pertama (tempat_lahir / tanggal_lahir masih kosong)
    const isFirstLogin = !student.tempat_lahir || !student.tanggal_lahir;

    if (isFirstLogin) {
      // --- LOGIN PERTAMA KALI ---
      // Simpan data yang diinput ke database
      const { data: updatedStudent, error: updateError } = await supabase
        .from('students')
        .update({
          nama_lengkap: cleanNama,
          tempat_lahir: cleanTempat,
          tanggal_lahir: tanggal_lahir
        })
        .eq('id', student.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { success: false, message: 'Gagal menyimpan data siswa.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        student: {
          id: updatedStudent.id,
          nisn: updatedStudent.nisn,
          nama_lengkap: updatedStudent.nama_lengkap,
          kelas: updatedStudent.kelas,
        },
      });

    } else {
      // --- LOGIN KEDUA KALINYA DAN SETERUSNYA ---
      // Cocokkan data input dengan data di database
      
      const dbNama = student.nama_lengkap?.toUpperCase() || '';
      const dbTempat = student.tempat_lahir?.toUpperCase() || '';
      const dbTanggal = student.tanggal_lahir; // Format YYYY-MM-DD

      if (dbNama !== cleanNama || dbTempat !== cleanTempat || dbTanggal !== tanggal_lahir) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Nama, Tempat, atau Tanggal Lahir tidak cocok dengan data yang Anda simpan saat pertama kali login!' 
          },
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
    }

  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
