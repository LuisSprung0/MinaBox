<script lang="js">
	//Images/Icons
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import full_logo_black from '/src/assets/logos/logo_full_black.svg';
	import full_logo_white from '/src/assets/logos/logo_full_white.svg';

	//Components
	import { Button } from '$lib/components/ui/button';

	//Functions
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';

	//State
	let dark_mode = false;
	let transitioning = false;
	let browser = false;

	let mouse = { x: 0, y: 0 };
	let theme_toggle;
	let circle_size = tweened(0, { duration: 700, easing: cubicInOut });

	$: button_rect = theme_toggle?.getBoundingClientRect() || {
		left: 0,
		top: 0,
		width: 0,
		height: 0
	};
	$: logo = dark_mode ? full_logo_white : full_logo_black;
	$: icon1 = dark_mode ? Moon : Sun;
	$: icon2 = dark_mode ? Sun : Moon;
	$: cursor1 = `top: ${mouse.y - $circle_size / 2}px; left: ${mouse.x - $circle_size / 2}px; width: ${$circle_size}px; height: ${$circle_size}px; z-index: ${transitioning ? '5' : '1'};`;

	// Cookie functions
	function setCookie(name, value, days) {
		if (!browser) return;
		let expires = '';
		if (days) {
			const date = new Date();
			date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
			expires = '; expires=' + date.toUTCString();
		}
		document.cookie =
			name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Strict';
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

	onMount(() => {
		browser = true;

		const savedMode = getCookie('dark_mode');
		if (savedMode !== null) {
			dark_mode = savedMode === 'true';
			update_dark_mode(dark_mode, false);
		} else if (window.matchMedia) {
			dark_mode = window.matchMedia('(prefers-color-scheme: dark)').matches;
			update_dark_mode(dark_mode, false);
		}

		window.addEventListener('mousemove', update_mouse_position);
		return () => window.removeEventListener('mousemove', update_mouse_position);
	});

	function update_mouse_position(event) {
		mouse.x = event.clientX;
		mouse.y = event.clientY;
	}

	async function update_dark_mode(mode, animate = true) {
		if (animate && !transitioning) {
			transitioning = true;
			const maxDimension = Math.max(window.innerWidth * 2.5, window.innerHeight * 2.5);

			await circle_size.set(maxDimension);

			set_dark_mode_class(mode);

			circle_size.set(0, { duration: 0 });
			await circle_size.set(0);
			transitioning = false;
		} else {
			set_dark_mode_class(mode);
		}
		setCookie('dark_mode', mode.toString(), 365);
	}

	function set_dark_mode_class(mode) {
		dark_mode = mode;
		document.documentElement.classList.toggle('dark', mode);
	}
</script>

<div
	class="relative flex min-h-screen flex-col items-center justify-center bg-white text-center text-black transition-none dark:bg-black dark:text-white"
>
	<button
		bind:this={theme_toggle}
		id="theme-toggle"
		class="absolute right-5 top-5 text-black transition-transform hover:scale-110 dark:text-white"
		on:click={() => update_dark_mode(!dark_mode)}
		disabled={transitioning}
		aria-label={dark_mode ? 'Switch to light mode' : 'Switch to dark mode'}
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

<!-- Mask for theme icon effect -->
<!-- Creates a white rectangle and black circle matching the custom cursor -->
<svg width="0" height="0"
	><defs
		><mask id="inverse-mask">
			<rect width="100vw" height="100vh" fill="white" />
			<circle
				cx={mouse.x - button_rect.left}
				cy={mouse.y - button_rect.top}
				r={$circle_size / 2}
				fill="black"
			/>
		</mask></defs
	></svg
>

<div
	class="pointer-events-none fixed transform rounded-full backdrop-invert backdrop-filter transition-transform scale-150={transitioning}"
	style={cursor1}
></div>

<style>
	@font-face {
	font-family: 'Darker-Grotesque';
	src: url('/src/assets/fonts/DarkerGrotesque_V.ttf');
	}
	.theme-icon {
		position: absolute;
		top: 0;
		left: 0;
		width: 24px;
		height: 24px;
	}
</style>
