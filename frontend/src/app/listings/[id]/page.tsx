"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Listing, Review } from 'src/types';
import { apiService } from 'src/services/api';
import { useApp } from 'src/context/AppContext';
import { Header } from 'src/components/Header';
import { CheckoutModal } from 'src/components/CheckoutModal';
import CalendarPicker from 'src/components/CalendarPicker';
import { Star, MapPin, Calendar, Users, Shield, Award, HelpCircle, ArrowLeft, MessageSquare, Send, X } from 'lucide-react';
import Link from 'next/link';

export default function ListingDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { activeUser, addToast } = useApp();

  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Reservation Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guestsCount, setGuestsCount] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);

  // Chat Modal State
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'guest' | 'host'; text: string; time: string }>>([
    {
      sender: 'host',
      text: "Hi there! Feel free to ask any questions about your upcoming stay or my property. I'm happy to help!",
      time: 'Just now'
    }
  ]);

  // Fetch listing details
  const fetchDetails = async () => {
    if (!id) return;
    try {
      const data = await apiService.getListing(Number(id));
      setListing(data);
      const reviewsList = await apiService.getReviews(Number(id));
      setReviews(reviewsList);
    } catch (err: any) {
      addToast(err.message || 'Failed to load details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow max-w-5xl w-full mx-auto px-6 py-12 animate-pulse space-y-6">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
          <div className="aspect-video md:aspect-[21/9] w-full bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
            </div>
            <div className="h-60 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center py-20 px-6 text-center max-w-sm mx-auto">
          <h3 className="text-xl font-bold mb-2">Listing not found</h3>
          <p className="text-zinc-500 font-light mb-6">The listing you are looking for does not exist or has been deleted.</p>
          <Link href="/" className="px-6 py-2.5 bg-rose-500 text-white font-semibold rounded-xl hover:bg-rose-600 shadow transition text-sm">
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  // Calculate pricing breakdown
  let nights = 0;
  let subtotal = 0;
  let cleaningFee = 0;
  let serviceFee = 0;
  let total = 0;

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end > start) {
      nights = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
      subtotal = listing.price_per_night * nights;
      cleaningFee = Math.round(subtotal * 0.08);
      serviceFee = Math.round(subtotal * 0.12);
      total = subtotal + cleaningFee + serviceFee;
    }
  }

  // Date validation functions
  const isDateBooked = (dateStr: string) => {
    if (!listing.bookings) return false;
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    return listing.bookings.some((b) => {
      if (b.status !== 'confirmed') return false;
      const bStart = new Date(b.start_date);
      const bEnd = new Date(b.end_date);
      bStart.setHours(0, 0, 0, 0);
      bEnd.setHours(0, 0, 0, 0);
      return targetDate >= bStart && targetDate < bEnd;
    });
  };

  const checkOverlap = (startStr: string, endStr: string) => {
    if (!listing.bookings || !startStr || !endStr) return false;
    const s = new Date(startStr);
    const e = new Date(endStr);
    return listing.bookings.some((b) => {
      if (b.status !== 'confirmed') return false;
      const bStart = new Date(b.start_date);
      const bEnd = new Date(b.end_date);
      return s < bEnd && e > bStart;
    });
  };

  const isOverlap = checkOverlap(startDate, endDate);
  const isValidDateRange = startDate && endDate && new Date(endDate) > new Date(startDate) && !isOverlap;

  const handleReserveClick = () => {
    if (!activeUser) {
      addToast('Please select a mock user persona from the profile menu in the header first.', 'error');
      return;
    }
    if (!startDate || !endDate) {
      addToast('Please select Check-in and Check-out dates.', 'error');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      addToast('Check-out date must be after Check-in date.', 'error');
      return;
    }
    if (isOverlap) {
      addToast('These dates overlap with an existing booking. Please choose available dates.', 'error');
      return;
    }
    setShowCheckout(true);
  };

  // Image layout helper
  const imagesToShow = listing.images || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-8">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 mb-6 text-sm font-medium transition">
          <ArrowLeft className="w-4 h-4" /> Back to explore
        </Link>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">{listing.title}</h1>
          <div className="flex items-center gap-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-current text-zinc-900 dark:text-zinc-50" />
              {listing.rating.toFixed(2)}
            </span>
            <span>•</span>
            <span className="underline cursor-pointer">{listing.reviews_count} reviews</span>
            <span>•</span>
            <span className="underline cursor-pointer flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {listing.location}
            </span>
          </div>
        </div>

        {/* Dynamic Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 rounded-3xl overflow-hidden mb-8 aspect-video md:aspect-[21/9]">
          
          {/* Main big image */}
          <div className="md:col-span-2 h-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative">
            <img
              src={imagesToShow[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'}
              alt={listing.title}
              className="w-full h-full object-cover hover:scale-101 transition duration-300"
            />
          </div>

          {/* Sub grids */}
          <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-2.5 h-full">
            <div className="h-full bg-zinc-150 dark:bg-zinc-900 overflow-hidden">
              <img
                src={imagesToShow[1] || imagesToShow[0]}
                alt={listing.title}
                className="w-full h-full object-cover hover:scale-102 transition duration-300"
              />
            </div>
            <div className="h-full bg-zinc-150 dark:bg-zinc-900 overflow-hidden">
              <img
                src={imagesToShow[2] || imagesToShow[0]}
                alt={listing.title}
                className="w-full h-full object-cover hover:scale-102 transition duration-300"
              />
            </div>
            <div className="h-full bg-zinc-150 dark:bg-zinc-900 overflow-hidden">
              <img
                src={imagesToShow[3] || imagesToShow[0]}
                alt={listing.title}
                className="w-full h-full object-cover hover:scale-102 transition duration-300"
              />
            </div>
            <div className="h-full bg-zinc-150 dark:bg-zinc-900 overflow-hidden relative">
              <img
                src={imagesToShow[4] || imagesToShow[0]}
                alt={listing.title}
                className="w-full h-full object-cover hover:scale-102 transition duration-300"
              />
            </div>
          </div>
        </div>

        {/* Detailed Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Left Column: Details */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Host Section */}
            <div className="flex items-center justify-between pb-6 border-b border-zinc-150 dark:border-zinc-800">
              <div>
                <h2 className="text-xl font-bold mb-1">Entire place hosted by {listing.host.name}</h2>
                <p className="text-zinc-500 font-light text-sm mb-3">Role: {listing.host.role.toUpperCase()}</p>
                <button
                  onClick={() => setShowChatModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-zinc-350 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Contact Host
                </button>
              </div>
              <img
                src={listing.host.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'}
                alt={listing.host.name}
                className="w-12 h-12 rounded-full object-cover border"
              />
            </div>

            {/* Badges/Features */}
            <div className="space-y-4 pb-6 border-b border-zinc-150 dark:border-zinc-800">
              <div className="flex items-start gap-4">
                <Award className="w-6 h-6 text-zinc-500 mt-1" />
                <div>
                  <h4 className="font-semibold text-sm">Highly rated Host</h4>
                  <p className="text-zinc-500 text-xs font-light mt-0.5">This host receives 5-star ratings consistently.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-zinc-500 mt-1" />
                <div>
                  <h4 className="font-semibold text-sm">Self check-in</h4>
                  <p className="text-zinc-500 text-xs font-light mt-0.5">Check yourself in with the smart lock codes.</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pb-6 border-b border-zinc-150 dark:border-zinc-800">
              <h3 className="font-bold text-lg mb-3">About this space</h3>
              <p className="text-zinc-600 dark:text-zinc-300 font-light leading-relaxed text-sm whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="pb-6 border-b border-zinc-150 dark:border-zinc-800">
              <h3 className="font-bold text-lg mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {listing.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3 py-1 font-light text-zinc-700 dark:text-zinc-300">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability Calendar visual listing */}
            <div>
              <h3 className="font-bold text-lg mb-3">Calendar & Availability</h3>
              <p className="text-zinc-500 text-xs font-light mb-4">Disabled date ranges correspond to existing bookings.</p>
              
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl p-4">
                <span className="font-bold text-xs uppercase text-zinc-400 block mb-2">Booked Dates Table</span>
                {listing.bookings && listing.bookings.filter(b => b.status === 'confirmed').length > 0 ? (
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {listing.bookings
                      .filter(b => b.status === 'confirmed')
                      .map((b, i) => (
                        <div key={i} className="py-2 flex items-center justify-between text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            Booked
                          </span>
                          <span>{b.start_date} to {b.end_date}</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-xs font-light py-2">No bookings for this listing yet. Be the first!</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Floating reservation card */}
          <div>
            <div className="sticky top-[150px] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl bg-white dark:bg-zinc-900 transition-shadow hover:shadow-2xl">
              <div className="flex justify-between items-baseline mb-4">
                <div>
                  <span className="text-xl font-bold">${listing.price_per_night}</span>
                  <span className="text-zinc-500 text-sm font-light dark:text-zinc-400"> night</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium">
                  <Star className="w-3.5 h-3.5 fill-current text-zinc-900 dark:text-zinc-50" />
                  <span>{listing.rating.toFixed(2)}</span>
                </div>
              </div>

              {/* Calendar Date Picker */}
              <div className="mb-4">
                <CalendarPicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  twoMonths={false}
                />
              </div>

              {/* Guests */}
              <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 flex items-center gap-3">
                <Users className="w-4 h-4 text-zinc-400 shrink-0" />
                <div className="flex-1">
                  <label className="text-[9px] uppercase font-black text-zinc-900 dark:text-zinc-100 block mb-0.5">Guests</label>
                  <select
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Number(e.target.value))}
                    className="w-full text-sm font-light bg-transparent outline-none text-zinc-700 dark:text-zinc-300"
                  >
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <option key={g} value={g} className="text-zinc-800">
                        {g} guest{g > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>


              {/* Error messages */}
              {isOverlap && (
                <div className="mt-3 text-rose-500 text-xs font-semibold bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-lg border border-rose-250 dark:border-rose-900">
                  ⚠️ Selected dates overlap with an existing booking. Please check availability.
                </div>
              )}

              {/* Reserve button */}
              <button
                onClick={handleReserveClick}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-xl transition duration-150 shadow-md text-sm mt-4"
              >
                Reserve
              </button>
              
              <p className="text-zinc-500 text-[11px] text-center font-light mt-3">You won't be charged yet</p>

              {/* Interactive pricing breakdown details */}
              {isValidDateRange && (
                <div className="space-y-3 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                  <div className="flex items-center justify-between text-zinc-650 dark:text-zinc-400 font-light">
                    <span className="underline">${listing.price_per_night} x {nights} nights</span>
                    <span>${subtotal}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-650 dark:text-zinc-400 font-light">
                    <span className="underline">Cleaning fee</span>
                    <span>${cleaningFee}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-650 dark:text-zinc-400 font-light">
                    <span className="underline">Airbnb service fee</span>
                    <span>${serviceFee}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold pt-3 border-t border-zinc-200 dark:border-zinc-800 text-sm">
                    <span>Total before taxes</span>
                    <span>${total}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews List Section */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 fill-current text-zinc-900 dark:text-zinc-50" />
            <span>{listing.rating.toFixed(2)} • {listing.reviews_count} reviews</span>
          </h2>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reviews.map((review) => (
                <div key={review.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.author.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'}
                      alt={review.author.name}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div>
                      <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">{review.author.name}</h4>
                      <p className="text-[10px] text-zinc-500 font-light">
                        Rating: {Array.from({ length: review.rating }).map((_, i) => '★').join('')}
                      </p>
                    </div>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300 font-light text-xs leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm font-light">No reviews for this listing yet.</p>
          )}
        </div>
      </main>

      {/* Checkout Payment Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        listing={listing}
        startDate={startDate}
        endDate={endDate}
        guestsCount={guestsCount}
        onBookingSuccess={() => {
          fetchDetails(); // Reload page bookings to disable the newly booked dates
          router.push('/trips'); // Send user to My Trips to see bookings
        }}
      />

      {/* Interactive Chat with Host Modal */}
      {showChatModal && listing && (
        <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-150 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <img
                  src={listing.host.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'}
                  alt={listing.host.name}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Chat with {listing.host.name}</h3>
                  <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowChatModal(false)}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="py-4 my-2 h-72 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {chatHistory.map((msg, index) => {
                const isGuest = msg.sender === 'guest';
                return (
                  <div key={index} className={`flex ${isGuest ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-xs font-light shadow-xs leading-relaxed ${
                      isGuest 
                        ? 'bg-rose-500 text-white rounded-tr-none' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-805 dark:text-zinc-200 rounded-tl-none'
                    }`}>
                      <p>{msg.text}</p>
                      <span className={`block text-[9px] mt-1 text-right ${isGuest ? 'text-rose-200' : 'text-zinc-400'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Footer */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatMessage.trim()) return;
                
                const userMsg = chatMessage.trim();
                const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                setChatHistory(prev => [...prev, { sender: 'guest', text: userMsg, time: nowTime }]);
                setChatMessage('');

                // Auto host response simulator
                setTimeout(() => {
                  setChatHistory(prev => [...prev, {
                    sender: 'host',
                    text: `Thanks for writing! I've received your question: "${userMsg}". I will review this and respond to you as soon as possible.`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }]);
                }, 1000);
              }}
              className="flex items-center gap-2 pt-3 border-t border-zinc-150 dark:border-zinc-800"
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-grow border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs outline-none bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
              <button
                type="submit"
                className="p-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition shadow flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
