<script>
  import { onMount } from 'svelte';
  import { user, loading, signOut } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  onMount(() => {
    const unsubscribe = user.subscribe(userData => {
      if ($loading === false && !userData) {
        goto('/');
      }
    });
    
    return unsubscribe;
  });
</script>

<div class="profile-container">
  {#if $loading}
    <p>Loading...</p>
  {:else if $user}
    <h1>Profile Page</h1>
    <div class="user-info text-black">
      <h2>User Info</h2>
      <p><strong>Email:</strong> {$user.email}</p>
      <p><strong>User ID:</strong> {$user.uid}</p>
      <p><strong>Email Verified:</strong> {$user.emailVerified ? 'Yes' : 'No'}</p>
    </div>
    <button on:click={() => {
      signOut();
      goto('/login');
    }}>
      Sign Out
    </button>
  {/if}
</div>

<style>
  .profile-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  .user-info {
    background-color: #f5f5f5;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1.5rem 0;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  button {
    background-color: #e53e3e;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 1rem;
  }

  button:hover {
    background-color: #c53030;
  }
</style>