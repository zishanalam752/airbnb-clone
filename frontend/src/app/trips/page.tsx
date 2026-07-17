"use client";

import React, { useEffect, useState } from 'react';
import { useApp } from 'src/context/AppContext';
import { apiService } from 'src/services/api';
import { Booking } from 'src/types';
import { Header } from 'src/components/Header';
import { Star, Calendar, MapPin, DollarSign, MessageSquare, Trash, Compass } from 'lucide-react';
import Link from 'next/link';

export default function TripsPage() {
  const { activeUser, addToast } = useApp();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchBookings = async () => {
    if (!activeUser) return;
    try {
      const data = await apiService.getBookings('guest', activeUser.id);
      // Sort bookings: upcoming first
      setBookings(data);
    } catch (err: any) {
      addToast(err.message || 'Failed to load trips', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeUser) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [activeUser]);

  const handleCancelBooking = async (bookingId: number) => {
    if (!activeUser) return;
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await apiService.cancelBooking(bookingId, activeUser.id);
        addToast('Booking successfully cancelled.', 'success');
        fetchBookings();
      } catch (err: any) {
        addToast(err.message || 'Failed to cancel booking', 'error');
      }
    }
  };

  const handleOpenReview = (booking: Booking) => {
    setSelectedBooking(booking);
    setRating(5);
    setComment('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser || !selectedBooking) return;

    setSubmittingReview(true);
    try {
      await apiService.createReview(
        {
          listing_id: selectedBooking.listing_id,
          rating,
          comment,
        },
        activeUser.id
      );
      addToast('Review submitted successfully!', 'success');
      setShowReviewModal(false);
    } catch (err: any) {
      addToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-10">
        <h1 className="text-3xl font-black mb-1">Trips</h1>
        <p className="text-zinc-500 font-light text-sm mb-8">All your reservations and mock booking experiences</p>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-40 bg-zinc-100 rounded-2xl w-full" />
            <div className="h-40 bg-zinc-100 rounded-2xl w-full" />
          </div>
        ) : !activeUser ? (
          <div className="text-center py-20 bg-zinc-50 rounded-3xl p-6 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800">
            <h3 className="font-bold text-lg mb-2">No active persona</h3>
            <p className="text-zinc-500 text-sm font-light mb-4">Please choose a mock user profile in the top-right menu to see trips.</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900 rounded-3xl p-8 max-w-md mx-auto border border-zinc-150 dark:border-zinc-800">
            <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-6">
              <Compass className="w-7 h-7 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">No trips booked... yet!</h3>
            <p className="text-zinc-500 text-sm font-light mb-6">
              Time to dust off your bags and start planning your next adventure.
            </p>
            <Link href="/" className="px-6 py-3 bg-zinc-950 text-white rounded-xl hover:bg-zinc-800 font-semibold text-sm transition dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 shadow">
              Start searching
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const start = new Date(booking.start_date);
              const end = new Date(booking.end_date);
              const isPast = new Date() > end;

              return (
                <div 
                  key={booking.id}
                  className={`border rounded-2xl overflow-hidden flex flex-col md:flex-row transition bg-white dark:bg-zinc-900 dark:border-zinc-800 hover:shadow-md ${
                    booking.status === 'cancelled' ? 'opacity-60 border-dashed border-zinc-350' : 'border-zinc-200'
                  }`}
                >
                  {/* Property Image */}
                  <img
                    src={booking.listing.images[0]}
                    alt={booking.listing.title}
                    className="w-full md:w-56 h-48 md:h-auto object-cover"
                  />

                  {/* Booking Details */}
                  <div className="flex-grow p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-rose-500 block mb-1">
                            {booking.status.toUpperCase()}
                          </span>
                          <h3 className="font-bold text-lg leading-snug">{booking.listing.title}</h3>
                          <span className="text-xs text-zinc-500 font-light flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5" /> {booking.listing.location}
                          </span>
                        </div>
                        {booking.status === 'confirmed' && (
                          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                            ${booking.total_price}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-light text-zinc-650 dark:text-zinc-400 mt-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-zinc-400" />
                          <div>
                            <span className="font-semibold block text-[10px] text-zinc-400">DATES</span>
                            <span>{booking.start_date} to {booking.end_date}</span>
                          </div>
                        </div>
                        <div>
                          <span className="font-semibold block text-[10px] text-zinc-400">GUESTS</span>
                          <span>{booking.guests_count} guest{booking.guests_count > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Actions */}
                    <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-6">
                      <span className="text-xs text-zinc-400 font-light">
                        Hosted by {booking.listing.host.name}
                      </span>

                      {booking.status === 'confirmed' && (
                        <div className="flex gap-3">
                          {isPast ? (
                            <button
                              onClick={() => handleOpenReview(booking)}
                              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow flex items-center gap-1.5 transition"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Write Review
                            </button>
                          ) : (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="px-4 py-2 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition dark:border-rose-950 dark:hover:bg-rose-950/20"
                            >
                              <Trash className="w-3.5 h-3.5" />
                              Cancel Stay
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Review Composer Modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/55 z-[999] flex items-center justify-center p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold mb-1">Write a Review</h2>
            <p className="text-zinc-500 text-xs font-light mb-4">Share your stay experience at {selectedBooking.listing.title}</p>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Rating Selector */}
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Rating</label>
                <div className="flex items-center gap-2 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 active:scale-95 transition"
                    >
                      <Star className={`w-7 h-7 ${star <= rating ? 'fill-current' : 'text-zinc-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Review Details</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us about the location, cleanliness, host interaction, etc."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none bg-zinc-50 dark:bg-zinc-800"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-5 py-2.5 border border-zinc-200 rounded-xl hover:bg-zinc-50 text-xs font-semibold transition dark:border-zinc-850 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-350 text-white font-semibold rounded-xl text-xs shadow transition flex items-center gap-1.5"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
