<script>
  import { onMount } from 'svelte';
  import { widgetRegistry, getWidgetComponent, registerWidgetComponent } from '$lib/stores/widget_register';
  import Clock from './Clock.svelte';  
  import Notepad from './Notepad.svelte';
  import ToDo from './ToDo.svelte';
  
  export let typeId;
  export let widgetProps;
  
  registerWidgetComponent('clock', Clock);
  registerWidgetComponent('notepad', Notepad);
  registerWidgetComponent('list-todo', ToDo);
  
  $: component = getWidgetComponent(typeId);
  $: widgetMetadata = $widgetRegistry[typeId];
</script>

{#if component}
  <svelte:component 
    this={component}
    {...widgetProps}
  />
{:else}
  <div class="p-4 border border-red-500 rounded">
    Unknown widget type: {typeId}
    {#if widgetMetadata}
      <div class="text-sm opacity-70">{widgetMetadata.name}</div>
    {/if}
  </div>
{/if}