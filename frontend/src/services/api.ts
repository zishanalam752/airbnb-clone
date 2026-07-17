import { User, Listing, Booking, Review, SearchFilters } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  activeUserId?: number
): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (activeUserId !== undefined) {
    headers.set('X-User-Id', activeUserId.toString());
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || 'Something went wrong with the API call.');
  }

  return response.json() as Promise<T>;
}

export const apiService = {
  // Users
  getUsers: () => request<User[]>('/api/users'),
  getMe: (userId?: number) => request<User>('/api/users/me', {}, userId),
  createUser: (user: Omit<User, 'id'>) =>
    request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }),

  // Listings
  getListings: (filters: Partial<SearchFilters> = {}, category?: string) => {
    const params = new URLSearchParams();
    if (category && category !== 'All') {
      params.append('category', category);
    }
    if (filters.location) {
      params.append('location', filters.location);
    }
    if (filters.minPrice !== undefined) {
      params.append('min_price', filters.minPrice.toString());
    }
    if (filters.maxPrice !== undefined) {
      params.append('max_price', filters.maxPrice.toString());
    }
    if (filters.startDate) {
      params.append('start_date', filters.startDate);
    }
    if (filters.endDate) {
      params.append('end_date', filters.endDate);
    }
    if (filters.amenities && filters.amenities.length > 0) {
      filters.amenities.forEach((amenity) => {
        params.append('amenities', amenity);
      });
    }
    if (filters.propertyType) {
      params.append('property_type', filters.propertyType);
    }

    return request<Listing[]>(`/api/listings?${params.toString()}`);
  },

  getListing: (id: number) => request<Listing>(`/api/listings/${id}`),

  getLocations: () => request<string[]>('/api/listings/locations'),

  createListing: (listing: Omit<Listing, 'id' | 'rating' | 'reviews_count' | 'host_id' | 'host'>, userId: number) =>
    request<Listing>('/api/listings', {
      method: 'POST',
      body: JSON.stringify(listing),
    }, userId),

  updateListing: (id: number, listing: Omit<Listing, 'id' | 'rating' | 'reviews_count' | 'host_id' | 'host'>, userId: number) =>
    request<Listing>(`/api/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listing),
    }, userId),

  deleteListing: (id: number, userId: number) =>
    request<{ detail: string }>(`/api/listings/${id}`, {
      method: 'DELETE',
    }, userId),

  // Bookings
  createBooking: (booking: { listing_id: number; start_date: string; end_date: string; guests_count: number }, userId: number) =>
    request<Booking>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    }, userId),

  getBookings: (role: 'guest' | 'host', userId: number) =>
    request<Booking[]>(`/api/bookings?role=${role}`, {}, userId),

  cancelBooking: (id: number, userId: number) =>
    request<{ detail: string }>(`/api/bookings/${id}`, {
      method: 'DELETE',
    }, userId),

  // Reviews
  createReview: (review: { listing_id: number; rating: number; comment: string }, userId: number) =>
    request<Review>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    }, userId),

  getReviews: (listingId: number) =>
    request<Review[]>(`/api/listings/${listingId}/reviews`),
};
