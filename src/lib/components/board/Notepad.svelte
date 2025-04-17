<script>
  import Generic from './Generic.svelte';
  
  export let title = "Notepad";
  export let accent = "white";
  export let close = () => {};
  export let content = "";
</script>

<Generic
  {title}
  {accent}
  {close}
>
  <svelte:fragment slot="menu">
  </svelte:fragment>

  <div class="h-full w-full">
    <textarea 
      bind:value={content}
      class="w-full h-full resize-none bg-transparent border-none focus:outline-none focus:ring-0 overflow-y-auto box-border font-[inherit]"
      placeholder="Start typing..."
    ></textarea>
  </div>
</Generic>