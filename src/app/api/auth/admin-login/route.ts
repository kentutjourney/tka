import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const superUsername = process.env.SUPERADMIN_USERNAME;
    const superPassword = process.env.SUPERADMIN_PASSWORD;
    const superEmail = process.env.SUPERADMIN_EMAIL;

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Check Super Admin
    if (
      username === superUsername &&
      password === superPassword
    ) {
      return NextResponse.json({
        success: true,
        user: {
          username: superUsername,
          email: superEmail,
          role: 'superadmin',
        },
      });
    }

    // Check Admin
    if (
      username === adminUsername &&
      password === adminPassword
    ) {
      return NextResponse.json({
        success: true,
        user: {
          username: adminUsername,
          email: 'admin@tka-sd.com',
          role: 'admin',
        },
      });
    }

    return NextResponse.json(
      { success: false, message: 'Username atau password salah!' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
