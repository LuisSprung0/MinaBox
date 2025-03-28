<script>
  //Images / Icons
  import full_logo_black from '/src/assets/logos/logo_full_black.svg';
  import full_logo_white from '/src/assets/logos/logo_full_white.svg';

  //Components
  import ThemeToggle from '$lib/components/ui/themes/ThemeToggle.svelte';
  import { Button } from '$lib/components/ui/button';

  //Functions
  import { logIn } from "$lib/firebase";
  import { goto } from "$app/navigation";
  import { getContext } from 'svelte';


  
  let email = "";
  let password = "";
  let errorMessage = "";
  let loading = false;
  $: logo = $darkMode ? full_logo_white : full_logo_black;
  const { darkMode } = getContext('theme');

  async function handleLogin() {
    loading = true;
    errorMessage = "";
    
    try {
      const user = await logIn(email, password);
      if (user) await goto("/profile");
      else errorMessage = "Invalid credentials. Try again.";
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex min-h-screen items-center text-center justify-center bg-white dark:bg-black dark:text-white">

  <ThemeToggle />

  <div class="w-full max-w-md">
    <a href="/"><img src={logo} alt="MiNABOX Logo" class="w-full" draggable="false" /></a>
    <h1 class="text-4xl font-grotesque font-semibold dark:text-white pt-16">Welcome back.</h1>
    
    <form on:submit|preventDefault={handleLogin} class="mt-8 space-y-6">
      <div class="space-y-4 rounded-md shadow-sm">
        <div>
          <label for="email" class="sr-only">Email</label>
          <input 
            id="email"
            type="email" 
            bind:value={email} 
            placeholder="Email" 
            required
            class="relative block w-full rounded-md border-0 p-2 bg-white dark:bg-black text-black dark:text-white ring-1 ring-inset ring-black dark:ring-white focus:z-10 focus:ring-3 focus:ring-inset"
          />
        </div>
        
        <div>
          <label for="password" class="sr-only">Password</label>
          <input 
            id="password"
            type="password" 
            bind:value={password} 
            placeholder="Password" 
            required
            class="relative block w-full rounded-md border-0 p-2 bg-white dark:bg-black text-black dark:text-white ring-1 ring-inset ring-black dark:ring-white focus:z-10 focus:ring-3 focus:ring-inset"
          />
        </div>
      </div>

      {#if errorMessage}
        <div class="rounded-md bg-red-50 p-4">
          <p class="text-sm text-red-700">{errorMessage}</p>
        </div>
      {/if}

      <Button
        type="submit"
        class="w-full bg-black text-white dark:bg-white dark:text-black hover:opacity-80 disabled:opacity-70 transition-none"
        disabled={loading || !email || !password}
      >
        {#if loading}
          Signing in...
        {:else}
          Sign in
        {/if}
      </Button>
      
      <p class="mt-2 text-sm text-black dark:text-white">
        Don't have an account? 
        <a href="/signup" class="font-medium"><b>Sign up</b></a>
      </p>
      
    </form>
  </div>
</div>