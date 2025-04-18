import { json } from '@sveltejs/kit';
import { adminAuth } from '$lib/admin';

export const POST = async ({ request, cookies }) => {
  const { id_token } = await request.json();
  const expiresIn = (60 * 60 * 24 * 14 * 1000);

  const session = await adminAuth.createSessionCookie(id_token, { expiresIn });

  cookies.set('session', session, {
    httpOnly: true,
    maxAge: expiresIn / 1000,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });

  return json({ status: 'success' });
};
