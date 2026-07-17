"use client";

import React from 'react';
import { useApp } from '../context/AppContext';
import { Compass, Palmtree, Tent, Castle, Landmark, Grid } from 'lucide-react';

interface CategoryItem {
  name: string;
  label: string;
  icon: React.ComponentType<any>;
}

const CATEGORIES: CategoryItem[] = [
  { name: 'All', label: 'All homes', icon: Grid },
  { name: 'Icons', label: 'Icons', icon: Compass },
  { name: 'Beachfront', label: 'Beachfront', icon: Palmtree },
  { name: 'Cabins', label: 'Cabins', icon: Tent },
  { name: 'Mansions', label: 'Mansions', icon: Castle },
  { name: 'Countryside', label: 'Countryside', icon: Landmark },
];

export const CategoryBar: React.FC = () => {
  const { selectedCategory, setSelectedCategory } = useApp();

  return (
    <div className="bg-white border-b border-zinc-100 dark:bg-zinc-950 dark:border-zinc-900 sticky top-[77px] z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-start gap-8 overflow-x-auto no-scrollbar scroll-smooth">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.name;

          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex flex-col items-center gap-1.5 pb-2 border-b-2 transition group min-w-[56px] text-center ${
                isActive
                  ? 'border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50 font-medium'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:border-zinc-200 dark:hover:border-zinc-800'
              }`}
            >
              <Icon 
                className={`w-6 h-6 stroke-[1.5] transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? 'scale-105 text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-300'
                }`}
              />
              <span className="text-xs whitespace-nowrap tracking-wide">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
