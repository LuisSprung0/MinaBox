<script lang="js">
  //Functions
  import { setContext, onMount } from 'svelte';
  import { writable } from 'svelte/store';

  // Create a writable store for the theme state
  const darkMode = writable(false);
  const THEME_KEY = 'theme';
  let browser = false;

  // Initialize the theme based on cookies or system preference
  onMount(() => {
    browser = true;
    
    const savedMode = getCookie('dark_mode');
    if (savedMode !== null) {
      darkMode.set(savedMode === 'true');
    } else if (window.matchMedia) {
      darkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    // Subscribe to changes and update the document class and cookie
    const unsubscribe = darkMode.subscribe(value => {
      set_dark_mode_class(value);
      setCookie('dark_mode', value.toString(), 365);
    });

    return unsubscribe;
  });

  // Cookie functions
  function setCookie(name, value, days) {
    if (!browser) return;
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Strict';
  }

  function getCookie(name) {
    if (!browser) return null;
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
  }
  
  function set_dark_mode_class(mode) {
    if (browser) {
      document.documentElement.classList.toggle('dark', mode);
    }
  }

  // Set the theme context
  setContext(THEME_KEY, {
    darkMode,
    toggleTheme: () => darkMode.update(value => !value)
  });
</script>

<slot />