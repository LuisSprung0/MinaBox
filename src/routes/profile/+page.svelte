<script>
  //Images / Icons
  import full_logo_black from '/src/assets/logos/logo_full_black.svg';
  import full_logo_white from '/src/assets/logos/logo_full_white.svg';
  import { CircleUserRound } from "lucide-svelte";

  //Components
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Skeleton } from '$lib/components/ui/skeleton';
  import * as Card from "$lib/components/ui/card";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as RadioGroup from "$lib/components/ui/radio-group";
  import * as Switch from "$lib/components/ui/switch";

  //Functions
  import { onMount, getContext } from 'svelte';
  import { user, loading, signOut } from '$lib/stores/auth';
  import { goto } from '$app/navigation';


  const { darkMode, toggleTheme } = getContext('theme');
  const boards = [ //temp for concept
    { id: 1, title: 'MiNABOX iDEAS', last: '04-11-25'},
    { id: 2, title: 'Bucket List', last: '03-29-25'},
    { id: 3, title: 'HW Assignments', last: '03-01-25'},
    { id: 4, title: 'Date Ideas', last: '10-04-24'},
  ];

  const color_names = [
  'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green',
  'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet',
  'purple', 'fuchsia', 'pink', 'rose'
  ];
  const shade = '500';
  let colors = color_names.map(color => ({
    value: color,
    bg: `bg-${color}-${shade}`
    }));

  $: name = "Placeholder"
  $: accent = "stone"; //temp for concept
  $: hover_accent = `hover:border-${accent}-${shade}`
  $: logo = $darkMode ? full_logo_white : full_logo_black;

  function openBoard(boardId) {
    goto(`/board/${boardId}`);
  }

  onMount(() => {
    const unsubscribe = user.subscribe(userData => {
      if ($loading === false && !userData) {
        goto('/');
      }
    });
    
    return unsubscribe;
  });
</script>

<div class="max-w-7xl mx-auto p-8">

  <div class="flex justify-between mb-20">
    <img src={logo} alt="MiNABOX Logo" class="w-72" draggable="false" />

    <Dialog.Root>
      <Dialog.Trigger> <!-- button to access the menu -->
        <Button variant="ghost" size="icon"><CircleUserRound /></Button>
      </Dialog.Trigger>

      <Dialog.Content>
        
        <Dialog.Header>
          <Dialog.Title>Preferences</Dialog.Title>
          <Dialog.Description>Make MiNABOX feel like its yours.</Dialog.Description>
        </Dialog.Header>

        <!-- name input -->
        <div class="space-y-2">
          <Label for="name">Name</Label>
          <Input id="name" bind:value={name} placeholder="What should we call you?" />
        </div>

        <!-- accent color selector -->
        <div class="space-y-3">
          <Label>Accent Color</Label>
          <RadioGroup.Root value={accent} onValueChange={(value) => accent = value}>
            <div class="flex flex-wrap gap-4">
              {#each colors as color}
                <RadioGroup.Item 
                value={color.value} 
                class="{color.bg} border-none relative w-6 h-6 rounded-full"
                >
                <div class="absolute inset-[3px] rounded-full border-2 border-white opacity-0 data-[state=checked]:opacity-100 transition-opacity"></div>
                </RadioGroup.Item>
              {/each}
            </div>
          </RadioGroup.Root>
        </div>

        <!-- dark mode toggle -->
        <div class="space-y-3 pt-4">
          <div class="flex items-center justify-between">
            <Label for="dark-mode" class="flex items-center gap-2">Dark Mode</Label>
            <Switch.Root id="dark-mode" checked={$darkMode} onCheckedChange={toggleTheme}/>
          </div>
        </div>

        <!-- sign out button -->
        <div class="flex justify-between pt-4">
          <Button type="button" variant="outline" class="text-red-600 border-2 border-red-600"
            on:click={() => {
              signOut();
              goto('/login');
            }}>
            Sign Out
          </Button>
        </div>

      </Dialog.Content>
    </Dialog.Root>
  </div>

    <div class="flex items-center gap-4">
      <h2 class="text-4xl font-semibold m-0 mb-4">Welcome, {name}.</h2>
    </div>

    <div>
      <!-- create new board card will always be rendered no matter what -->
      <h2 class="text-2xl font-semibold my-4">Your Boards</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
        <Card.Root class="cursor-pointer duration-150 transition-all {hover_accent} border-2 border-dashed">
          <Card.Header>
            <Card.Title>Create New Board</Card.Title>
            <Card.Description>Start organizing a new project</Card.Description>
          </Card.Header>
        </Card.Root>

       {#if $loading}

        <Skeleton />

        {:else if $user} 

        
        {#each boards as board}
        <Card.Root
          class="cursor-pointer duration-150 transition-all {hover_accent} border-2 pb-20" 
          on:click={() => openBoard(board.id)}
        >
          <Card.Header>
            <Card.Title>{board.title}</Card.Title>
            <Card.Description>Last edited: {board.last}</Card.Description>
          </Card.Header>
        </Card.Root>
      {/each}
      {/if}
      </div>
    </div>
</div>


