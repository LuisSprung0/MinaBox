<script>
  import { CornerDownLeft, Plus } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button/";
  import Textarea from "$lib/components/ui/textarea/textarea.svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index";

  import Generic from "$lib/components/board/Generic.svelte";
  import Notepad from "$lib/components/board/Notepad.svelte";

  import { onMount, getContext } from 'svelte';
  import { widgets, addWidget, removeWidget, WIDGET_TYPES } from "$lib/stores/widgets.js";

  const { darkMode, toggleTheme } = getContext('theme');

  // Default position for new widgets
  const default_spawn = [100, 100];

  function handleClose(widgetId) {
    removeWidget(widgetId);
  }

  function handleAddWidget() {
    addWidget(WIDGET_TYPES.NOTEPAD, 100, 100);
  }

  const widgetComponents = {
    [WIDGET_TYPES.NOTEPAD]: Notepad,
    [WIDGET_TYPES.GENERIC]: Generic, //temp until new widgets added
  };
</script>


<div class="glow">
  <div class="stippled">
    <div class="absolute z-10 top-4 left-4">
      <Button variant="ghost" size="icon" class="bg-none">
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
          <DropdownMenu.Item on:click={() => addWidget(WIDGET_TYPES.NOTEPAD, default_spawn[0], default_spawn[1])}>
            Notepad
          </DropdownMenu.Item>
          <DropdownMenu.Item on:click={() => addWidget(WIDGET_TYPES.GENERIC, default_spawn[0], default_spawn[1])}>
            Generic Widget
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>

    {#each $widgets as widget (widget.id)}
      <svelte:component 
        this={widgetComponents[widget.type]} 
        x={widget.x}
        y={widget.y}
        id={widget.id}
        content={widget.content}
        close={() => handleClose(widget.id)}
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