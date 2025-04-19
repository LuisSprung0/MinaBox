import { writable} from 'svelte/store';

export const widgets = writable([]);

export function addWidget(widgetTypeId, x, y) {
  widgets.update(items => {
    const newId = items.length > 0 ? Math.max(...items.map(w => w.id)) + 1 : 1;
    return [...items, {
      id: newId,
      typeId: widgetTypeId,
      x,
      y,
      content: {} //blank content on creation
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