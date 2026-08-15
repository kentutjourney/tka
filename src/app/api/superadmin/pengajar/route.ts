import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendApprovalEmail } from '@/lib/mail';

export async function PUT(request: Request) {
  try {
    const { id, status, email, username } = await request.json();

    if (!id || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('pengajar_profiles')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    // Jika di-approve, kirim email konfirmasi nyata via Nodemailer
    let emailResult = null;
    if (status === 'approved' && email) {
      emailResult = await sendApprovalEmail(email, username || 'Pengajar');
    }

    return NextResponse.json({
      success: true,
      data,
      emailResult,
      message: status === 'approved' 
        ? `Pengajar @${username} berhasil disetujui & email konfirmasi dikirim ke ${email}!` 
        : `Pendaftaran pengajar @${username} ditolak (tanpa kirim email).`
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID pengajar diperlukan' }, { status: 400 });
    }

    const { error } = await supabase
      .from('pengajar_profiles')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Pengajar berhasil dihapus' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
