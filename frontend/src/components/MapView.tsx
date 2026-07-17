"use client";

import React, { useState } from 'react';
import { Listing } from '../types';
import { useRouter } from 'next/navigation';
import { MapPin, Star, Plus, Minus, X } from 'lucide-react';

interface MapViewProps {
  listings: Listing[];
}

export const MapView: React.FC<MapViewProps> = ({ listings }) => {
  const router = useRouter();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [zoomLevel, setZoomLevel] = useState(11);

  // Filter out listings without coordinates, otherwise default to a spread around California / India
  // Map dimensions
  const width = 800;
  const height = 500;

  // Let's create a beautiful styled vector backdrop to represent land, streets, and water
  return (
    <div className="relative w-full h-[650px] bg-sky-50 dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-inner transition-colors duration-300">
      
      {/* Interactive Map Backdrop (Vector SVG representing land mass, rivers, roads) */}
      <svg className="absolute inset-0 w-full h-full text-zinc-100 dark:text-zinc-900 pointer-events-none" fill="currentColor">
        {/* Ocean/Water background is the sky-50 div, so we draw land masses */}
        {/* Land Mass 1 */}
        <path d="M 0,100 Q 150,80 300,180 T 600,120 T 900,200 L 900,650 L 0,650 Z" className="fill-zinc-100 dark:fill-zinc-900 transition-colors" />
        {/* Land Mass 2 */}
        <path d="M 400,0 Q 600,80 750,50 T 1200,90 L 1200,0 Z" className="fill-zinc-150 dark:fill-zinc-900 transition-colors" />
        
        {/* River/Waterway */}
        <path d="M 300,650 Q 320,500 240,400 T 500,200 T 400,0" fill="none" className="stroke-sky-200 dark:stroke-zinc-800" strokeWidth="24" />
        
        {/* Simulated Streets Grid (Thin lines representing city layout) */}
        <g className="stroke-white/40 dark:stroke-zinc-800/30" strokeWidth="2">
          {/* Horizontals */}
          <line x1="0" y1="150" x2="1200" y2="150" />
          <line x1="0" y1="280" x2="1200" y2="280" />
          <line x1="0" y1="420" x2="1200" y2="420" />
          <line x1="0" y1="560" x2="1200" y2="560" />
          {/* Verticals */}
          <line x1="200" y1="0" x2="200" y2="650" />
          <line x1="500" y1="0" x2="500" y2="650" />
          <line x1="850" y1="0" x2="850" y2="650" />
          <line x1="1050" y1="0" x2="1050" y2="650" />
        </g>
      </svg>

      {/* Floating Map Grid details */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-zinc-950/10 dark:to-black/30 pointer-events-none" />

      {/* Map Pin pricing tags */}
      <div className="absolute inset-0 overflow-hidden">
        {listings.map((listing, index) => {
          // Compute pseudo-random but deterministic percentage coordinates inside the view box 
          // based on listing ID to make it 100% responsive.
          let pctX = 15 + (listing.id * 23) % 70; // 15% to 85%
          let pctY = 15 + (listing.id * 17) % 70; // 15% to 85%

          // Apply slight zoom shifting
          const zoomOffsetMultiplier = (zoomLevel - 11);
          pctX += (pctX - 50) * zoomOffsetMultiplier * 0.05;
          pctY += (pctY - 50) * zoomOffsetMultiplier * 0.05;

          const isSelected = selectedListing?.id === listing.id;

          return (
            <button
              key={listing.id}
              onClick={() => setSelectedListing(listing)}
              style={{ left: `${pctX}%`, top: `${pctY}%` }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-md transition-all duration-200 select-none scale-100 active:scale-95 ${
                isSelected
                  ? 'bg-rose-500 text-white z-30 ring-2 ring-white scale-105'
                  : 'bg-white text-zinc-950 dark:bg-zinc-800 dark:text-zinc-100 hover:scale-105 hover:shadow-lg z-20 border border-zinc-200 dark:border-zinc-700'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>${listing.price_per_night}</span>
            </button>
          );
        })}
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
        <button
          onClick={() => setZoomLevel(prev => Math.min(13, prev + 1))}
          className="p-3 bg-white dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 hover:bg-zinc-50 border border-zinc-200 rounded-xl shadow-lg transition active:scale-95"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel(prev => Math.max(9, prev - 1))}
          className="p-3 bg-white dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 hover:bg-zinc-50 border border-zinc-200 rounded-xl shadow-lg transition active:scale-95"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Listing Floating Mini-Card */}
      {selectedListing && (
        <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-80 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 flex gap-4 animate-in slide-in-from-bottom-5 duration-250 z-30">
          <img
            src={selectedListing.images[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=300'}
            alt={selectedListing.title}
            className="w-24 h-24 rounded-xl object-cover flex-shrink-0 cursor-pointer"
            onClick={() => router.push(`/listings/${selectedListing.id}`)}
          />
          <div className="flex-grow flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider truncate">
                  {selectedListing.property_type || 'House'}
                </span>
                <span className="flex items-center gap-0.5 text-xs font-semibold flex-shrink-0">
                  <Star className="w-3 h-3 fill-rose-500 text-rose-500" />
                  {selectedListing.rating.toFixed(2)}
                </span>
              </div>
              <h4 
                onClick={() => router.push(`/listings/${selectedListing.id}`)}
                className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate hover:text-rose-500 transition cursor-pointer"
              >
                {selectedListing.title}
              </h4>
              <p className="text-zinc-500 text-xs truncate">{selectedListing.location}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                ${selectedListing.price_per_night} <span className="text-zinc-400 font-light text-[10px]">/ night</span>
              </span>
              <button
                onClick={() => router.push(`/listings/${selectedListing.id}`)}
                className="text-[10px] font-bold text-rose-500 hover:underline"
              >
                Details
              </button>
            </div>
          </div>
          <button
            onClick={() => setSelectedListing(null)}
            className="absolute top-2 right-2 p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
