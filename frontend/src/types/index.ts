export interface User {
  id: number;
  name: string;
  email: string;
  role: 'guest' | 'host';
  avatar_url?: string;
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  price_per_night: number;
  location: string;
  latitude?: number;
  longitude?: number;
  category: string;
  property_type: string;
  amenities: string[];
  images: string[];
  host_id: number;
  rating: number;
  reviews_count: number;
  host: User;
  bookings?: { start_date: string; end_date: string; status: string }[];
}

export interface Booking {
  id: number;
  listing_id: number;
  guest_id: number;
  start_date: string; // ISO format date (YYYY-MM-DD)
  end_date: string; // ISO format date (YYYY-MM-DD)
  total_price: number;
  guests_count: number;
  status: 'confirmed' | 'cancelled';
  listing: Listing;
  guest: User;
}

export interface Review {
  id: number;
  listing_id: number;
  author_id: number;
  rating: number;
  comment: string;
  created_at: string;
  author: User;
}

export interface SearchFilters {
  location: string;
  startDate: string;
  endDate: string;
  guests: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  propertyType?: string;
}
