export const POST = async ({ cookies }) => {
  cookies.delete('session', { path: '/' });
  return new Response(null, { status: 200 });
};