import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '../types/product';
import { SmartAlternative } from '../types/alternatives';
import { BasketItem, BasketUndoAction } from '../types/basket';
import { useAuth } from './AuthContext';
import { getStoredLocalUser } from '../services/supabase';

interface AddItemResult {
  success: boolean;
  isDuplicate: boolean;
  item: BasketItem;
}

interface BasketContextType {
  basketItems: BasketItem[];
  items: BasketItem[];
  totalItemsCount: number;
  totalUnits: number;
  uniqueProductsCount: number;
  addItem: (
    product: Product,
    quantity?: number,
    unitPrice?: number,
    origin?: 'scanner' | 'alternative' | 'manual',
    altData?: SmartAlternative
  ) => AddItemResult;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  clearBasket: () => void;
  replaceItem: (
    originalItemId: string,
    replacementProduct: Product,
    replacementPrice?: number,
    altData?: SmartAlternative
  ) => void;
  undoLastAction: () => boolean;
  canUndo: boolean;
  getItemByProductId: (productId: string) => BasketItem | undefined;
  isProductInBasket: (productId: string) => boolean;
  toastMessage: string | null;
  clearToast: () => void;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

const BASKET_STORAGE_KEY_PREFIX = 'shescan_local_basket';

export const BasketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [basketItems, setBasketItems] = useState<BasketItem[]>([]);
  const [undoHistory, setUndoHistory] = useState<BasketUndoAction[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeUserId = user?.id || getStoredLocalUser()?.id || 'guest';
  const storageKey = `${BASKET_STORAGE_KEY_PREFIX}_${activeUserId}`;

  // Load from localStorage on user change / mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setBasketItems(JSON.parse(raw));
      } else {
        setBasketItems([]);
      }
    } catch {
      setBasketItems([]);
    }
  }, [storageKey]);

  // Persist helper
  const persistItems = (items: BasketItem[]) => {
    setBasketItems(items);
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (err) {
      console.warn('Failed to persist grocery basket:', err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const clearToast = () => setToastMessage(null);

  // Helper to match products by barcode or normalized name
  const findExistingItem = (product: Product): BasketItem | undefined => {
    if (product.barcode) {
      const byBarcode = basketItems.find((i) => i.product.barcode === product.barcode);
      if (byBarcode) return byBarcode;
    }
    const cleanName = product.name.trim().toLowerCase();
    return basketItems.find((i) => i.product.name.trim().toLowerCase() === cleanName);
  };

  const addItem = (
    product: Product,
    quantity = 1,
    unitPrice?: number,
    origin: 'scanner' | 'alternative' | 'manual' = 'manual',
    altData?: SmartAlternative
  ): AddItemResult => {
    const existing = findExistingItem(product);

    if (existing) {
      // Increment quantity
      const updatedItem: BasketItem = {
        ...existing,
        quantity: existing.quantity + quantity,
        unitPrice: unitPrice !== undefined ? unitPrice : existing.unitPrice,
        priceEstimated: altData ? Boolean(altData.estimatedCostDetails) : existing.priceEstimated,
        alternativeData: altData || existing.alternativeData,
      };

      const updatedList = basketItems.map((item) =>
        item.id === existing.id ? updatedItem : item
      );

      persistItems(updatedList);
      showToast(`Added +${quantity} unit(s) to basket (total: ${updatedItem.quantity})`);
      return { success: true, isDuplicate: true, item: updatedItem };
    }

    // New item in basket
    const newItem: BasketItem = {
      id: uuidv4(),
      productId: product.barcode || product.name.trim().toLowerCase().replace(/\s+/g, '_'),
      product,
      quantity: Math.max(1, quantity),
      unitPrice,
      priceEstimated: altData ? Boolean(altData.estimatedCostDetails) : false,
      currency: '$',
      addedAt: new Date().toISOString(),
      origin,
      alternativeData: altData,
    };

    const updatedList = [newItem, ...basketItems];
    persistItems(updatedList);
    showToast(`Added "${product.name}" to basket`);
    return { success: true, isDuplicate: false, item: newItem };
  };

  const removeItem = (itemId: string) => {
    const target = basketItems.find((i) => i.id === itemId);
    if (!target) return;

    // Record undo action
    setUndoHistory((prev) => [
      {
        type: 'remove',
        timestamp: Date.now(),
        previousItem: target,
      },
      ...prev,
    ]);

    const updatedList = basketItems.filter((i) => i.id !== itemId);
    persistItems(updatedList);
    showToast(`Removed "${target.product.name}" from basket`);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    const updatedList = basketItems.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    persistItems(updatedList);
  };

  const clearBasket = () => {
    if (basketItems.length === 0) return;

    // Record undo action
    setUndoHistory((prev) => [
      {
        type: 'clear',
        timestamp: Date.now(),
        previousBasket: [...basketItems],
      },
      ...prev,
    ]);

    persistItems([]);
    showToast('Grocery basket cleared');
  };

  const replaceItem = (
    originalItemId: string,
    replacementProduct: Product,
    replacementPrice?: number,
    altData?: SmartAlternative
  ) => {
    const original = basketItems.find((i) => i.id === originalItemId);
    if (!original) return;

    const newItem: BasketItem = {
      id: uuidv4(),
      productId: replacementProduct.barcode || replacementProduct.name.trim().toLowerCase().replace(/\s+/g, '_'),
      product: replacementProduct,
      quantity: original.quantity, // Preserve selected quantity
      unitPrice: replacementPrice,
      priceEstimated: Boolean(altData?.estimatedCostDetails),
      currency: '$',
      addedAt: new Date().toISOString(),
      origin: 'alternative',
      alternativeData: altData,
    };

    // Record undo action
    setUndoHistory((prev) => [
      {
        type: 'replace',
        timestamp: Date.now(),
        previousItem: original,
        replacedWithId: newItem.id,
      },
      ...prev,
    ]);

    const updatedList = basketItems.map((item) =>
      item.id === originalItemId ? newItem : item
    );

    persistItems(updatedList);
    showToast(`Replaced "${original.product.name}" with "${replacementProduct.name}"`);
  };

  const undoLastAction = (): boolean => {
    if (undoHistory.length === 0) return false;
    const [action, ...remaining] = undoHistory;
    setUndoHistory(remaining);

    if (action.type === 'replace' && action.previousItem && action.replacedWithId) {
      // Revert replacement
      const reverted = basketItems.map((item) =>
        item.id === action.replacedWithId ? action.previousItem! : item
      );
      persistItems(reverted);
      showToast(`Reverted replacement of "${action.previousItem.product.name}"`);
      return true;
    }

    if (action.type === 'remove' && action.previousItem) {
      // Revert removal
      const restored = [action.previousItem, ...basketItems];
      persistItems(restored);
      showToast(`Restored "${action.previousItem.product.name}" to basket`);
      return true;
    }

    if (action.type === 'clear' && action.previousBasket) {
      // Revert clear
      persistItems(action.previousBasket);
      showToast('Restored previous grocery basket');
      return true;
    }

    return false;
  };

  const getItemByProductId = (productId: string): BasketItem | undefined => {
    const cleanId = productId.trim().toLowerCase();
    return basketItems.find(
      (i) =>
        (i.product.barcode && i.product.barcode.toLowerCase() === cleanId) ||
        i.productId.toLowerCase() === cleanId ||
        i.product.name.trim().toLowerCase() === cleanId
    );
  };

  const isProductInBasket = (productId: string): boolean => {
    return Boolean(getItemByProductId(productId));
  };

  const totalItemsCount = useMemo(
    () => basketItems.reduce((sum, item) => sum + item.quantity, 0),
    [basketItems]
  );

  const uniqueProductsCount = basketItems.length;
  const canUndo = undoHistory.length > 0;

  return (
    <BasketContext.Provider
      value={{
        basketItems,
        items: basketItems,
        totalItemsCount,
        totalUnits: totalItemsCount,
        uniqueProductsCount,
        addItem,
        removeItem,
        updateQuantity,
        clearBasket,
        replaceItem,
        undoLastAction,
        canUndo,
        getItemByProductId,
        isProductInBasket,
        toastMessage,
        clearToast,
      }}
    >
      {children}
    </BasketContext.Provider>
  );
};

export const useBasket = () => {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error('useBasket must be used within a BasketProvider');
  }
  return context;
};
