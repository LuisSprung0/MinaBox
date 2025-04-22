<script context="module">
  import { registerWidget } from '$lib/stores/widget_register';
  import Clock from 'lucide-svelte/icons/clock';
  
  export const widgetDefinition = {
    id: 'clock',
    name: 'Clock',
    description: 'Displays the current time',
    icon: Clock,
  };
  
  if (typeof window !== 'undefined') {
    registerWidget(widgetDefinition);
  }
</script>

<script>
  import { onMount, onDestroy } from 'svelte';
  import Generic from './Generic.svelte';
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index";

  export let title = "Clock";
  export let accent = "white";
  export let width = 400;
  export let height = 300;
  export let x = 100;
  export let y = 100;
  export let close = () => {};
  export let id;
  export let boardId;
  // Use settings object for configuration
  export let settings = {
    showSeconds: true,
    showDate: true,
    use24HourFormat: false,
    isAnalog: false
  };
  
  // For backward compatibility, allow individual props to override settings
  export let showSeconds = undefined;
  export let showDate = undefined;
  export let use24HourFormat = undefined;
  export let isAnalog = undefined;

  // Use settings values but allow prop overrides
  $: actualShowSeconds = showSeconds !== undefined ? showSeconds : settings.showSeconds;
  $: actualShowDate = showDate !== undefined ? showDate : settings.showDate;
  $: actualUse24HourFormat = use24HourFormat !== undefined ? use24HourFormat : settings.use24HourFormat;
  $: actualIsAnalog = isAnalog !== undefined ? isAnalog : settings.isAnalog;

  let currentTime = new Date();
  let interval;
  let generic;

  // Update settings when checkboxes change
  function updateShowSeconds(checked) {
    if (generic) {
      generic.updateSettings({ showSeconds: checked });
    }
  }

  function updateShowDate(checked) {
    if (generic) {
      generic.updateSettings({ showDate: checked });
    }
  }

  function updateUse24HourFormat(checked) {
    if (generic) {
      generic.updateSettings({ use24HourFormat: checked });
    }
  }

  function updateIsAnalog(checked) {
    if (generic) {
      generic.updateSettings({ isAnalog: checked });
    }
  }

  onMount(() => {
    interval = setInterval(() => {
      currentTime = new Date();
    }, 1000);
  });

  onDestroy(() => {
    clearInterval(interval);
  });

  // Use computed values to format time/date
  $: formattedTime = formatTime(currentTime, actualShowSeconds, actualUse24HourFormat);
  $: formattedDate = formatDate(currentTime);
  
  // Calculate analog clock hands angles
  $: seconds = currentTime.getSeconds();
  $: minutes = currentTime.getMinutes();
  $: hours = currentTime.getHours();
  
  $: secondAngle = (seconds * 6);
  $: minuteAngle = (minutes * 6) + (seconds * 0.1);
  $: hourAngle = (hours * 30) + (minutes * 0.5);

  function formatTime(date, showSecs, use24hr) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    let ampm = '';
    
    if (!use24hr) {
      ampm = hours >= 12 ? ' PM' : ' AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
    }
    
    hours = hours.toString().padStart(2, '0');
    
    return `${hours}:${minutes}${showSecs ? ':' + seconds : ''}${ampm}`;
  }

  function formatDate(date) {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return date.toLocaleDateString(undefined, options);
  }
</script>

<Generic 
  {title}
  {accent}
  {width}
  {height}
  {x}
  {y}
  {close}
  {id}
  {boardId}
  {settings}
  bind:this={generic}
  on:move
  on:resize
  on:maximize
  on:minimize
  {...$$restProps}
>
  <div class="flex flex-col items-center justify-center h-full">
    {#if actualIsAnalog}
      <div class="analog-clock">
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <!-- clock face -->
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2" />
          
          <!-- hour markers -->
          {#each Array(12) as _, i}
            <line 
              x1="50" 
              y1="10" 
              x2="50" 
              y2="15" 
              stroke="currentColor" 
              stroke-width="2" 
              transform={`rotate(${i * 30} 50 50)`} 
            />
          {/each}
          
          <!-- second hand -->
          {#if actualShowSeconds}
          <line 
            x1="50" 
            y1="50" 
            x2="50" 
            y2="20" 
            stroke="red" 
            stroke-width="1" 
            transform={`rotate(${secondAngle} 50 50)`} 
          />
          {/if}
          
          <!-- minute hand -->
          <line 
            x1="50" 
            y1="50" 
            x2="50" 
            y2="20" 
            stroke="currentColor" 
            stroke-width="2" 
            transform={`rotate(${minuteAngle} 50 50)`} 
          />
          
          <!-- hour hand -->
          <line 
            x1="50" 
            y1="50" 
            x2="50" 
            y2="28" 
            stroke="currentColor" 
            stroke-width="2.5" 
            stroke-linecap="round" 
            transform={`rotate(${hourAngle} 50 50)`} 
          />
        </svg>
      </div>
    {:else}
      <div class="text-4xl font-bold">{formattedTime}</div>
    {/if}
    
    {#if actualShowDate}
      <div class="mt-2 text-lg text-center">{formattedDate}</div>
    {/if}
  </div>
  
  <svelte:fragment slot="menu">
    <DropdownMenu.Separator />
    <DropdownMenu.CheckboxItem 
      checked={actualIsAnalog}
      onCheckedChange={(checked) => updateIsAnalog(checked)}
    >
      Analog Clock
    </DropdownMenu.CheckboxItem>
    <DropdownMenu.CheckboxItem 
      checked={actualShowSeconds}
      onCheckedChange={(checked) => updateShowSeconds(checked)}
    >
      Show Seconds
    </DropdownMenu.CheckboxItem>
    <DropdownMenu.CheckboxItem 
      checked={actualShowDate}
      onCheckedChange={(checked) => updateShowDate(checked)}
    >
      Show Date
    </DropdownMenu.CheckboxItem>
    <DropdownMenu.CheckboxItem 
      checked={actualUse24HourFormat}
      onCheckedChange={(checked) => updateUse24HourFormat(checked)}
      disabled={actualIsAnalog}
    >
      24-hour Format
    </DropdownMenu.CheckboxItem>
  </svelte:fragment>
</Generic>

<style>
  .analog-clock {
    width: 100%;
    max-width: 180px;
    aspect-ratio: 1/1;
  }
</style>