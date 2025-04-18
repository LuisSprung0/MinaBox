<script>
  //Images / Icons
  import full_logo_black from '/src/assets/logos/logo_full_black.svg';
  import full_logo_white from '/src/assets/logos/logo_full_white.svg';

  //Components
  import ThemeToggle from '$lib/components/ui/themes/ThemeToggle.svelte';
  import { Button } from '$lib/components/ui/button';

  //Functions
  import { signUp } from "$lib/firebase";
  import { goto } from "$app/navigation";
  import { getContext } from 'svelte';
  
  let email = "";
  let password = "";
  let errorMessage = "";
  let successMessage = "";
  let loading = false;
  const { darkMode } = getContext('theme');

  $: logo = $darkMode ? full_logo_white : full_logo_black;
  $: isValidPassword = password.length >= 6;
  $: formValid = email && isValidPassword;

  async function handleSignUp() {
    loading = true;
    errorMessage = "";
    successMessage = "";
    
    try {
      const user = await signUp(email, password);
      if (user) await goto("/profile");
      
      errorMessage = "Failed to create account. Ensure you are using a UF email address.";
    } catch (error) {
      errorMessage = error.message || "An error occurred during signup.";
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex min-h-screen items-center text-center justify-center bg-white dark:bg-black dark:text-white">

  <ThemeToggle />

  <div class="w-full max-w-md">
    <a href="/"><img src={logo} alt="MiNABOX Logo" class="w-full" draggable="false" /></a>
    <h1 class="text-4xl font-grotesque font-semibold dark:text-white pt-16">Create your account.</h1>
      <form on:submit|preventDefault={handleSignUp} class="mt-8 space-y-6">
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

        {#if !isValidPassword && password}
          <p class="text-xs text-amber-600">Password must be at least 6 characters</p>
        {/if}

        {#if errorMessage}
          <div class="rounded-md bg-red-50 p-4">
            <p class="text-sm text-red-700">{errorMessage}</p>
          </div>
        {/if}

        {#if successMessage}
          <div class="rounded-md bg-green-50 p-4">
            <p class="text-sm text-green-700">{successMessage}</p>
          </div>
        {/if}

      <Button
        type="submit"
        class="w-full bg-black text-white dark:bg-white dark:text-black hover:opacity-80 disabled:opacity-70 transition-none"
        disabled={loading || !email || !password}
      >
        {#if loading}
          Signing up...
        {:else}
          Sign up
        {/if}
      </Button>
        
      <p class="mt-2 text-sm text-black dark:text-white">
        Don't have an account? 
        <a href="/login" class="font-medium"><b>Sign in</b></a>
      </p>

      </form>
  </div>
</div>