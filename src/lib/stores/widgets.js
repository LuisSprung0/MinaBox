import { writable } from 'svelte/store';

export const widgets = writable([]);

export const addWidget = (typeId, x, y, id = crypto.randomUUID()) => {
  widgets.update(items => {
    return [...items, { id, typeId, x, y, content: {} }];
  });
  return id;
};

export const removeWidget = (id) => {
  widgets.update(items => items.filter(item => item.id !== id));
};

export const updateWidget = (id, updates) => {
  widgets.update(items => 
    items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    )
  );
};