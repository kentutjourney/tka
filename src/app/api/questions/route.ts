import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      module_id, 
      tipe_input, 
      pertanyaan, 
      gambar_url, 
      opsi_a, 
      opsi_b, 
      opsi_c, 
      opsi_d, 
      jawaban_benar, 
      durasi_detik,
      username,
      nama_modul 
    } = body;

    if (!module_id || !pertanyaan || !opsi_a || !opsi_b) {
      return NextResponse.json(
        { success: false, message: 'Data soal belum lengkap. Pertanyaan, Opsi A, dan Opsi B wajib diisi.' },
        { status: 400 }
      );
    }

    const baseData: any = {
      module_id,
      tipe_input: tipe_input || 'text',
      pertanyaan,
      gambar_url: tipe_input === 'image' ? (gambar_url || null) : null,
      opsi_a: opsi_a || '',
      opsi_b: opsi_b || '',
      opsi_c: opsi_c || null,
      opsi_d: opsi_d || null,
      jawaban_benar: jawaban_benar || 'A',
    };

    // Coba insert dengan durasi_detik terlebih dahulu
    let newQ = null;
    const { data: qWithDur, error: errWithDur } = await supabase
      .from('questions')
      .insert([{ ...baseData, durasi_detik: Number(durasi_detik) || 60 }])
      .select()
      .single();

    if (errWithDur) {
      // Jika kolom durasi_detik belum ada di database, fallback insert tanpa durasi_detik
      const { data: qWithoutDur, error: errWithoutDur } = await supabase
        .from('questions')
        .insert([baseData])
        .select()
        .single();

      if (errWithoutDur) {
        return NextResponse.json({ success: false, message: errWithoutDur.message }, { status: 500 });
      }
      newQ = qWithoutDur;
    } else {
      newQ = qWithDur;
    }

    // Catat log activity
    supabase.from('activity_logs').insert([
      {
        user_id: null,
        action: 'Input Soal',
        details: `Pengajar @${username || 'user'} menambahkan soal baru pada modul "${nama_modul || 'Modul'}".`,
      },
    ]).then(() => {});

    return NextResponse.json({ success: true, data: newQ });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { 
      id, 
      tipe_input, 
      pertanyaan, 
      gambar_url, 
      opsi_a, 
      opsi_b, 
      opsi_c, 
      opsi_d, 
      jawaban_benar, 
      durasi_detik,
      username,
      nama_modul 
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID soal diperlukan.' }, { status: 400 });
    }

    const baseData: any = {
      tipe_input: tipe_input || 'text',
      pertanyaan,
      gambar_url: tipe_input === 'image' ? (gambar_url || null) : null,
      opsi_a: opsi_a || '',
      opsi_b: opsi_b || '',
      opsi_c: opsi_c || null,
      opsi_d: opsi_d || null,
      jawaban_benar: jawaban_benar || 'A',
    };

    let updated = null;
    const { data: uWithDur, error: errWithDur } = await supabase
      .from('questions')
      .update({ ...baseData, durasi_detik: Number(durasi_detik) || 60 })
      .eq('id', id)
      .select()
      .single();

    if (errWithDur) {
      const { data: uWithoutDur, error: errWithoutDur } = await supabase
        .from('questions')
        .update(baseData)
        .eq('id', id)
        .select()
        .single();

      if (errWithoutDur) {
        return NextResponse.json({ success: false, message: errWithoutDur.message }, { status: 500 });
      }
      updated = uWithoutDur;
    } else {
      updated = uWithDur;
    }

    supabase.from('activity_logs').insert([
      {
        user_id: null,
        action: 'Edit Soal',
        details: `Pengajar @${username || 'user'} memperbarui soal pada modul "${nama_modul || 'Modul'}".`,
      },
    ]).then(() => {});

    return NextResponse.json({ success: true, data: updated });
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

    supabase.from('activity_logs').insert([
      {
        user_id: null,
        action: 'Hapus Soal',
        details: `Pengajar @${username || 'user'} menghapus soal pada modul "${namaModul || 'Modul'}".`,
      },
    ]).then(() => {});

    return NextResponse.json({ success: true, message: 'Soal berhasil dihapus.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
