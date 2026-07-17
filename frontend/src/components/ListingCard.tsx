"use client";

import React, { useState } from 'react';
import { Listing } from '../types';
import { useApp } from '../context/AppContext';
import { Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { favorites, toggleFavorite } = useApp();
  const router = useRouter();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [showArrows, setShowArrows] = useState(false);

  const isFav = favorites.includes(listing.id);
  const hasMultipleImages = listing.images.length > 1;

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImgIndex((prev) => (prev + 1) % listing.images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImgIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(listing.id);
  };

  const handleCardClick = () => {
    router.push(`/listings/${listing.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer flex flex-col gap-3 transition"
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      {/* Image Gallery Container */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-sm">

        {/* Sliding image strip — moves horizontally via translateX */}
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentImgIndex * (100 / listing.images.length)}%)`,
            width: `${listing.images.length * 100}%`,
          }}
        >
          {listing.images.map((src, idx) => (
            <div
              key={idx}
              className="h-full flex-shrink-0"
              style={{ width: `${100 / listing.images.length}%` }}
            >
              <img
                src={src}
                alt={`${listing.title} photo ${idx + 1}`}
                className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavClick}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:scale-110 active:scale-95 transition-transform z-10"
        >
          <Heart
            className={`w-6 h-6 transition-colors duration-200 drop-shadow-sm ${
              isFav
                ? 'fill-rose-500 stroke-rose-500 stroke-2'
                : 'fill-black/30 stroke-white stroke-2 hover:fill-black/50'
            }`}
          />
        </button>

        {/* Prev Arrow — fades in from left on hover */}
        {hasMultipleImages && (
          <button
            onClick={handlePrevImage}
            className={`absolute left-2.5 top-1/2 -translate-y-1/2 bg-white text-zinc-800 p-1.5 rounded-full shadow-md z-10 transition-all duration-200 hover:scale-110 active:scale-95 ${
              showArrows ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 pointer-events-none'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        )}

        {/* Next Arrow — fades in from right on hover */}
        {hasMultipleImages && (
          <button
            onClick={handleNextImage}
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 bg-white text-zinc-800 p-1.5 rounded-full shadow-md z-10 transition-all duration-200 hover:scale-110 active:scale-95 ${
              showArrows ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-1 pointer-events-none'
            }`}
          >
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        )}

        {/* Dot Indicators — always visible, clickable */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {listing.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setCurrentImgIndex(index);
                }}
                className={`rounded-full transition-all duration-200 ${
                  index === currentImgIndex
                    ? 'bg-white w-2 h-2 scale-110'
                    : 'bg-white/55 hover:bg-white/80 w-1.5 h-1.5'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details info */}
      <div className="flex flex-col text-sm px-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-zinc-900 truncate dark:text-zinc-50">{listing.location}</h3>

          {/* Rating */}
          <div className="flex items-center gap-0.5 font-light text-zinc-700 dark:text-zinc-300 shrink-0">
            <Star className="w-3.5 h-3.5 fill-current text-zinc-900 dark:text-zinc-50" />
            <span className="font-normal">{listing.rating.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-zinc-500 font-light truncate mt-0.5 dark:text-zinc-400">{listing.title}</p>

        {/* Pricing */}
        <div className="mt-1.5 flex items-center gap-1">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">${listing.price_per_night}</span>
          <span className="text-zinc-500 font-light dark:text-zinc-400">night</span>
        </div>
      </div>
    </div>
  );
};
