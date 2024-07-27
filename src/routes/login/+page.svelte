<script lang="ts">
	import { Card, Button, Input, Label } from 'flowbite-svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from './$types';
	export let data: PageData;
	const { form, errors, enhance } = superForm(data.form);
</script>

<div class="flex justify-center items-center min-h-screen bg-white">
	<Card class="w-full max-w-md" padding="xl">
		<h2 class="text-2xl font-bold mb-4 dark:text-white">Login to your account</h2>
		<form method="POST" class="flex flex-col space-y-6" use:enhance>
			<Label class="space-y-2">
				<span>Username</span>
				<Input type="text" name="user_name" bind:value={$form.user_name} />
				{#if $errors.user_name}
					<span class="text-sm text-red-500">{$errors.user_name}</span>
				{/if}
			</Label>
			<Label class="space-y-2">
				<span>Password</span>
				<Input type="password" name="password" bind:value={$form.password} />
				{#if $errors.password}
					<span class="text-sm text-red-500">{$errors.password}</span>
				{/if}
			</Label>
			<Button
				type="submit"
				class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded"
				>Login</Button
			>
			<p class="text-sm text-gray-600 text-center">
				Don't have an account? <a href="/register" class="text-blue-600 hover:underline">Sign up</a>
			</p>
		</form>
	</Card>
</div>
