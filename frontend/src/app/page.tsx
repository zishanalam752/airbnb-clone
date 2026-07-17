"use client";

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { CategoryBar } from '../components/CategoryBar';
import { ListingCard } from '../components/ListingCard';
import { FiltersModal } from '../components/FiltersModal';
import { MapView } from '../components/MapView';
import { useApp } from '../context/AppContext';
import { SlidersHorizontal, RotateCcw, Map as MapIcon, List as ListIcon } from 'lucide-react';

export default function Home() {
  const { listings, loadingListings, searchFilters, resetSearchFilters } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Check if search filters are active
  const hasActiveFilters = 
    searchFilters.location || 
    searchFilters.startDate || 
    searchFilters.endDate || 
    searchFilters.minPrice !== undefined || 
    searchFilters.maxPrice !== undefined;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Headers */}
      <Header />
      <CategoryBar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-6">
        
        {/* Extra controls row (Filters trigger + Active indicator) */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="text-zinc-500 font-light text-sm">
            {hasActiveFilters ? (
              <span className="flex items-center gap-2">
                Showing matching stays
                <button 
                  onClick={resetSearchFilters} 
                  className="flex items-center gap-1 text-rose-500 hover:text-rose-600 font-medium hover:underline text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear all search parameters
                </button>
              </span>
            ) : (
              <span>Over 10,000 homes worldwide</span>
            )}
          </div>

          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 border border-zinc-200 rounded-xl px-4 py-2.5 hover:bg-zinc-50 transition text-sm font-medium dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850"
          >
            <SlidersHorizontal className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            Filters
            {(searchFilters.minPrice !== undefined || searchFilters.maxPrice !== undefined) && (
              <span className="bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">1</span>
            )}
          </button>
        </div>

        {/* Listings Section */}
        {loadingListings ? (
          /* Premium Shimmer Loading Skeleton Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 animate-pulse">
                <div className="aspect-square w-full bg-zinc-250 dark:bg-zinc-800 rounded-2xl" />
                <div className="h-4 bg-zinc-250 dark:bg-zinc-800 rounded w-3/4 mt-1" />
                <div className="h-3 bg-zinc-250 dark:bg-zinc-800 rounded w-1/2" />
                <div className="h-4 bg-zinc-250 dark:bg-zinc-800 rounded w-1/4 mt-2" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          /* Empty Search Result State */
          <div className="flex flex-col items-center justify-center text-center py-20 px-4 max-w-md mx-auto">
            <div className="bg-zinc-100 dark:bg-zinc-900 p-5 rounded-full mb-6">
              <RotateCcw className="w-10 h-10 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">No exact matches</h3>
            <p className="text-zinc-500 font-light text-sm mb-6 leading-relaxed">
              Try changing or removing some of your filters or search constraints to see more options.
            </p>
            <button
              onClick={resetSearchFilters}
              className="px-6 py-3 bg-rose-500 text-white font-semibold rounded-xl hover:bg-rose-600 shadow transition text-sm"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : viewMode === 'map' ? (
          <MapView listings={listings} />
        ) : (
          /* Property Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {/* Floating Map Toggle Button */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
          <button
            onClick={() => setViewMode(prev => prev === 'list' ? 'map' : 'list')}
            className="flex items-center gap-2 bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 font-bold text-xs px-5 py-3 rounded-full hover:scale-105 active:scale-95 shadow-xl transition-all duration-200"
          >
            {viewMode === 'list' ? (
              <>
                <MapIcon className="w-4 h-4 fill-white dark:fill-zinc-950" />
                Show map
              </>
            ) : (
              <>
                <ListIcon className="w-4 h-4" />
                Show list
              </>
            )}
          </button>
        </div>
      </main>

      {/* Slide Filters Modal */}
      <FiltersModal isOpen={showFilters} onClose={() => setShowFilters(false)} />
    </div>
  );
}
