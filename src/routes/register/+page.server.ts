import { z } from "zod";
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from "./$types";
import { setError, superValidate } from "sveltekit-superforms/server";
import { fail, redirect } from "@sveltejs/kit";

const registerUserSchema = z.object({
    user_name: z
        .string()
        .min(3, "Please enter a username")
        .max(140, "Username must be 140 characters or less"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(64, "Password must be 64 characters or less"),
    passwordConfirm: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(64, "Password must be 64 characters or less"),
});

export const load: PageServerLoad = async (event) => {
    const session = event.locals.session
    if (session) {
        throw redirect(302, '/');
    }
    const form = await superValidate(event, zod(registerUserSchema));
    return {
        form,
    };
};

export const actions: Actions = {
    default: async (event) => {
        const form = await superValidate(event, zod(registerUserSchema));

        if (!form.valid) {
            return fail(400, {
                form,
            });
        }

        if (form.data.password !== form.data.passwordConfirm) {
            return setError(form, "passwordConfirm", "Passwords do not match");
        }

        const { error: authError } = await event.locals.supabase.auth.signUp({
            email: form.data.user_name + "@example.com",
            password: form.data.password,
            options: {
                data: {
                    user_name: form.data.user_name,
                    password: form.data.password,
                },
            },
        });

        if (authError) {
            return setError(form, "", "An error occurred while registering.");
        }

        return {
            form,
        };
    },
};