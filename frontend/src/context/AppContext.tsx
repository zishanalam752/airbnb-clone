"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Listing, SearchFilters } from '../types';
import { apiService } from '../services/api';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  users: User[];
  activeUser: User | null;
  role: 'guest' | 'host';
  listings: Listing[];
  loadingListings: boolean;
  favorites: number[];
  searchFilters: SearchFilters;
  selectedCategory: string;
  toasts: Toast[];
  changeActiveUser: (userId: number) => void;
  toggleRole: () => void;
  updateSearchFilters: (filters: Partial<SearchFilters>) => void;
  resetSearchFilters: () => void;
  setSelectedCategory: (category: string) => void;
  toggleFavorite: (listingId: number) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  refreshListings: () => void;
}

const defaultSearchFilters: SearchFilters = {
  location: '',
  startDate: '',
  endDate: '',
  guests: 1,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [role, setRole] = useState<'guest' | 'host'>('guest');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategoryState] = useState<string>('All');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(defaultSearchFilters);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load mock users from backend on mount
  useEffect(() => {
    async function loadUsers() {
      try {
        const usersList = await apiService.getUsers();
        setUsers(usersList);
        if (usersList.length > 0) {
          // Default to first user (John Host)
          const defaultUser = usersList[0];
          setActiveUser(defaultUser);
          setRole(defaultUser.role);
        }
      } catch (err) {
        console.error('Failed to load users', err);
      }
    }
    loadUsers();

    // Load favorites from local storage
    const storedFavs = localStorage.getItem('airbnb_clone_favorites');
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Fetch listings based on filters and category
  const fetchListings = async () => {
    setLoadingListings(true);
    try {
      const data = await apiService.getListings(searchFilters, selectedCategory);
      setListings(data);
    } catch (err: any) {
      addToast(err.message || 'Failed to load listings', 'error');
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [searchFilters, selectedCategory]);

  const changeActiveUser = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setActiveUser(user);
      setRole(user.role);
      addToast(`Switched user to ${user.name} (${user.role.toUpperCase()})`, 'info');
    }
  };

  const toggleRole = () => {
    const newRole = role === 'guest' ? 'host' : 'guest';
    setRole(newRole);
    addToast(`Switched workspace view to ${newRole.toUpperCase()}`, 'success');
  };

  const updateSearchFilters = (filters: Partial<SearchFilters>) => {
    setSearchFilters((prev) => ({ ...prev, ...filters }));
  };

  const resetSearchFilters = () => {
    setSearchFilters(defaultSearchFilters);
    setSelectedCategoryState('All');
  };

  const setSelectedCategory = (category: string) => {
    setSelectedCategoryState(category);
  };

  const toggleFavorite = (listingId: number) => {
    let updated: number[];
    if (favorites.includes(listingId)) {
      updated = favorites.filter((id) => id !== listingId);
      addToast('Removed from wishlists', 'info');
    } else {
      updated = [...favorites, listingId];
      addToast('Saved to wishlists', 'success');
    }
    setFavorites(updated);
    localStorage.setItem('airbnb_clone_favorites', JSON.stringify(updated));
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        users,
        activeUser,
        role,
        listings,
        loadingListings,
        favorites,
        searchFilters,
        selectedCategory,
        toasts,
        changeActiveUser,
        toggleRole,
        updateSearchFilters,
        resetSearchFilters,
        setSelectedCategory,
        toggleFavorite,
        addToast,
        removeToast,
        refreshListings: fetchListings,
      }}
    >
      {children}
      
      {/* Dynamic Toast Portal */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`cursor-pointer flex items-center justify-between p-4 rounded-xl shadow-lg border text-sm transition-all duration-300 transform translate-y-0 scale-100 hover:scale-102 ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-50'
                : toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-50'
                : 'bg-zinc-50 border-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50'
            }`}
          >
            <span>{toast.message}</span>
            <button className="ml-4 font-semibold text-xs opacity-75 hover:opacity-100">&times;</button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
