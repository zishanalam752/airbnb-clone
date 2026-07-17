"use client";

import React, { useState } from 'react';
import { Listing } from '../types';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { X, CreditCard, Calendar, Users, DollarSign, CheckCircle } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  startDate: string;
  endDate: string;
  guestsCount: number;
  onBookingSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  listing,
  startDate,
  endDate,
  guestsCount,
  onBookingSuccess,
}) => {
  const { activeUser, addToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (!isOpen) return null;

  // Calculate pricing breakdown
  const start = new Date(startDate);
  const end = new Date(endDate);
  const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
  const subtotal = listing.price_per_night * nights;
  const cleaningFee = Math.round(subtotal * 0.08); // 8% cleaning fee
  const serviceFee = Math.round(subtotal * 0.12);  // 12% airbnb service fee
  const total = subtotal + cleaningFee + serviceFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) {
      addToast('Please choose an active mock user first from the header profile menu.', 'error');
      return;
    }

    if (!cardNumber || !expiry || !cvv || !name) {
      addToast('Please fill in all mock payment details.', 'error');
      return;
    }

    setLoading(true);
    try {
      await apiService.createBooking(
        {
          listing_id: listing.id,
          start_date: startDate,
          end_date: endDate,
          guests_count: guestsCount,
        },
        activeUser.id
      );
      
      setBookingSuccess(true);
      addToast('Booking successfully created! Your stay is confirmed.', 'success');
      setTimeout(() => {
        setBookingSuccess(false);
        onBookingSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      addToast(err.message || 'Failed to book listing.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-350">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        
        {/* Success Screen */}
        {bookingSuccess ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="text-emerald-500 bg-emerald-50 dark:bg-emerald-950 p-6 rounded-full animate-bounce mb-6">
              <CheckCircle className="w-16 h-16 stroke-[2]" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Reservation Confirmed!</h2>
            <p className="text-zinc-500 text-sm font-light leading-relaxed max-w-sm">
              Pack your bags! Your stay at <span className="font-semibold text-zinc-800 dark:text-zinc-200">{listing.title}</span> has been confirmed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-150 dark:divide-zinc-800">
            
            {/* Left side: Booking Details */}
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Confirm and pay</h2>
                <button 
                  onClick={onClose} 
                  className="md:hidden p-1 bg-zinc-100 dark:bg-zinc-800 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Listing Card details */}
              <div className="flex gap-4">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-zinc-500 block">{listing.category} in {listing.location}</span>
                  <h4 className="font-semibold text-sm truncate">{listing.title}</h4>
                  <span className="text-xs text-zinc-500">★ {listing.rating.toFixed(2)} ({listing.reviews_count} reviews)</span>
                </div>
              </div>

              {/* Summary details */}
              <div className="space-y-3 pt-4 border-t border-zinc-150 dark:border-zinc-800 text-sm">
                <h3 className="font-bold">Your trip</h3>
                <div className="flex items-center justify-between text-zinc-655 dark:text-zinc-400 font-light">
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-zinc-400" /> Dates</span>
                  <span>{startDate} to {endDate}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-655 dark:text-zinc-400 font-light">
                  <span className="flex items-center gap-2"><Users className="w-4 h-4 text-zinc-400" /> Guests</span>
                  <span>{guestsCount} guest{guestsCount > 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Price Details */}
              <div className="space-y-3 pt-4 border-t border-zinc-150 dark:border-zinc-800 text-sm">
                <h3 className="font-bold">Price details</h3>
                <div className="flex items-center justify-between text-zinc-500 font-light">
                  <span>${listing.price_per_night} x {nights} nights</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-500 font-light">
                  <span>Cleaning fee</span>
                  <span>${cleaningFee}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-500 font-light">
                  <span>Airbnb service fee</span>
                  <span>${serviceFee}</span>
                </div>
                <div className="flex items-center justify-between font-bold pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 text-base">
                  <span>Total (USD)</span>
                  <span>${total}</span>
                </div>
              </div>
            </div>

            {/* Right side: Payment form */}
            <div className="p-6 flex flex-col justify-between">
              {/* Close Button on desktop */}
              <button 
                onClick={onClose} 
                className="hidden md:flex absolute top-6 right-6 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>

              <form onSubmit={handleSubmit} className="space-y-4 pt-4 md:pt-8">
                <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-rose-500" />
                  Simulated Payment (Mock Card)
                </h3>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Card Number</label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Expiration</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">CVV</label>
                    <input
                      type="password"
                      required
                      maxLength={3}
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-center"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-350 text-white font-bold rounded-xl transition shadow-lg text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <DollarSign className="w-4 h-4" />
                        Confirm Booking (${total})
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-zinc-400 font-light text-center mt-2.5 leading-relaxed">
                    This is a mock transaction. No real money will be charged.
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
