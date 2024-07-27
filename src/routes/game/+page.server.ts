import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (async (event) => {
    const session = event.locals.session;
    if (!session) {
        throw redirect(303, '/login');
    }
    return {
        session
    };
}) satisfies PageServerLoad;