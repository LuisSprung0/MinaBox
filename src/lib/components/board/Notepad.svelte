<script>
  import Generic from './Generic.svelte';
  
  export let title = "Notepad";
  export let close = () => {};
  export let content = "";
</script>

<Generic
  {title}
  {close}
>
  <svelte:fragment slot="menu">
  </svelte:fragment>

  <div class="h-full w-full">
    <textarea 
      bind:value={content}
      class="w-full h-full resize-none bg-transparent border-none focus:outline-none focus:ring-0"
      placeholder="Start typing..."
    ></textarea>
  </div>
</Generic>

<style>
  textarea {
    font-family: inherit;
    box-sizing: border-box;
    overflow-y: auto;
  }
</style>