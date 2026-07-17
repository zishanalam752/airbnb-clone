"use client";

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check } from 'lucide-react';

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AMENITIES_LIST = [
  'Wifi',
  'Pool',
  'Kitchen',
  'Air conditioning',
  'Hot tub',
  'Gym',
  'Beachfront',
  'Ocean view',
  'Mountain view',
  'Fireplace',
  'Pets allowed',
  'BBQ grill',
];

const PROPERTY_TYPES = ['House', 'Villa', 'Cabin', 'Mansion', 'Unique Space'];

export const FiltersModal: React.FC<FiltersModalProps> = ({ isOpen, onClose }) => {
  const { searchFilters, updateSearchFilters } = useApp();

  const [minPrice, setMinPrice] = useState<number | ''>(searchFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState<number | ''>(searchFilters.maxPrice || '');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(searchFilters.amenities || []);
  const [propertyType, setPropertyType] = useState<string>(searchFilters.propertyType || '');

  if (!isOpen) return null;

  const handleToggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((item) => item !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleApply = () => {
    updateSearchFilters({
      minPrice: minPrice === '' ? undefined : Number(minPrice),
      maxPrice: maxPrice === '' ? undefined : Number(maxPrice),
      amenities: selectedAmenities,
      propertyType: propertyType || undefined,
    });
    onClose();
  };

  const handleClear = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedAmenities([]);
    setPropertyType('');
    updateSearchFilters({
      minPrice: undefined,
      maxPrice: undefined,
      amenities: [],
      propertyType: undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-6 relative dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-150 dark:border-zinc-800">
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Filters</h2>
          <div className="w-8 h-8" /> {/* Spacer */}
        </div>

        {/* Content */}
        <div className="py-6 space-y-6 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
          
          {/* Price Range */}
          <div>
            <h3 className="font-semibold text-base mb-1">Price range</h3>
            <p className="text-zinc-500 text-xs font-light mb-4">Nightly prices before fees and taxes</p>
            
            <div className="flex items-center gap-4">
              <div className="flex-1 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 bg-zinc-50 dark:bg-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Minimum</span>
                <div className="flex items-center">
                  <span className="text-sm font-semibold mr-1">$</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="bg-transparent border-none outline-none w-full text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>
              <span className="text-zinc-400">—</span>
              <div className="flex-1 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 bg-zinc-50 dark:bg-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Maximum</span>
                <div className="flex items-center">
                  <span className="text-sm font-semibold mr-1">$</span>
                  <input
                    type="number"
                    placeholder="Any"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="bg-transparent border-none outline-none w-full text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property Type selection */}
          <div>
            <h3 className="font-semibold text-base mb-3">Property type</h3>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => {
                const isSelected = propertyType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPropertyType(isSelected ? '' : type)}
                    className={`px-4 py-2 rounded-xl text-sm border transition ${
                      isSelected
                        ? 'bg-rose-500 border-rose-500 text-white font-semibold'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-750 dark:text-zinc-200'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amenities filter */}
          <div>
            <h3 className="font-semibold text-base mb-3">Amenities</h3>
            <div className="grid grid-cols-2 gap-3">
              {AMENITIES_LIST.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button 
                    key={amenity}
                    type="button"
                    onClick={() => handleToggleAmenity(amenity)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left transition w-full"
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-rose-500 border-rose-500 text-white' 
                        : 'border-zinc-350 dark:border-zinc-600'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-sm font-light text-zinc-700 dark:text-zinc-300">{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-150 dark:border-zinc-800">
          <button
            onClick={handleClear}
            className="font-semibold text-sm hover:underline text-zinc-500"
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 font-semibold text-sm shadow transition dark:bg-rose-500 dark:text-white dark:hover:bg-rose-600"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
