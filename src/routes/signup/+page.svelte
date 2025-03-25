<script>
  import { signUp } from "$lib/firebase";
  import { goto } from "$app/navigation";
  
  let email = "";
  let password = "";
  let errorMessage = "";
  let successMessage = "";
  let loading = false;
  let verificationSent = false;

  $: isValidPassword = password.length >= 6;
  $: formValid = email && isValidPassword;

  async function handleSignUp() {
    loading = true;
    errorMessage = "";
    successMessage = "";
    
    try {
      const user = await signUp(email, password);
      if (user) {
        verificationSent = true;
        successMessage = "Account created! Please check your email to verify your account before logging in.";
      } else {
        errorMessage = "Failed to create account. Email may be in use.";
      }
    } catch (error) {
      errorMessage = error.message || "An error occurred during signup.";
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
  <div class="w-full max-w-md space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">Create your account</h1>
      <p class="mt-2 text-sm text-gray-600">Join MinaBox to get started</p>
    </div>
    
    {#if verificationSent}
      <div class="rounded-md bg-blue-50 p-4 text-center">
        <h2 class="text-lg font-medium text-blue-800">Verify your email</h2>
        <p class="mt-2 text-sm text-blue-700">
          We've sent a verification email to <strong>{email}</strong>. 
          Please check your inbox and click the link to verify your account.
        </p>
        <div class="mt-4">
          <a href="/login" class="font-medium text-blue-600 hover:text-blue-500">
            Go to login page
          </a>
        </div>
      </div>
    {:else}
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
              class="relative block w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600"
            />
          </div>
          
          <div>
            <label for="password" class="sr-only">Password</label>
            <input 
              id="password"
              type="password" 
              bind:value={password} 
              placeholder="Password (min 6 characters)" 
              required
              class="relative block w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600"
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

        <div>
          <button
            type="submit"
            class="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70"
            disabled={loading || !formValid}
          >
            {#if loading}
              <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                <!-- ... loading spinner ... -->
              </span>
              Creating account...
            {:else}
              Create account
            {/if}
          </button>
        </div>
        
        <div class="text-center">
          <p class="mt-2 text-sm text-gray-600">
            Already have an account? 
            <a href="/login" class="font-medium text-blue-600 hover:text-blue-500">Sign in</a>
          </p>
        </div>
      </form>
    {/if}
  </div>
</div>