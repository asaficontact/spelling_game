import { redirect } from '@sveltejs/kit';
import { createSupabaseBackendClient } from '$lib/supabase';
import type { LayoutServerLoad } from './$types';


export const load: LayoutServerLoad = async ({ locals, event }) => {
    const supabase = createSupabaseBackendClient(event);
    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
        throw redirect(303, '/');
    }

    return { session };
};
