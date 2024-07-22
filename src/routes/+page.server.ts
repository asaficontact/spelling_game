import { fail, redirect } from '@sveltejs/kit';
import { createSupabaseBackendClient } from '$lib/supabase';
import type { Actions } from './$types';

const supabase = createSupabaseBackendClient(event);

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const action = formData.get('action') as string;

        if (action === 'login') {
            return await loginAction(formData);
        } else if (action === 'register') {
            return await registerAction(formData);
        } else {
            return fail(400, { error: 'Invalid action' });
        }
    },

    login: async ({ request }) => {
        const formData = await request.formData();
        return await loginAction(formData);
    },

    register: async ({ request }) => {
        const formData = await request.formData();
        return await registerAction(formData);
    }
};

async function loginAction(formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: `${username}@example.com`,
        password
    });

    if (error) {
        return fail(400, { error: 'Invalid username or password' });
    }

    throw redirect(303, '/game');
}

async function registerAction(formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const { data: existingUser } = await supabase
        .from('users')
        .select()
        .eq('username', username)
        .single();

    if (existingUser) {
        return fail(400, { error: 'Username already exists' });
    }

    const { data, error } = await supabase.auth.signUp({
        email: `${username}@example.com`,
        password,
        options: {
            data: { username }
        }
    });

    if (error) {
        return fail(400, { error: 'Failed to create account' });
    }

    // Insert the new user into the 'users' table
    const { error: insertError } = await supabase
        .from('users')
        .insert({ username, password });

    if (insertError) {
        return fail(400, { error: 'Failed to create account' });
    }

    throw redirect(303, '/game');
}