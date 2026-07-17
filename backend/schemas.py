from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import List, Optional

# User Schemas
class UserBase(BaseModel):
    name: str
    email: str
    role: str  # "guest" or "host"
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    class Config:
        from_attributes = True

# Review Schemas
class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str

class ReviewCreate(ReviewBase):
    listing_id: int

class Review(ReviewBase):
    id: int
    listing_id: int
    author_id: int
    created_at: datetime
    author: User
    class Config:
        from_attributes = True

class BookingDateRange(BaseModel):
    start_date: date
    end_date: date
    status: str
    class Config:
        from_attributes = True

# Listing Schemas
class ListingBase(BaseModel):
    title: str
    description: str
    price_per_night: float
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    category: str
    property_type: Optional[str] = "House"
    amenities: List[str]
    images: List[str]

class ListingCreate(ListingBase):
    pass

class Listing(ListingBase):
    id: int
    host_id: int
    rating: float
    reviews_count: int
    host: User
    bookings: List[BookingDateRange] = []
    class Config:
        from_attributes = True

# Booking Schemas
class BookingBase(BaseModel):
    listing_id: int
    start_date: date
    end_date: date
    guests_count: int

class BookingCreate(BookingBase):
    pass

class Booking(BookingBase):
    id: int
    guest_id: int
    total_price: float
    status: str
    listing: Listing
    guest: User
    class Config:
        from_attributes = True
