import React, { createContext, useContext, useState, useEffect } from 'react';
import { SmartAlternative } from '../types/alternatives';
import { useAuth } from './AuthContext';
import { getStoredLocalUser } from '../services/supabase';

interface FavouritesContextType {
  favourites: SmartAlternative[];
  favouriteIds: Set<string>;
  isFavourite: (id: string) => boolean;
  addFavourite: (alt: SmartAlternative) => void;
  removeFavourite: (id: string) => void;
  toggleFavourite: (alt: SmartAlternative) => void;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

const FAVOURITES_KEY_PREFIX = 'shescan_local_favourites';

export const FavouritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState<SmartAlternative[]>([]);

  const activeUserId = user?.id || getStoredLocalUser()?.id || 'guest';
  const storageKey = `${FAVOURITES_KEY_PREFIX}_${activeUserId}`;

  // Load from localStorage on user change
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setFavourites(JSON.parse(raw));
      } else {
        setFavourites([]);
      }
    } catch {
      setFavourites([]);
    }
  }, [storageKey]);

  // Persist helper
  const persistFavourites = (items: SmartAlternative[]) => {
    setFavourites(items);
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (err) {
      console.warn('Failed to persist favourites:', err);
    }
  };

  const isFavourite = (id: string) => favourites.some((item) => item.id === id);

  const addFavourite = (alt: SmartAlternative) => {
    if (!isFavourite(alt.id)) {
      const updated = [alt, ...favourites];
      persistFavourites(updated);
    }
  };

  const removeFavourite = (id: string) => {
    const updated = favourites.filter((item) => item.id !== id);
    persistFavourites(updated);
  };

  const toggleFavourite = (alt: SmartAlternative) => {
    if (isFavourite(alt.id)) {
      removeFavourite(alt.id);
    } else {
      addFavourite(alt);
    }
  };

  const favouriteIds = new Set(favourites.map((f) => f.id));

  return (
    <FavouritesContext.Provider
      value={{
        favourites,
        favouriteIds,
        isFavourite,
        addFavourite,
        removeFavourite,
        toggleFavourite,
      }}
    >
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = () => {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
};
