<script lang="js">
  //Icons
  import Sun from 'lucide-svelte/icons/sun';
  import Moon from 'lucide-svelte/icons/moon';

  //Functions
  import { getContext, onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';

  // Props
  export let position = "absolute right-5 top-5"; // Default position, can be overridden

  // Get theme context
  const { darkMode, toggleTheme } = getContext('theme');

  // Animation state
  let transitioning = false;
  let mouse = { x: 0, y: 0 };
  let theme_toggle;
  let circle_size = tweened(0, { duration: 700, easing: cubicInOut });

  // Computed values
  $: button_rect = theme_toggle?.getBoundingClientRect() || {
    left: 0,
    top: 0,
    width: 0,
    height: 0
  };
  $: icon1 = $darkMode ? Moon : Sun;
  $: icon2 = $darkMode ? Sun : Moon;
  $: cursor1 = `top: ${mouse.y - $circle_size / 2}px; left: ${mouse.x - $circle_size / 2}px; width: ${$circle_size}px; height: ${$circle_size}px; z-index: ${transitioning ? '5' : '1'};`;

  onMount(() => {
    window.addEventListener('mousemove', update_mouse_position);
    return () => window.removeEventListener('mousemove', update_mouse_position);
  });

  function update_mouse_position(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  }

  async function handleToggle() {
    if (transitioning) return;
    
    transitioning = true;
    const maxDimension = Math.max(window.innerWidth * 2.5, window.innerHeight * 2.5);

    await circle_size.set(maxDimension);
    toggleTheme();

    circle_size.set(0, { duration: 0 });
    await circle_size.set(0);
    transitioning = false;
  }
</script>

<!-- Theme toggle button -->
<button
  bind:this={theme_toggle}
  id="theme-toggle"
  class="{position} text-black transition-transform hover:scale-110 dark:text-white"
  on:click={handleToggle}
  disabled={transitioning}
  aria-label={$darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
>
  <div class="relative flex h-6 w-6 items-center justify-center overflow-visible">
    <div class="theme-icon" style="mask: url(#inverse-mask)">
      <svelte:component this={icon1} />
    </div>

    <div
      class="theme-icon"
      style="clip-path: circle({$circle_size / 2}px at {mouse.x - button_rect.left}px {mouse.y -
        button_rect.top}px);"
    >
      <svelte:component this={icon2} />
    </div>
  </div>
</button>

<!-- Mask for theme icon effect -->
<svg width="0" height="0">
  <defs>
    <mask id="inverse-mask">
      <rect width="100vw" height="100vh" fill="white" />
      <circle
        cx={mouse.x - button_rect.left}
        cy={mouse.y - button_rect.top}
        r={$circle_size / 2}
        fill="black"
      />
    </mask>
  </defs>
</svg>

<!-- Circle transition effect -->
<div
  class="pointer-events-none fixed transform rounded-full backdrop-invert backdrop-filter transition-transform scale-150={transitioning}"
  style={cursor1}
></div>


<style>
  .theme-icon {
    position: absolute;
    top: 0;
    left: 0;
    width: 24px;
    height: 24px;
  }
</style>