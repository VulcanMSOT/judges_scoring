import { NextResponse } from 'next/server';
import { loginUser, getSessionCookieOptions } from '@/lib/auth';

export async function POST(request) {
  try {
    const { identifier, secret } = await request.json();
    const result = await loginUser(identifier, secret);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const response = NextResponse.json({
      ok: true,
      user: result.user,
    });

    const cookieOptions = getSessionCookieOptions();
    response.cookies.set(cookieOptions.name, result.token, cookieOptions);

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 500 });
  }
}

