import { z } from "zod";
import { setError, superValidate } from "sveltekit-superforms/server";
import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { AuthApiError } from "@supabase/supabase-js";
import { zod } from 'sveltekit-superforms/adapters';

const loginUserSchema = z.object({
    user_name: z.string().min(1, "Please enter a valid username"),
    password: z.string().min(1, "Please enter a password"),
});

export const load: PageServerLoad = async (event) => {
    return {
        form: await superValidate(event, zod(loginUserSchema)),
    };
};

export const actions: Actions = {
    default: async (event) => {
        const form = await superValidate(event, zod(loginUserSchema));
        //console.log('form -----', form);

        if (!form.valid) {
            return fail(400, {
                form,
            });
        }

        const { error: authError } = await event.locals.supabase.auth.signInWithPassword({
            email: form.data.user_name + "@example.com",
            password: form.data.password,
        });

        // console.log('error -----', authError);
        // console.log('form -----', form);
        // console.log('form.data -----', form.data);


        if (authError) {
            if (authError instanceof AuthApiError && authError.status === 400) {
                setError(form, "user_name", "Invalid credentials");
                setError(form, "password", "Invalid credentials");
                return fail(400, {
                    form,
                });
            }
        }

        throw redirect(302, "/");
    },
};