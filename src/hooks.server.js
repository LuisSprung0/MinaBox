import { adminAuth } from '$lib/admin';

export const handle = async ({ event, resolve }) => {
  const session = event.cookies.get('session');
  if (session) {
    try {
      const decoded = await adminAuth.verifySessionCookie(session, true);
      event.locals.user = { uid: decoded.uid, email: decoded.email };
    } catch {
      event.locals.user = null;
      event.cookies.delete('session', { path: '/' });
    }
  } else {
    event.locals.user = null;
  }

  return resolve(event);
};