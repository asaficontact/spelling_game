<!-- src/routes/+page.svelte
<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { goto } from '$app/navigation';
	import { createSupabaseFrontendClient } from '$lib/supabase';

	let username = '';
	let password = '';
	let error = '';
	const supabase = createSupabaseFrontendClient();

	const submitHandler: SubmitFunction = async ({ action, formData }) => {
        const actionType = formData.get('action') as string;

        let response;
        if (actionType === 'login') {
            response = await supabase.auth.signInWithPassword({
                email: `${username}@example.com`,
                password
            });
        } else {
            response = await supabase.auth.signUp({
                email: `${username}@example.com`,
                password,
                options: {
                    data: { username }
                }
            });

            if (response.data.user) {
                await supabase.from('users').insert({ username, password });
            }
        }

        if (response.error) {
            error = response.error.message;
        } else {
            goto('/game');
        }
    };
</script>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content flex-col lg:flex-row-reverse">
		<div class="text-center lg:text-left">
			<h1 class="text-5xl font-bold">Login or Register</h1>
			<p class="py-6">Welcome to the Spelling Game! Please login or register to start playing.</p>
		</div>
		<div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
			<form method="POST" use:enhance={submitHandler} class="card-body">
				<div class="form-control">
					<label for="username" class="label">
						<span class="label-text">Username</span>
					</label>
					<input
						type="text"
						id="username"
						name="username"
						bind:value={username}
						required
						class="input input-bordered"
					/>
				</div>
				<div class="form-control">
					<label for="password" class="label">
						<span class="label-text">Password</span>
					</label>
					<input
						type="password"
						id="password"
						name="password"
						bind:value={password}
						required
						class="input input-bordered"
					/>
				</div>
				<div class="form-control mt-6">
					<button type="submit" name="action" value="login" class="btn btn-primary">Login</button>
				</div>
				<div class="form-control mt-2">
					<button type="submit" name="action" value="register" class="btn btn-secondary"
						>Register</button
					>
				</div>
				{#if error}
					<div class="alert alert-error mt-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="stroke-current shrink-0 h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
							/></svg
						>
						<span>{error}</span>
					</div>
				{/if}
			</form>
		</div>
	</div>
</div> -->
