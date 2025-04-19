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
  export let showSeconds = true;
  export let showDate = true;
  export let use24HourFormat = false;
  export let isAnalog = false;
  export let close = () => {};

  let currentTime = new Date();
  let timeInterval;

  $: formattedTime = formatTime(currentTime, use24HourFormat, showSeconds);
  $: formattedDate = formatDate(currentTime);
  
  $: hours = currentTime.getHours();
  $: minutes = currentTime.getMinutes();
  $: seconds = currentTime.getSeconds();
  
  $: hourAngle = (hours % 12) * 30 + minutes * 0.5;
  $: minuteAngle = minutes * 6;
  $: secondAngle = seconds * 6;

  onMount(() => {
    timeInterval = setInterval(() => {
      currentTime = new Date();
    }, 1000);
  });

  onDestroy(() => {
    if (timeInterval) clearInterval(timeInterval);
  });

  function formatTime(date, use24Hour, showSecs) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    let ampm = '';
    
    if (!use24Hour) {
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
  on:move
  on:resize
  on:maximize
  on:minimize
  {...$$restProps}
>
  <div class="flex flex-col items-center justify-center h-full">
    {#if isAnalog}
      <div class="analog-clock">
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <!-- clock face -->
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2" />
          
          <!-- second hand -->
          {#if showSeconds}
            <line 
              x1="50" 
              y1="55" 
              x2="50" 
              y2="18" 
              stroke-width="1" 
              stroke-linecap="round" 
              transform={`rotate(${secondAngle} 50 50)`} 
              class="stroke-{accent}-500"
            />
          {/if}

          <!-- minute hand -->
          <line 
            x1="50" 
            y1="50" 
            x2="50" 
            y2="20" 
            stroke="currentColor" 
            stroke-width="1" 
            stroke-linecap="round" 
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
    
    {#if showDate}
      <div class="mt-2 text-lg text-center">{formattedDate}</div>
    {/if}
  </div>
  
  <svelte:fragment slot="menu">
    <DropdownMenu.Separator />
    <DropdownMenu.CheckboxItem 
      checked={isAnalog}
      onCheckedChange={(checked) => isAnalog = checked}
    >
      Analog Clock
    </DropdownMenu.CheckboxItem>
    <DropdownMenu.CheckboxItem 
      checked={showSeconds}
      onCheckedChange={(checked) => showSeconds = checked}
    >
      Show Seconds
    </DropdownMenu.CheckboxItem>
    <DropdownMenu.CheckboxItem 
      checked={showDate}
      onCheckedChange={(checked) => showDate = checked}
    >
      Show Date
    </DropdownMenu.CheckboxItem>
    <DropdownMenu.CheckboxItem 
      checked={use24HourFormat}
      onCheckedChange={(checked) => use24HourFormat = checked}
      disabled={isAnalog}
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