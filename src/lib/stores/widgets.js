import { writable } from 'svelte/store';

export const WIDGET_TYPES = {
  NOTEPAD: 'notepad',
  GENERIC: 'generic',
};

export const widgets = writable([
  {
    id: 1,
    type: WIDGET_TYPES.NOTEPAD,
    x: 100,
    y: 100,
  }
]);

export function addWidget(type, x, y) {
  widgets.update(items => {
    const newId = items.length > 0 ? Math.max(...items.map(w => w.id)) + 1 : 1;
    return [...items, {
      id: newId,
      type,
      x,
      y,
    }];
  });
}

export function removeWidget(id) {
  widgets.update(items => items.filter(widget => widget.id !== id));
}

export function updateWidget(id, properties) {
  widgets.update(items => 
    items.map(widget => 
      widget.id === id ? { ...widget, ...properties } : widget
    )
  );
}