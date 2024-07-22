// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { SupabaseClient } from '@supabase/supabase-js';
declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
		}
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
