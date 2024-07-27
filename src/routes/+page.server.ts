import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
    const session = event.locals.session

    if (!session) {
        // User is not signed in, redirect to login page
        throw redirect(303, '/login');
    } else {
        // User is signed in, redirect to game page
        throw redirect(303, '/game');
    }
};