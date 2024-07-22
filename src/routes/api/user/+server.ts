import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { safeGetSession } }) => {
    const { session } = await safeGetSession();

    if (session) {
        return json({ user: session.user });
    } else {
        return json({ user: null });
    }
};