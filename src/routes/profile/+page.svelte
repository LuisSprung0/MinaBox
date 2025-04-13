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
  import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
  import { db } from "$lib/firebase";
	import { browser } from '$app/environment';


  const { darkMode, toggleTheme } = getContext('theme');
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

  let boards = [];
  let user_id = null;
  $: name = "";
  $: accent = "stone"; //default while loading user accent
  $: hover_accent = `hover:border-${accent}-${shade}`
  $: logo = $darkMode ? full_logo_white : full_logo_black;


  function formatDate(timestamp) {
    if (!timestamp) return 'Unknown';
    
    return timestamp.toDate().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    }).replace(/\//g, '-');
  }

  async function fetchUserData(user_id) {
    if (!user_id || !browser || !db) {
      goto('/login');
    }
  
    try {
      const user_doc = await getDoc(doc(db, 'users', user_id));
      
      if (user_doc.exists()) {
        const user_data = user_doc.data();
        name = user_data.name;
        accent = user_data.accent;
        const board_ids = user_data.boards || [];
        
        if (board_ids.length > 0)
        {
          await fetchBoardData(board_ids);
        }

      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  async function fetchBoardData(board_ids) {
    try {
      const board_promises = board_ids.map(async (board_id) => {
        const board_doc = await getDoc(doc(db, 'boards', board_id));
        
        if (board_doc.exists()) {
          const board_data = board_doc.data();
          return {
            id: board_id,
            title: board_data.name,
            last: formatDate(board_data.last_modified)
          };
        }
        return null;
      });
      
      // Wait for all board queries to complete
      const b = await Promise.all(board_promises);
      
      // Filter out any null values (boards that don't exist)
      boards = b.filter(board => board !== null);
    } catch (error) {
      console.error("Error fetching board data:", error);
      boards = [];
    }
  }


  async function saveUserPreferences() {
    if (!user_id || !browser || !db) return;
    
    try {
      await updateDoc(doc(db, 'users', user_id), {
        name,
        accent
      });
      console.log("User preferences saved successfully");
    } catch (error) {
      console.error("Error saving user preferences:", error);
    }
  }


  function openBoard(boardId) {
    goto(`/board/${boardId}`);
  }

  onMount(() => {
    if ($loading === false && !$user) {
        goto('/login');
    }

    const unsubscribe = user.subscribe(user_data => {
      if (!user_data) {
        goto('/login');
      }
      
      else if (user_data) {
        user_id = user_data.uid;
        fetchUserData(user_data.uid);
      }
    });
    
    return unsubscribe;
  });
</script>

<div class="max-w-7xl mx-auto p-8">

  <div class="flex justify-between mb-20">
    <img src={logo} alt="MiNABOX Logo" class="w-72" draggable="false" />

    <Dialog.Root onOpenChange={(open) => {
      if (!open) {
        saveUserPreferences();
      }
    }}>
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
  
    <Card.Root class="cursor-pointer duration-150 transition-all {hover_accent} border-2 border-dashed pb-20">
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
      on:click={() => openBoard(board.id)}>
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


