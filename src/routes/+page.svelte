<script lang="js">
  //Images / Icons
  import full_logo_black from '/src/assets/logos/logo_full_black.svg';
  import full_logo_white from '/src/assets/logos/logo_full_white.svg';

  //Components
  import ThemeToggle from '$lib/components/ui/themes/ThemeToggle.svelte';
  import { Button } from '$lib/components/ui/button';

	//Functions
  import { getContext } from 'svelte';

  // Get theme context
  const { darkMode } = getContext('theme');

  $: logo = $darkMode ? full_logo_white : full_logo_black;
</script>

<div
  class="relative flex min-h-screen flex-col items-center justify-center bg-white text-center text-black transition-none dark:bg-black dark:text-white"
>
  <ThemeToggle />

  <div class="flex w-full select-none flex-col p-5 text-left">
    <img src={logo} alt="MiNABOX Logo" class="w-3/4" draggable="false" />
    <p class="w-full font-grotesque text-6xl font-medium subpixel-antialiased">
      Productivity, just at <b>your</b> pace.
    </p>
  </div>

  <div class="mb-12 mt-auto flex gap-4">
    <Button
      size="lg"
      class="bg-black text-white transition-none hover:opacity-80 dark:bg-white dark:text-black"
      href="/signup"
    >
      Sign Up
    </Button>
    <Button
      size="lg"
      class="bg-black text-white transition-none hover:opacity-80 dark:bg-white dark:text-black"
      href="/login"
    >
      Login
    </Button>
  </div>
</div>

<style>
  @font-face {
    font-family: 'Darker-Grotesque';
    src: url('/src/assets/fonts/DarkerGrotesque_V.ttf');
  }
</style>
