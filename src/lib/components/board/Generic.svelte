<script>
  import { onMount, createEventDispatcher, getContext } from 'svelte';
  import { slide } from 'svelte/transition';
  import { MoreVertical, X, Maximize2, Minimize2 } from 'lucide-svelte';
  import { Button } from "$lib/components/ui/button/";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { updateWidget } from '$lib/services/widgetService';

  // Props with defaults
  export let title = "Widget";
  export let accent = "white";
  export let width = 400;
  export let height = 300;
  export let x = 100;
  export let y = 100;
  export let minWidth = 200;
  export let minHeight = 150;
  export let showHeader = true;
  export let maximizable = true;
  export let minimizable = true;
  export let resizable = true;
  export let closable = true;
  export let snapDistance = 10;
  export let close = () => {};
  export let id = undefined;
  export let boardId = undefined;  // Add boardId prop to identify which board this widget belongs to
  export let content = {};

  // State variables
  let isDragging = false;
  let isResizing = false;
  let resizeDirection = '';
  let dragStart = { x: 0, y: 0 };
  let startDimensions = { width, height, x, y };
  let isMaximized = false;
  let isMinimized = false;
  let prevDimensions = {};
  let widgetElement;
  let containerWidth, containerHeight;
  let isFocused = false;
  let isDropdownOpen = false;
  let snapped = { left: false, right: false, top: false, bottom: false };

  const { darkMode, toggleTheme } = getContext('theme');
  const dispatch = createEventDispatcher();

  $: showHeaderNow = isFocused || isMinimized || isDragging || isResizing || isDropdownOpen;
  $: borderRadiusClasses = getBorderRadiusClasses(snapped);

  onMount(() => {
    updateContainerDimensions();
    window.addEventListener('resize', updateContainerDimensions);
    return () => window.removeEventListener('resize', updateContainerDimensions);
  });

  function updateContainerDimensions() {
    const parent = widgetElement?.parentElement;
    if (parent) {
      containerWidth = parent.clientWidth;
      containerHeight = parent.clientHeight;
      checkSnappedEdges();
    }
  }

  function getBorderRadiusClasses(snapped) {
    return [
      snapped.left || snapped.top ? 'rounded-tl-none' : '',
      snapped.right || snapped.top ? 'rounded-tr-none' : '',
      snapped.left || snapped.bottom ? 'rounded-bl-none' : '',
      snapped.right || snapped.bottom ? 'rounded-br-none' : ''
    ].filter(Boolean).join(' ');
  }

  function handleFocus() {
    isFocused = true;
  }

  function handleBlur() {
    if (!isDragging && !isResizing && !isDropdownOpen) {
      isFocused = false;
    }
  }

  function checkSnappedEdges() {
    snapped = {
      left: x < snapDistance,
      right: x + width > containerWidth - snapDistance,
      top: y < snapDistance,
      bottom: y + height > containerHeight - snapDistance
    };
  }

  function startInteraction(e, type, dir = '') {
    e.preventDefault();
    
    if (isMaximized) return;
    
    const clientX = e.clientX || e.touches?.[0].clientX;
    const clientY = e.clientY || e.touches?.[0].clientY;
    
    dragStart = { x: clientX, y: clientY };
    startDimensions = { width, height, x, y };
    
    if (type === 'drag') {
      isDragging = true;
    } else if (type === 'resize') {
      isResizing = true;
      resizeDirection = dir;
    }
    
    document.addEventListener('mousemove', handleInteraction);
    document.addEventListener('touchmove', handleInteraction, { passive: false });
    document.addEventListener('mouseup', stopInteraction);
    document.addEventListener('touchend', stopInteraction);
  }

  function handleInteraction(e) {
    e.preventDefault();
    
    const clientX = e.clientX || e.touches?.[0].clientX;
    const clientY = e.clientY || e.touches?.[0].clientY;
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    
    if (isDragging) {
      handleDragMove(deltaX, deltaY);
    } else if (isResizing) {
      handleResizeMove(deltaX, deltaY);
    }
  }

  function handleDragMove(deltaX, deltaY) {
    let newX = startDimensions.x + deltaX;
    let newY = startDimensions.y + deltaY;
    
    // Apply snapping
    x = newX < snapDistance ? 0 : (newX + width > containerWidth - snapDistance ? containerWidth - width : newX);
    y = newY < snapDistance ? 0 : (newY + height > containerHeight - snapDistance ? containerHeight - height : newY);
    
    if (id && boardId) {
      updateWidget(boardId, id, { x, y });
    }

    dispatch('move', { x, y });
  }

  function handleResizeMove(deltaX, deltaY) {
    // Handle each resize direction
    if (resizeDirection.includes('e')) {
      width = Math.max(startDimensions.width + deltaX, minWidth);
      width = x + width > containerWidth - snapDistance ? containerWidth - x : width;
    }
    
    if (resizeDirection.includes('s')) {
      height = Math.max(startDimensions.height + deltaY, minHeight);
      height = y + height > containerHeight - snapDistance ? containerHeight - y : height;
    }
    
    if (resizeDirection.includes('w')) {
      const newWidth = Math.max(startDimensions.width - deltaX, minWidth);
      if (newWidth !== width) {
        const newX = startDimensions.x + (startDimensions.width - newWidth);
        x = newX < snapDistance ? 0 : newX;
        width = startDimensions.width - (x - startDimensions.x);
      }
    }
    
    if (resizeDirection.includes('n')) {
      const newHeight = Math.max(startDimensions.height - deltaY, minHeight);
      if (newHeight !== height) {
        const newY = startDimensions.y + (startDimensions.height - newHeight);
        y = newY < snapDistance ? 0 : newY;
        height = startDimensions.height - (y - startDimensions.y);
      }
    }

    if (id && boardId) {
      updateWidget(boardId, id, { width, height, x, y });
    }
    
    dispatch('resize', { width, height, x, y });
  }

  function stopInteraction() {
    isDragging = false;
    isResizing = false;
    document.removeEventListener('mousemove', handleInteraction);
    document.removeEventListener('touchmove', handleInteraction);
    document.removeEventListener('mouseup', stopInteraction);
    document.removeEventListener('touchend', stopInteraction);
    checkSnappedEdges();
  }

  function maximize() {
    if (isMaximized) {
      // Restore
      ({ width, height, x, y } = prevDimensions);
      isMaximized = false;
      checkSnappedEdges();
    } else {
      // Maximize
      prevDimensions = { width, height, x, y };
      x = 0; y = 0;
      width = containerWidth;
      height = containerHeight;
      isMaximized = true;
      snapped = { left: true, right: true, top: true, bottom: true };
    }
    
    if (id && boardId) {
      updateWidget(boardId, id, { 
        width, height, x, y, 
        metadata: { isMaximized } 
      });
    }
    
    dispatch('maximize', { isMaximized });
  }

  function minimize() {
    isMinimized = !isMinimized;
    
    if (id && boardId) {
      updateWidget(boardId, id, { 
        metadata: { isMinimized } 
      });
    }
    
    dispatch('minimize', { isMinimized });
  }
  
  // Method to update widget content - can be called from child widgets
  export function updateContent(newContent) {
    content = { ...content, ...newContent };
    
    if (id && boardId) {
      updateWidget(boardId, id, { content });
    }
  }
</script>

<div 
  class="absolute rounded-lg flex flex-col overflow-hidden select-none shadow-md backdrop-blur-md bg-opacity-100 z-40 border stylization {borderRadiusClasses}" 
  bind:this={widgetElement}
  style="
    width: {width}px;
    height: {isMinimized ? 'auto' : height + 'px'};
    transform: translate({x}px, {y}px);
  "
  role="button"
  tabindex=0
  class:maximized={isMaximized}
  class:minimized={isMinimized}
  on:click={handleFocus}
  on:focusin={handleFocus}
  on:focusout={handleBlur}
  on:keydown={(e) => e.ctrlKey && (e.key === 'Enter' || e.key === ' ') && maximizable && maximize()}
>
  {#if showHeader && showHeaderNow}
    <div 
      class="flex items-center justify-between px-3 py-2 border-t-8 border-solid border-{accent}-500 cursor-move"
      role="button"
      tabindex="-1"
      on:mousedown={(e) => startInteraction(e, 'drag')}
      on:touchstart={(e) => startInteraction(e, 'drag')}
      transition:slide={{ duration: 150 }}
    >
      <div class="font-medium text-sm overflow-hidden text-ellipsis whitespace-nowrap">{title}</div>
      <DropdownMenu.Root onOpenChange={(open) => isDropdownOpen = open}>
        <DropdownMenu.Trigger>
          <Button variant="ghost" size="icon" class="h-7 w-7">
            <MoreVertical class="h-4 w-4" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align=end>
          <div class="flex flex-row gap-4 justify-evenly">
            {#if minimizable}
            <Tooltip.Root>
              <Tooltip.Trigger>
                <Button variant="ghost" size="icon" class="h-7 w-7" on:click={minimize}>
                  <Minimize2 class="h-4 w-4" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>Minimize</Tooltip.Content>
            </Tooltip.Root>
            {/if}
            
            {#if maximizable}
            <Tooltip.Root>
              <Tooltip.Trigger>
                <Button variant="ghost" size="icon" class="h-7 w-7" on:click={maximize}>
                  <Maximize2 class="h-4 w-4" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>Maximize</Tooltip.Content>

            </Tooltip.Root>
            {/if}
            
            {#if closable}
            <Tooltip.Root>
              <Tooltip.Trigger>
                <Button variant="ghost" size="icon" class="h-7 w-7" on:click={close}>
                  <X class="h-4 w-4" />
                </Button> 
              </Tooltip.Trigger>
              <Tooltip.Content>Close</Tooltip.Content>
            </Tooltip.Root>
            {/if}
          </div>
          <slot name="menu">
          </slot>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  {/if}

  {#if !isMinimized}
    <div class="overflow-auto p-4 h-full">
      <slot><p>Widget Content</p></slot>
    </div>
  {/if}

  {#if resizable && !isMaximized && !isMinimized}
    <!-- resizing handlers -->
    {#each ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'] as dir}
    <div class="resize-handle {dir}" 
         on:mousedown={(e) => startInteraction(e, 'resize', dir)} 
         on:touchstart={(e) => startInteraction(e, 'resize', dir)} 
         role="button" 
         tabindex=-1>
    </div>
    {/each}
  {/if}
</div>

<style>
  .maximized {
    border-radius: 0;
    box-shadow: none;
  }

  /* Resize handles */
  .resize-handle {
    position: absolute;
    background: transparent;
  }

  .n { top: -3px; left: 0; right: 0; height: 6px; cursor: n-resize; }
  .e { top: 0; right: -3px; bottom: 0; width: 6px; cursor: e-resize; }
  .s { bottom: -3px; left: 0; right: 0; height: 6px; cursor: s-resize; }
  .w { top: 0; left: -3px; bottom: 0; width: 6px; cursor: w-resize; }
  .ne { top: -3px; right: -3px; width: 10px; height: 10px; cursor: ne-resize; }
  .se { bottom: -3px; right: -3px; width: 10px; height: 10px; cursor: se-resize; }
  .sw { bottom: -3px; left: -3px; width: 10px; height: 10px; cursor: sw-resize; }
  .nw { top: -3px; left: -3px; width: 10px; height: 10px; cursor: nw-resize; }

  .stylization {
    transition: 
      border-top-left-radius 0.1s ease-in-out,
      border-top-right-radius 0.1s ease-in-out,
      border-bottom-left-radius 0.1s ease-in-out,
      border-bottom-right-radius 0.1s ease-in-out;
  }
  
  /* Border radius utility classes */
  .rounded-tl-none { border-top-left-radius: 0; }
  .rounded-tr-none { border-top-right-radius: 0; }
  .rounded-bl-none { border-bottom-left-radius: 0; }
  .rounded-br-none { border-bottom-right-radius: 0; }
</style>