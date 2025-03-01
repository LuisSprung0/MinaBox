<script>
  import { logIn } from "$lib/firebase";
  import { goto } from "$app/navigation";
  
  let email = "";
  let password = "";
  let errorMessage = "";
  let loading = false;

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

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
  <div class="w-full max-w-md space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">Log in to MinaBox</h1>
      <p class="mt-2 text-sm text-gray-600">Enter your credentials to continue</p>
    </div>
    
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
            class="relative block w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600"
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
            class="relative block w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600"
          />
        </div>
      </div>

      {#if errorMessage}
        <div class="rounded-md bg-red-50 p-4">
          <p class="text-sm text-red-700">{errorMessage}</p>
        </div>
      {/if}

      <div>
        <button
          type="submit"
          class="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70"
          disabled={loading || !email || !password}
        >
          {#if loading}
            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg class="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            Signing in...
          {:else}
            Sign in
          {/if}
        </button>
      </div>
      
      <div class="text-center">
        <p class="mt-2 text-sm text-gray-600">
          Don't have an account? 
          <a href="/signup" class="font-medium text-blue-600 hover:text-blue-500">Sign up</a>
        </p>
      </div>
    </form>
  </div>
</div>