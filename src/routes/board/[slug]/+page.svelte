<script>
  //Images / Icons
  import { CornerDownLeft, Plus, Pencil } from "lucide-svelte";

  //Components
  import { Button } from "$lib/components/ui/button/";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index";
  import WidgetLoader from "$lib/components/board/WidgetLoader.svelte";

  //Functions
  import { onMount, onDestroy, getContext } from 'svelte';
  import { goto } from "$app/navigation";
  import { widgets } from "$lib/stores/widgets.js";
  import { widgetRegistry } from "$lib/stores/widget_register";
  import { initializeWidgets } from "$lib/widget_init";
  import { db } from "$lib/firebase";
  import { doc, getDoc, updateDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
  import { addWidget, removeWidget, loadBoardWidgets } from '$lib/services/widgetService';

  export let data;
  const board_id = data.board_id;
  const user_id = data.user_id;

  const { darkMode, toggleTheme } = getContext('theme');
  const default_spawn = [100, 100];

  let accent;
  let boardRef;
  let userRef;
  let unsubscribeBoard;
  let unsubscribeUser;
  let boardTitle = "Loading...";
  let isLoading = true;
  
  // New variables for title editing
  let isEditingTitle = false;
  let editedTitle = "";
  
  onMount(async () => {
    initializeWidgets();
    
    boardRef = doc(db, 'boards', board_id);
    userRef = doc(db, 'users', user_id);
    
    try {
      const boardDoc = await getDoc(boardRef);
      
      if (!boardDoc.exists()) {
        console.error("Board not found!");
        return;
      }
      
      const boardData = boardDoc.data();
      boardTitle = boardData.name || "Untitled Board";
      
      await loadBoardWidgets(board_id);
      
      unsubscribeBoard = onSnapshot(boardRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          boardTitle = data.name || "Untitled Board";

          if (data.widgets) {
            const dbWidgets = data.widgets.map(w => ({
              id: w.id,
              typeId: w.typeId,
              x: w.x,
              y: w.y,
              width: w.width || 400,
              height: w.height || 300,
              content: w.content || {},
              settings: w.settings || {},
              metadata: w.metadata || {}
            }));
            
            const currentWidgetsJson = JSON.stringify($widgets);
            const dbWidgetsJson = JSON.stringify(dbWidgets);
            
            if (currentWidgetsJson !== dbWidgetsJson) {
              widgets.set(dbWidgets);
            }
          }
          
          isLoading = false;
        }
      });
      
      // Get user's accent color
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.accentColor) {
          accent = userData.accentColor;
        }
      }
      
      // Set up real-time listening for user changes
      unsubscribeUser = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          if (userData.accent) {
            accent = userData.accent;
          }
        }
      });
      
      // Update last access time
      await updateDoc(boardRef, {
        last_accessed: serverTimestamp(),
        last_modified: serverTimestamp()
      });
      
    } catch (error) {
      console.error("Error loading board:", error);
    }
  });
  
  onDestroy(() => {
    if (unsubscribeBoard) unsubscribeBoard();
    if (unsubscribeUser) unsubscribeUser();
  });

  // Handle adding a widget
  async function handleAddWidget(widgetTypeId, x, y) {
    await addWidget(board_id, widgetTypeId, x, y);
  }

  // Handle removing a widget
  async function handleClose(widgetId) {
    await removeWidget(board_id, widgetId);
  }

  // New function to handle title editing
  function startEditingTitle() {
    editedTitle = boardTitle;
    isEditingTitle = true;
    setTimeout(() => document.getElementById('title-input')?.focus(), 0);
  }

  // New function to save the edited title
  async function saveTitle() {
    if (editedTitle.trim() === "") return;
    
    try {
      await updateDoc(boardRef, {
        name: editedTitle.trim(),
        last_modified: serverTimestamp()
      });
      
      boardTitle = editedTitle.trim();
      isEditingTitle = false;
    } catch (error) {
      console.error("Error updating board title:", error);
    }
  }

  // New function to cancel editing
  function cancelEditingTitle() {
    isEditingTitle = false;
  }

  // Handle keyboard events for the title input
  function handleTitleKeydown(e) {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      cancelEditingTitle();
    }
  }
</script>

<div class="glow" style="--accent-color: {accent}">
  <div class="stippled">
    <div class="absolute z-10 top-4 left-4 flex items-center gap-3">
      <Button variant="ghost" size="icon" class="bg-none" on:click={() => goto("/profile")}>
        <CornerDownLeft />
      </Button>
      
      {#if isEditingTitle}
        <div class="flex items-center">
          <input 
            id="title-input"
            type="text" 
            bind:value={editedTitle}
            on:keydown={handleTitleKeydown}
            on:blur={saveTitle}
            class="text-xl font-medium text-foreground bg-transparent border-b border-primary outline-none px-1"
          />
        </div>
      {:else}
        <div 
          class="flex items-center cursor-pointer group" 
          on:click={startEditingTitle}
        >
          <h1 class="text-xl font-medium text-foreground">{boardTitle}</h1>
          <Pencil class="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      {/if}
    </div>
  
    <div class="absolute z-10 bottom-4 left-4">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button variant="ghost" size="icon" class="bg-none accent-button">
            <Plus />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Add Widget</DropdownMenu.Label>
          <DropdownMenu.Separator />
          {#each Object.values($widgetRegistry) as widget}
            <DropdownMenu.Item on:click={() => handleAddWidget(widget.id, default_spawn[0], default_spawn[1])}>
              {#if widget.icon}
                <svelte:component this={widget.icon} class="mr-2 h-4 w-4" />
              {/if}
              {widget.name}
            </DropdownMenu.Item>
          {/each}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>

    {#if isLoading}
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="loading">Loading board...</div>
      </div>
    {:else}
      {#each $widgets as widget (widget.id)}
      <WidgetLoader 
        typeId={widget.typeId} 
        widgetProps={{
          x: widget.x,
          y: widget.y,
          width: widget.width,
          height: widget.height,
          id: widget.id,
          boardId: board_id,
          content: widget.content,
          settings: widget.settings || {},
          close: () => handleClose(widget.id),
          accent: accent,
          isMaximized: widget.metadata?.isMaximized || false,
          isMinimized: widget.metadata?.isMinimized || false
        }}
      />
      {/each}
    {/if}
  </div>
</div>

<style>
  .stippled {
    position: relative;
    width: 100%;
    min-height: 100vh;
    background-image: radial-gradient(circle, rgba(64, 64, 64, 1) 1.5px, transparent 1px);
    background-size: calc(100vw / 25) calc(100vh/ 17);
  }

  .glow {
    background: radial-gradient(ellipse, transparent, color-mix(in srgb, var(--accent-color, #6366f1) 7%, transparent));
  }
</style>