import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";
import type { RequestEvent } from '@sveltejs/kit';

export function createSupabaseFrontendClient() {
  return createBrowserClient(
    PUBLIC_SUPABASE_URL, 
    PUBLIC_SUPABASE_ANON_KEY
);
}

export function createSupabaseBackendClient(event: RequestEvent) {
  return createServerClient(
    PUBLIC_SUPABASE_URL, 
    PUBLIC_SUPABASE_ANON_KEY,
    {
        cookies: {
            get(name){
                return event.cookies.get(name);  // maybe add ?.valueOf() here
            }, 
            set(name, value, options){
                event.cookies.set(name, value, { path: '/', ...options });
            }, 
            remove(name, options){
                event.cookies.delete(name, { path: '/', ...options });
            }
        }
    },
);
}