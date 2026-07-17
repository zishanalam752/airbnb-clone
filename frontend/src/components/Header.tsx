"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Globe, Menu, User as UserIcon, Users, MapPin, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CalendarPicker from './CalendarPicker';
import { apiService } from '../services/api';

export const Header: React.FC = () => {
  const {
    users,
    activeUser,
    role,
    changeActiveUser,
    toggleRole,
    searchFilters,
    updateSearchFilters,
  } = useApp();

  const router = useRouter();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Search fields state
  const [location, setLocation] = useState(searchFilters.location);
  const [startDate, setStartDate] = useState(searchFilters.startDate);
  const [endDate, setEndDate] = useState(searchFilters.endDate);
  const [guests, setGuests] = useState(searchFilters.guests);

  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [showLocationsDropdown, setShowLocationsDropdown] = useState(false);

  useEffect(() => {
    if (showSearchModal) {
      apiService.getLocations()
        .then(locs => setAvailableLocations(locs))
        .catch(err => console.error("Failed to fetch locations", err));
    }
  }, [showSearchModal]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchFilters({
      location,
      startDate,
      endDate,
      guests,
    });
    setShowSearchModal(false);
    router.push('/');
  };

  const handleClearFilters = () => {
    setLocation('');
    setStartDate('');
    setEndDate('');
    setGuests(1);
    updateSearchFilters({
      location: '',
      startDate: '',
      endDate: '',
      guests: 1,
    });
    setShowSearchModal(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-zinc-100 px-6 py-4 shadow-sm dark:bg-zinc-950 dark:border-zinc-900 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-rose-500 font-bold text-2xl tracking-tight">
          <svg
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
            className="w-9 h-9 fill-current"
          >
            <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533.981 1.637 3.109c.382.726.786 1.493 1.215 2.302.26.49.528.995.805 1.515C26.541 15.19 28.5 18.57 28.5 22c0 4.887-3.963 8.5-8.5 8.5-2.222 0-4.148-1.042-5.751-2.906-.113-.131-.225-.262-.335-.395a12.012 12.012 0 0 1-.928-1.28c-1.393 1.83-3.13 2.946-5.186 2.946-4.537 0-8.5-3.613-8.5-8.5 0-3.43 1.959-6.81 5.093-12.824.277-.52.545-1.025.805-1.515.429-.809.833-1.576 1.215-2.302l1.637-3.109.533-.981C12.537 1.963 13.992 1 16 1zm0 2c-1.239 0-2.053.539-3.003 2.231l-.514.947-1.634 3.104c-.382.725-.785 1.491-1.214 2.3-.261.49-.529.996-.807 1.517C5.727 19.123 4.5 21.603 4.5 22c0 3.65 3.018 6.5 6.5 6.5 1.705 0 2.981-.884 4.095-2.454l.092-.132.327-.478c.328-.485.641-.989.943-1.511.022-.038.045-.076.068-.113.04-.066.079-.133.118-.2a.75.75 0 0 1 1.292.001c.039.066.078.132.118.199.023.037.046.075.068.113.302.522.615 1.026.943 1.511l.327.478c1.114 1.57 2.39 2.454 4.095 2.454 3.482 0 6.5-2.85 6.5-6.5 0-.397-1.227-2.877-4.328-8.883-.278-.521-.546-1.027-.807-1.517-.429-.809-.832-1.575-1.214-2.3L19.517 5.18l-.514-.948C18.053 3.539 17.239 3 16 3zm0 13.5c1.928 0 3.5 1.572 3.5 3.5s-1.572 3.5-3.5 3.5-3.5-1.572-3.5-3.5 1.572-3.5 3.5-3.5zm0 1.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
          <span className="hidden md:inline font-black text-xl tracking-tighter">airbnb</span>
        </Link>

        {/* Search Pills */}
        <div
          onClick={() => setShowSearchModal(true)}
          className="flex items-center border border-zinc-200 rounded-full py-2 pl-4 sm:pl-6 pr-2 shadow-sm hover:shadow-md cursor-pointer transition max-w-lg flex-1 dark:border-zinc-800 dark:bg-zinc-900"
        >
          {/* Desktop/Tablet 3-column split view */}
          <div className="hidden sm:grid flex-1 grid-cols-3 text-xs divide-x divide-zinc-200 dark:divide-zinc-800 text-left">
            <div className="pr-2 truncate">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">Where</span>
              <span className="text-zinc-500 font-light truncate">{searchFilters.location || 'Anywhere'}</span>
            </div>
            <div className="px-3 truncate">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">When</span>
              <span className="text-zinc-500 font-light truncate">
                {searchFilters.startDate ? `${searchFilters.startDate} to ${searchFilters.endDate || ''}` : 'Any week'}
              </span>
            </div>
            <div className="pl-3 truncate">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">Who</span>
              <span className="text-zinc-500 font-light">
                {searchFilters.guests ? `${searchFilters.guests} guest${searchFilters.guests > 1 ? 's' : ''}` : 'Add guests'}
              </span>
            </div>
          </div>

          {/* Mobile simple view */}
          <div className="flex sm:hidden flex-1 text-xs text-left px-1 truncate">
            <span className="font-semibold text-zinc-850 dark:text-zinc-250 truncate">
              {searchFilters.location || 'Anywhere'} • {searchFilters.startDate ? 'Selected dates' : 'Any week'} • {searchFilters.guests ? `${searchFilters.guests} guests` : 'Add guests'}
            </span>
          </div>

          <div className="bg-rose-500 text-white p-2.5 rounded-full hover:bg-rose-600 transition flex items-center justify-center ml-2 flex-shrink-0">
            <Search className="w-4 h-4" />
          </div>
        </div>

        {/* Right Nav */}
        <div className="flex items-center gap-3">

          {/* Dashboard Toggle / Host mode */}
          {activeUser?.role === 'host' && (
            <Link
              href={role === 'host' ? '/dashboard' : '/'}
              onClick={() => {
                if (role !== 'host') {
                  toggleRole(); // toggle active app state view
                }
              }}
              className="hidden lg:block font-medium text-sm py-2.5 px-4 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              Host Dashboard
            </Link>
          )}

          {role === 'host' && (
            <Link
              href="/"
              onClick={toggleRole}
              className="hidden lg:block font-semibold text-rose-500 text-sm py-2.5 px-4 rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 transition"
            >
              Switch to Guest View
            </Link>
          )}

          {/* User selector & menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1 sm:gap-3 border border-zinc-200 rounded-full p-1 sm:p-2 hover:shadow-md transition bg-white dark:border-zinc-800 dark:bg-zinc-900 flex-shrink-0"
            >
              <Menu className="w-5 h-5 text-zinc-500 ml-1 hidden sm:block" />
              {activeUser?.avatar_url ? (
                <img
                  src={activeUser.avatar_url}
                  alt={activeUser.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 bg-zinc-200 rounded-full flex items-center justify-center dark:bg-zinc-800">
                  <UserIcon className="w-4 h-4 text-zinc-600" />
                </div>
              )}
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-2.5 w-64 bg-white rounded-2xl shadow-xl border border-zinc-100 py-3 text-zinc-800 z-50 text-sm dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200">
                <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="block font-semibold">{activeUser?.name}</span>
                  <span className="block text-xs text-zinc-400 truncate">{activeUser?.email}</span>
                  <span className="mt-1.5 inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    Active Persona: {role.toUpperCase()}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    href="/trips"
                    className="block px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                    onClick={() => setShowUserMenu(false)}
                  >
                    My Trips (Bookings)
                  </Link>
                  {activeUser?.role === 'host' && (
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition font-medium text-rose-500"
                      onClick={() => {
                        if (role !== 'host') toggleRole();
                        setShowUserMenu(false);
                      }}
                    >
                      Host Dashboard
                    </Link>
                  )}
                </div>

                {/* Persona Switcher Section */}
                <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="px-4 py-1 text-xs text-zinc-400 block font-semibold">Switch User Account</span>
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        changeActiveUser(user.id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition flex items-center gap-2 ${activeUser?.id === user.id ? 'font-bold text-rose-500 bg-rose-50/50 dark:bg-rose-950/20' : ''
                        }`}
                    >
                      <img src={user.avatar_url} className="w-5 h-5 rounded-full object-cover" />
                      <div className="flex-1 truncate">
                        <span className="block leading-tight text-xs">{user.name}</span>
                        <span className="text-[10px] text-zinc-400 leading-tight">({user.role})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Search Modal */}
      {showSearchModal && (
        <div 
          onClick={() => setShowSearchModal(false)}
          className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4 transition-opacity cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-6 relative dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto cursor-default"
          >
            <button
              onClick={() => setShowSearchModal(false)}
              className="absolute right-6 top-6 p-1.5 hover:bg-zinc-100 rounded-full transition dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">Find your next stay</h2>

            <form onSubmit={handleSearchSubmit} className="space-y-4">
              {/* Location Input */}
              <div className="relative">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Destination</label>
                <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 bg-zinc-50 dark:bg-zinc-800 relative z-50">
                  <MapPin className="w-5 h-5 text-zinc-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Search destinations (e.g. Malibu, Big Bear, Provence)"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setShowLocationsDropdown(true);
                    }}
                    onFocus={() => setShowLocationsDropdown(true)}
                    className="bg-transparent border-none outline-none w-full text-sm text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {showLocationsDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowLocationsDropdown(false)} />
                    <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-700">
                      {availableLocations.filter(loc =>
                        loc.toLowerCase().includes((location || '').toLowerCase())
                      ).length > 0 ? (
                        availableLocations.filter(loc =>
                          loc.toLowerCase().includes((location || '').toLowerCase())
                        ).map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => {
                              setLocation(loc);
                              setShowLocationsDropdown(false);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 text-sm transition text-zinc-800 dark:text-zinc-200 first:rounded-t-2xl last:rounded-b-2xl"
                          >
                            <MapPin className="w-4 h-4 text-zinc-400" />
                            <span>{loc}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-zinc-400 dark:text-zinc-500">
                          No matching locations found
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Calendar Date Range Picker */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">Dates</label>
                <CalendarPicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  twoMonths={true}
                />
              </div>

              {/* Guest Count */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Guests</label>
                <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 bg-zinc-50 dark:bg-zinc-800">
                  <Users className="w-5 h-5 text-zinc-400 mr-3" />
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                    className="bg-transparent border-none outline-none w-full text-sm text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="font-semibold text-sm hover:underline text-zinc-500"
                >
                  Clear all filters
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSearchModal(false)}
                    className="px-5 py-2.5 border border-zinc-200 rounded-xl hover:bg-zinc-50 text-sm font-semibold transition dark:border-zinc-800 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 font-semibold text-sm shadow transition flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
