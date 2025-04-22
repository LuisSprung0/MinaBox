import { get } from 'svelte/store';
import { widgetRegistry } from './stores/widget_register';
import.meta.glob('./components/board/*.svelte', { eager: true });

export function initializeWidgets() {
  setTimeout(() => {
    const registry = get(widgetRegistry);
    if (Object.keys(registry).length === 0) {
      console.warn('No widgets auto-registered, checking imported modules');
    }    
  }, 0);
}