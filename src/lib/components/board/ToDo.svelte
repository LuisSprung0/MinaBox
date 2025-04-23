<script context="module">
    import { registerWidget } from '$lib/stores/widget_register';
    import { ListTodo } from 'lucide-svelte';
    
    export const widgetDefinition = {
      id: 'list-todo',
      name: 'To-Do List',
      description: 'Make a checklist of your tasks',
      icon: ListTodo,
    };
    
    if (typeof window !== 'undefined') {
      registerWidget(widgetDefinition);
    }
</script>
  
<script>
    import Generic from './Generic.svelte';
    
    export let title = "To-Do List";
    export let accent = "white";
    export let width = 400;
    export let height = 300;
    export let x = 100;
    export let y = 100;
    export let close = () => {};
    export let content = { text: "" };
    export let id;
    export let boardId;
  
    let generic;
  
    function handleInput() {
      if (generic) {
        generic.updateContent({ text: content.text });
      }
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
    {content}
    bind:this={generic}
    on:move
    on:resize
    on:maximize
    on:minimize
    {...$$restProps}
>
    <div class="h-full w-full">
      <textarea 
        bind:value={content.text}
        class="w-full h-full resize-none bg-transparent border-none focus:outline-none focus:ring-0 overflow-y-auto box-border font-[inherit]"
        placeholder="Start typing..."
        on:input={handleInput}
      ></textarea>
    </div>
</Generic>