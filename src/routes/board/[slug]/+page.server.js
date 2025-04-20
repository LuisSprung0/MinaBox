import { goto } from "$app/navigation";

export function load({ params, locals }) {
  if (!locals.user) {
    goto("/login");
  }

  return {
    board_id: params.slug,
    user_id: locals.user.uid
  };
};