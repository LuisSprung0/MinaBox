import { writable } from 'svelte/store';

// Store to hold all registered widgets
export const widgetRegistry = writable({});

// Register a widget with the system (just metadata)
export function registerWidget(widgetDefinition) {
  if (!widgetDefinition.id) {
    console.error('Widget must have an id:', widgetDefinition);
    return;
  }

  widgetRegistry.update(registry => ({
    ...registry,
    [widgetDefinition.id]: widgetDefinition
  }));
}

// Map of widget IDs to their component constructors (populated at runtime)
const widgetComponents = {};

// Register a component implementation for a widget type
export function registerWidgetComponent(widgetId, component) {
  widgetComponents[widgetId] = component;
}

// Get component for a widget type
export function getWidgetComponent(widgetId) {
  return widgetComponents[widgetId];
}