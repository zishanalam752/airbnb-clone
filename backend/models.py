from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="guest")  # "guest" or "host"
    avatar_url = Column(String, nullable=True)

    listings = relationship("Listing", back_populates="host", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="guest", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="author", cascade="all, delete-orphan")


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    price_per_night = Column(Float, nullable=False)
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    category = Column(String, nullable=False)  # e.g., "Beachfront", "Cabins"
    property_type = Column(String, nullable=False, default="House")
    amenities = Column(JSON, nullable=False)   # JSON array of strings
    images = Column(JSON, nullable=False)      # JSON array of image URLs
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Float, default=5.0)
    reviews_count = Column(Integer, default=0)

    host = relationship("User", back_populates="listings")
    bookings = relationship("Booking", back_populates="listing", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="listing", cascade="all, delete-orphan")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    guest_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    total_price = Column(Float, nullable=False)
    guests_count = Column(Integer, nullable=False)
    status = Column(String, default="confirmed")  # "confirmed" or "cancelled"

    listing = relationship("Listing", back_populates="bookings")
    guest = relationship("User", back_populates="bookings")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1 to 5 stars
    comment = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    listing = relationship("Listing", back_populates="reviews")
    author = relationship("User", back_populates="reviews")
