import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { 
      module_id, 
      tipe_input, 
      pertanyaan, 
      gambar_url, 
      opsi_a, 
      opsi_b, 
      opsi_c, 
      opsi_d, 
      opsi_e,
      jawaban_benar, 
      durasi_detik,
      username,
      nama_modul 
    } = await request.json();

    if (!module_id || !pertanyaan || !opsi_a || !opsi_b) {
      return NextResponse.json({ success: false, message: 'Data soal belum lengkap. Pertanyaan, Opsi A, dan Opsi B wajib diisi.' }, { status: 400 });
    }

    const insertData: any = {
      module_id,
      tipe_input: tipe_input || 'text',
      pertanyaan,
      gambar_url: tipe_input === 'image' ? gambar_url : null,
      opsi_a,
      opsi_b,
      opsi_c: opsi_c || null,
      opsi_d: opsi_d || null,
      jawaban_benar,
      durasi_detik: Number(durasi_detik) || 60,
    };

    // Tambahkan opsi_e hanya jika ada nilainya (kolom opsional)
    if (opsi_e) insertData.opsi_e = opsi_e;

    const { data: newQ, error } = await supabase
      .from('questions')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    // Catat log
    await supabase.from('activity_logs').insert([
      {
        user_id: null,
        action: 'Input Soal',
        details: `Pengajar @${username || 'user'} menambahkan soal baru pada modul "${nama_modul || 'Modul'}".`,
      },
    ]);

    return NextResponse.json({ success: true, data: newQ });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { 
      id, 
      tipe_input, 
      pertanyaan, 
      gambar_url, 
      opsi_a, 
      opsi_b, 
      opsi_c, 
      opsi_d,
      opsi_e,
      jawaban_benar, 
      durasi_detik,
      username,
      nama_modul 
    } = await request.json();

    const updateData: any = {
      tipe_input: tipe_input || 'text',
      pertanyaan,
      gambar_url: tipe_input === 'image' ? gambar_url : null,
      opsi_a,
      opsi_b,
      opsi_c: opsi_c || null,
      opsi_d: opsi_d || null,
      jawaban_benar,
      durasi_detik: Number(durasi_detik) || 60,
    };

    // Tambahkan opsi_e hanya jika ada nilainya
    if (opsi_e !== undefined) updateData.opsi_e = opsi_e || null;

    const { data, error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('activity_logs').insert([
      {
        user_id: null,
        action: 'Edit Soal',
        details: `Pengajar @${username || 'user'} memperbarui soal pada modul "${nama_modul || 'Modul'}".`,
      },
    ]);

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const username = searchParams.get('username');
    const namaModul = searchParams.get('nama_modul');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID soal diperlukan.' }, { status: 400 });
    }

    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) throw error;

    await supabase.from('activity_logs').insert([
      {
        user_id: null,
        action: 'Hapus Soal',
        details: `Pengajar @${username || 'user'} menghapus soal pada modul "${namaModul || 'Modul'}".`,
      },
    ]);

    return NextResponse.json({ success: true, message: 'Soal berhasil dihapus.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
