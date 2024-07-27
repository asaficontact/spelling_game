<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	onMount(() => {
		// This page should only be visible momentarily, if at all
		goto('/login');
	});
</script>

<div>Checking authentication status...</div>
