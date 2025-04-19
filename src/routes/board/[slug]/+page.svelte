<script>
  //Images / Icons
  import { CornerDownLeft, Plus } from "lucide-svelte";

  //Components
  import { Button } from "$lib/components/ui/button/";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index";
  import WidgetLoader from "$lib/components/board/WidgetLoader.svelte"; //dynamically loads all widgets for us

  //Functions
  import { onMount, getContext } from 'svelte';
  import { goto } from "$app/navigation";
  import { widgets, addWidget, removeWidget } from "$lib/stores/widgets.js";
  import { widgetRegistry } from "$lib/stores/widget_register";
  import { initializeWidgets } from "$lib/widget_init";

  const { darkMode, toggleTheme } = getContext('theme');
  const default_spawn = [100, 100];

  function handleClose(widgetId) {
    removeWidget(widgetId);
  }

  onMount(() => {
    initializeWidgets();
  });

</script>


<div class="glow">
  <div class="stippled">
    <div class="absolute z-10 top-4 left-4">
      <Button variant="ghost" size="icon" class="bg-none" on:click={() => goto("/profile")}>
        <CornerDownLeft />
      </Button>
    </div>
  
    <div class="absolute z-10 bottom-4 left-4">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button variant="ghost" size="icon" class="bg-none">
            <Plus />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Add Widget</DropdownMenu.Label>
          <DropdownMenu.Separator />
          {#each Object.values($widgetRegistry) as widget}
            <DropdownMenu.Item on:click={() => addWidget(widget.id, default_spawn[0], default_spawn[1])}>
              {#if widget.icon}
                <svelte:component this={widget.icon} class="mr-2 h-4 w-4" />
              {/if}
              {widget.name}
            </DropdownMenu.Item>
          {/each}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>

    {#each $widgets as widget (widget.id)}
    <WidgetLoader 
    typeId={widget.typeId} 
    widgetProps={{
      x: widget.x,
      y: widget.y,
      id: widget.id,
      content: widget.content,
      close: () => handleClose(widget.id)
      }}
    />
    {/each}
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
    background: radial-gradient(ellipse, transparent, rgba(100, 100, 150, 0.07));
  }
</style>