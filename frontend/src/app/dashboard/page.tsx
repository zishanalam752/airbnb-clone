"use client";

import React, { useEffect, useState } from 'react';
import { useApp } from 'src/context/AppContext';
import { apiService } from 'src/services/api';
import { Listing, Booking } from 'src/types';
import { Header } from 'src/components/Header';
import { Plus, Edit2, Trash2, Home, Landmark, Users, ArrowUpRight, X, Image as ImageIcon } from 'lucide-react';

const CATEGORIES = ['Icons', 'Beachfront', 'Cabins', 'Mansions', 'Countryside'];

const AMENITIES_PRESETS = [
  'Wifi', 'Pool', 'Kitchen', 'Air conditioning', 'Hot tub', 'Gym', 
  'Beachfront', 'Ocean view', 'Mountain view', 'Fireplace', 'Pets allowed', 'BBQ grill'
];

export default function HostDashboard() {
  const { activeUser, role, addToast, refreshListings } = useApp();
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myReservations, setMyReservations] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Listing Form Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Beachfront');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [propertyType, setPropertyType] = useState('House');
  const [submitting, setSubmitting] = useState(false);

  const fetchHostData = async () => {
    if (!activeUser) return;
    try {
      // Get all listings
      const allListings = await apiService.getListings();
      // Filter those owned by this host
      const hostListings = allListings.filter(l => l.host_id === activeUser.id);
      setMyListings(hostListings);

      // Get bookings for host listings
      const hostBookings = await apiService.getBookings('host', activeUser.id);
      setMyReservations(hostBookings);
    } catch (err: any) {
      addToast(err.message || 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeUser && role === 'host') {
      fetchHostData();
    } else {
      setLoading(false);
    }
  }, [activeUser, role]);

  const handleOpenCreateModal = () => {
    setEditingListing(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setLocation('');
    setCategory('Beachfront');
    setPropertyType('House');
    setImageUrls(['']);
    setSelectedAmenities([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (listing: Listing) => {
    setEditingListing(listing);
    setTitle(listing.title);
    setDescription(listing.description);
    setPrice(listing.price_per_night);
    setLocation(listing.location);
    setCategory(listing.category);
    setPropertyType(listing.property_type || 'House');
    setImageUrls(listing.images.length > 0 ? listing.images : ['']);
    setSelectedAmenities(listing.amenities);
    setIsModalOpen(true);
  };

  const handleAmenityToggle = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(prev => prev.filter(a => a !== amenity));
    } else {
      setSelectedAmenities(prev => [...prev, amenity]);
    }
  };

  const handleAddImageUrl = () => {
    setImageUrls(prev => [...prev, '']);
  };

  const handleRemoveImageUrl = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUrlChange = (index: number, value: string) => {
    setImageUrls(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) {
      addToast('You must be logged in as a host to list a property.', 'error');
      return;
    }
    if (!title.trim() || !description.trim() || !location.trim()) {
      addToast('Please fill in all text fields.', 'error');
      return;
    }

    const filteredImages = imageUrls.filter(url => url.trim() !== '');
    if (filteredImages.length === 0) {
      addToast('Please enter at least one photo URL.', 'error');
      return;
    }

    if (!price || price <= 0) {
      addToast('Price must be greater than zero.', 'error');
      return;
    }

    setSubmitting(true);
    const listingPayload = {
      title,
      description,
      price_per_night: Number(price),
      location,
      category,
      property_type: propertyType,
      amenities: selectedAmenities,
      images: filteredImages,
    };

    try {
      if (editingListing) {
        await apiService.updateListing(editingListing.id, listingPayload, activeUser.id);
        addToast('Property updated successfully!', 'success');
      } else {
        await apiService.createListing(listingPayload, activeUser.id);
        addToast('Property listed successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchHostData();
      refreshListings();
    } catch (err: any) {
      addToast(err.message || 'Failed to save property listing', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteListing = async (listingId: number) => {
    if (!activeUser) return;
    if (window.confirm('Are you sure you want to delete this listing? This will also delete related bookings.')) {
      try {
        await apiService.deleteListing(listingId, activeUser.id);
        addToast('Listing deleted successfully.', 'success');
        fetchHostData();
        refreshListings();
      } catch (err: any) {
        addToast(err.message || 'Failed to delete listing.', 'error');
      }
    }
  };

  // Metrics calculations
  const totalRevenue = myReservations
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.total_price, 0);

  if (!activeUser || role !== 'host') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center py-20 px-6 text-center max-w-sm mx-auto">
          <h3 className="text-xl font-bold mb-2">Access Denied</h3>
          <p className="text-zinc-500 font-light mb-6">
            The host dashboard is only available when you are logged in as a host persona. Switch users or toggles in the top menu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-10">
        
        {/* Top Header Controls */}
        <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black mb-1">Host Dashboard</h1>
            <p className="text-zinc-500 font-light text-sm">Manage your properties and active client bookings</p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition shadow flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Create Listing
          </button>
        </div>

        {/* Business Metrics widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="border border-zinc-150 rounded-2xl p-6 shadow-xs bg-white dark:bg-zinc-900 dark:border-zinc-800">
            <span className="text-xs uppercase font-bold text-zinc-400 block mb-1">Active Listings</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{myListings.length}</span>
              <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                <Home className="w-5 h-5 text-zinc-500" />
              </div>
            </div>
          </div>
          <div className="border border-zinc-150 rounded-2xl p-6 shadow-xs bg-white dark:bg-zinc-900 dark:border-zinc-800">
            <span className="text-xs uppercase font-bold text-zinc-400 block mb-1">Total Reservations</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{myReservations.filter(r => r.status === 'confirmed').length}</span>
              <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                <Users className="w-5 h-5 text-zinc-500" />
              </div>
            </div>
          </div>
          <div className="border border-zinc-150 rounded-2xl p-6 shadow-xs bg-white dark:bg-zinc-900 dark:border-zinc-800">
            <span className="text-xs uppercase font-bold text-zinc-400 block mb-1">Total Revenue</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-emerald-500">${totalRevenue}</span>
              <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                <ArrowUpRight className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Two Section layouts */}
        <div className="space-y-12">
          
          {/* Listings List */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Home className="w-5 h-5" /> Your Properties
            </h2>
            
            {loading ? (
              <div className="h-32 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            ) : myListings.length === 0 ? (
              <div className="border border-dashed border-zinc-300 rounded-2xl p-12 text-center text-zinc-500 font-light dark:border-zinc-800">
                You haven't listed any properties yet. Click "Create Listing" to list your first one!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {myListings.map((listing) => (
                  <div key={listing.id} className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
                    <img src={listing.images[0]} alt={listing.title} className="h-40 w-full object-cover" />
                    
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 font-bold uppercase tracking-wider">
                          {listing.category}
                        </span>
                        <h4 className="font-semibold text-sm mt-2 truncate">{listing.title}</h4>
                        <p className="text-xs text-zinc-500 mt-0.5">{listing.location}</p>
                        <p className="text-sm font-bold mt-2">${listing.price_per_night} <span className="text-xs text-zinc-400 font-light">/ night</span></p>
                      </div>

                      <div className="flex gap-2.5 border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-4">
                        <button
                          onClick={() => handleOpenEditModal(listing)}
                          className="flex-1 py-2 px-3 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-lg text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-850 flex items-center justify-center gap-1.5 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteListing(listing.id)}
                          className="py-2 px-3 border border-rose-100 text-rose-500 rounded-lg text-xs font-semibold hover:bg-rose-50/50 dark:border-rose-950 dark:hover:bg-rose-950/20 flex items-center justify-center gap-1.5 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bookings Reservatios table */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Landmark className="w-5 h-5" /> Incoming Reservations
            </h2>
            
            {loading ? (
              <div className="h-32 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            ) : myReservations.length === 0 ? (
              <div className="border border-dashed border-zinc-300 rounded-2xl p-12 text-center text-zinc-500 font-light dark:border-zinc-800">
                No active reservations from guests for your properties yet.
              </div>
            ) : (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                      <th className="p-4">Guest</th>
                      <th className="p-4">Property</th>
                      <th className="p-4">Dates</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Income</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850">
                    {myReservations.map((booking) => (
                      <tr key={booking.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/50">
                        <td className="p-4 flex items-center gap-2">
                          <img src={booking.guest.avatar_url} className="w-6 h-6 rounded-full object-cover border" />
                          <span className="font-semibold">{booking.guest.name}</span>
                        </td>
                        <td className="p-4 font-semibold max-w-[150px] truncate">{booking.listing.title}</td>
                        <td className="p-4 font-light text-zinc-500">{booking.start_date} to {booking.end_date}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-rose-50 text-rose-500 dark:bg-rose-950/20'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-4 font-bold">${booking.total_price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Create / Edit Form Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-6 relative dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-150 dark:border-zinc-800">
                <h3 className="text-lg font-bold">{editingListing ? 'Edit Property Details' : 'List your home on Airbnb'}</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Scroll Container */}
              <form onSubmit={handleSubmit} className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
                
                {/* Title */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    placeholder="e.g. Cozy A-Frame with Hot Tub"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe the unique features of your home..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {/* Price and Location and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Price per night (USD)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      placeholder="150"
                      value={price}
                      onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Location</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Malibu, California"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Property Type</label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    >
                      {['House', 'Villa', 'Cabin', 'Mansion', 'Unique Space'].map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Image URLs */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-zinc-400" /> Photo URLs
                    </label>
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="text-rose-500 font-bold hover:underline text-[10px]"
                    >
                      + Add Photo URL
                    </button>
                  </div>
                  {imageUrls.map((url, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="url"
                        required
                        placeholder="https://images.unsplash.com/photo-..."
                        value={url}
                        onChange={(e) => handleImageUrlChange(index, e.target.value)}
                        className="flex-grow border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs outline-none bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                      {imageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImageUrl(index)}
                          className="p-2 border border-rose-200 hover:bg-rose-50 rounded-xl text-rose-500 transition text-xs dark:border-rose-950 dark:hover:bg-rose-950/20"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Amenities checklist checkboxes */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-2">Amenities</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AMENITIES_PRESETS.map((amenity) => {
                      const isChecked = selectedAmenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => handleAmenityToggle(amenity)}
                          className={`flex items-center justify-start gap-2.5 p-2 px-3 border rounded-xl text-xs font-light text-left transition ${
                            isChecked 
                              ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                              : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-500'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                            isChecked ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950' : 'border-zinc-350'
                          }`}>
                            {isChecked && <div className="w-1.5 h-1.5 bg-current rounded-full" />}
                          </div>
                          <span>{amenity}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-150 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 border border-zinc-200 rounded-xl hover:bg-zinc-50 text-xs font-semibold transition dark:border-zinc-850 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-350 text-white font-bold rounded-xl text-xs shadow transition flex items-center justify-center min-w-[80px]"
                  >
                    {submitting ? 'Saving...' : 'Save Property'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
