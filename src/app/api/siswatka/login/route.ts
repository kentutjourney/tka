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

    // 2. Cek apakah ini login pertama (password / tempat_lahir / tanggal_lahir masih kosong di Supabase)
    const isFirstLogin = !student.password || !student.tempat_lahir || !student.tanggal_lahir;

    if (isFirstLogin) {
      // --- LOGIN PERTAMA KALI ---
      // Simpan password dan data profil yang diinput siswa ke database agar permanen
      const updateData: Record<string, any> = {
        password: cleanPassword,
        tempat_lahir: cleanTempat,
        tanggal_lahir: tanggal_lahir,
      };

      // Jika nama_lengkap di database kosong, isi dengan nama_peserta yang diinput
      if (!student.nama_lengkap) {
        updateData.nama_lengkap = cleanNama;
      }

      const { data: updatedStudent, error: updateError } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', student.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { success: false, message: 'Gagal menyimpan data akun siswa.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Registrasi data awal berhasil.',
        student: {
          id: updatedStudent.id,
          nisn: updatedStudent.nisn,
          nama_lengkap: updatedStudent.nama_lengkap,
          kelas: updatedStudent.kelas,
        },
      });

    } else {
      // --- LOGIN KEDUA KALINYA DAN SETERUSNYA ---
      // 1. Verifikasi Password
      if (student.password !== cleanPassword) {
        return NextResponse.json(
          { success: false, message: 'Password salah. Periksa kembali password Anda.' },
          { status: 401 }
        );
      }

      // 2. Cocokkan data input dengan data di database
      const dbTempat = student.tempat_lahir?.toUpperCase() || '';
      const dbTanggal = student.tanggal_lahir; // Format YYYY-MM-DD

      if (dbTempat !== cleanTempat || dbTanggal !== tanggal_lahir) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Tempat atau Tanggal Lahir tidak cocok dengan data yang Anda daftarkan saat pertama kali login!' 
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
