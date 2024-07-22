<script lang="ts">
    import { enhance } from '$app/forms';
  
    let username = '';
    let password = '';
    let error = '';
  </script>
  
  <form method="POST" use:enhance>
    <div class="mb-4">
      <label for="username" class="block mb-2">Username</label>
      <input type="text" id="username" name="username" bind:value={username} required class="w-full p-2 border rounded">
    </div>
    <div class="mb-4">
      <label for="password" class="block mb-2">Password</label>
      <input type="password" id="password" name="password" bind:value={password} required class="w-full p-2 border rounded">
    </div>
    <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Login</button>
  </form>
  {#if error}
    <p class="text-red-500 mt-4">{error}</p>
  {/if}
  <p class="mt-4">Don't have an account? <a href="/register" class="text-blue-500">Register</a></p>