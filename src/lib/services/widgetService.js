import { get } from 'svelte/store';
import { widgets } from '$lib/stores/widgets';
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '$lib/firebase';
import { debounce } from '$lib/utils';


export const updateWidget = debounce(async (boardId, widgetId, updates) => {
  if (!boardId || !widgetId) return;
  
  try {
    widgets.update(items => 
      items.map(item => 
        item.id === widgetId ? { ...item, ...updates } : item
      )
    );
    
    const boardRef = doc(db, 'boards', boardId);
    
    const boardDoc = await getDoc(boardRef);
    if (!boardDoc.exists()) {
      console.error("Board not found for widget update");
      return;
    }
    
    const boardData = boardDoc.data();
    const updatedWidgets = (boardData.widgets || []).map(w => {
      if (w.id === widgetId) {
        return { ...w, ...updates };
      }
      return w;
    });
    
    await updateDoc(boardRef, {
      widgets: updatedWidgets,
      last_modified: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating widget:", error);
    const currentWidgets = get(widgets);
    const originalWidget = currentWidgets.find(w => w.id === widgetId);
    if (originalWidget) {
      widgets.update(items => 
        items.map(item => 
          item.id === widgetId ? originalWidget : item
        )
      );
    }
  }
}, 500);


export const addWidget = async (boardId, widgetTypeId, x, y, initialContent = {}) => {
  if (!boardId) return null;
  
  const newWidget = {
    id: crypto.randomUUID(),
    typeId: widgetTypeId,
    x,
    y,
    width: 400,
    height: 300,
    content: initialContent
  };
  
  try {
    widgets.update(items => [...items, newWidget]);
    
    const boardRef = doc(db, 'boards', boardId);
    await updateDoc(boardRef, {
      widgets: arrayUnion(newWidget),
      last_modified: serverTimestamp()
    });
    
    return newWidget.id;
  } catch (error) {
    console.error("Error adding widget:", error);
    widgets.update(items => items.filter(item => item.id !== newWidget.id));
    return null;
  }
};

export const removeWidget = async (boardId, widgetId) => {
  if (!boardId || !widgetId) return false;
  
  try {
    const currentWidgets = get(widgets);
    const widgetToRemove = currentWidgets.find(w => w.id === widgetId);
    
    if (!widgetToRemove) return false;
    
    widgets.update(items => items.filter(item => item.id !== widgetId));
    
    const boardRef = doc(db, 'boards', boardId);
    const boardDoc = await getDoc(boardRef);
    
    if (!boardDoc.exists()) {
      console.error("Board not found for widget removal");
      return false;
    }
    
    const boardData = boardDoc.data();
    const updatedWidgets = (boardData.widgets || []).filter(w => w.id !== widgetId);
    
    await updateDoc(boardRef, {
      widgets: updatedWidgets,
      last_modified: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error removing widget:", error);
    return false;
  }
};

export const loadBoardWidgets = async (boardId) => {
  if (!boardId) return [];
  
  try {
    const boardRef = doc(db, 'boards', boardId);
    const boardDoc = await getDoc(boardRef);
    
    if (!boardDoc.exists()) {
      console.error("Board not found");
      return [];
    }
    
    const boardData = boardDoc.data();
    const boardWidgets = boardData.widgets || [];
    
    // Update widget store
    widgets.set(boardWidgets);
    
    return boardWidgets;
  } catch (error) {
    console.error("Error loading widgets:", error);
    return [];
  }
};