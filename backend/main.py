from fastapi import FastAPI, Depends, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import date, datetime
from typing import List, Optional
import models
import schemas
from database import engine, get_db

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Airbnb Clone API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production as necessary
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper to get active user based on header
def get_current_user_db(db: Session = Depends(get_db), x_user_id: Optional[int] = Header(None)):
    if x_user_id is None:
        # Default to the first user if no header is supplied
        user = db.query(models.User).first()
        if not user:
            # Create a default guest user if database is empty
            user = models.User(name="Default Guest", email="guest@example.com", role="guest", avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde")
            db.add(user)
            db.commit()
            db.refresh(user)
        return user
    
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# User Routes
@app.get("/api/users", response_model=List[schemas.User])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.get("/api/users/me", response_model=schemas.User)
def get_me(current_user: models.User = Depends(get_current_user_db)):
    return current_user

@app.post("/api/users", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(
        name=user.name,
        email=user.email,
        role=user.role,
        avatar_url=user.avatar_url
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Listings Routes
@app.get("/api/listings", response_model=List[schemas.Listing])
def get_listings(
    category: Optional[str] = None,
    location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    amenities: Optional[List[str]] = Query(None),
    property_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Listing)
    
    if category and category != "All":
        query = query.filter(models.Listing.category == category)
    
    if property_type:
        query = query.filter(models.Listing.property_type == property_type)
    
    if location:
        query = query.filter(models.Listing.location.ilike(f"%{location}%"))
        
    if min_price is not None:
        query = query.filter(models.Listing.price_per_night >= min_price)
        
    if max_price is not None:
        query = query.filter(models.Listing.price_per_night <= max_price)
        
    listings = query.all()

    # Amenities filter
    if amenities:
        listings = [
            listing for listing in listings
            if all(amenity in (listing.amenities or []) for amenity in amenities)
        ]
    
    # Date availability filter
    if start_date and end_date:
        if start_date >= end_date:
            raise HTTPException(status_code=400, detail="Start date must be before end date")
        
        available_listings = []
        for listing in listings:
            # Check for overlaps
            overlap = db.query(models.Booking).filter(
                models.Booking.listing_id == listing.id,
                models.Booking.status == "confirmed",
                models.Booking.start_date < end_date,
                models.Booking.end_date > start_date
            ).first()
            if not overlap:
                available_listings.append(listing)
        return available_listings

    return listings

@app.get("/api/listings/locations", response_model=List[str])
def get_unique_locations(db: Session = Depends(get_db)):
    locations = db.query(models.Listing.location).distinct().all()
    return [loc[0] for loc in locations if loc[0]]

@app.get("/api/listings/{listing_id}", response_model=schemas.Listing)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(models.Listing).filter(models.Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

@app.post("/api/listings", response_model=schemas.Listing)
def create_listing(
    listing: schemas.ListingCreate,
    current_user: models.User = Depends(get_current_user_db),
    db: Session = Depends(get_db)
):
    if current_user.role != "host":
        raise HTTPException(status_code=403, detail="Only hosts can create listings")
        
    db_listing = models.Listing(
        title=listing.title,
        description=listing.description,
        price_per_night=listing.price_per_night,
        location=listing.location,
        latitude=listing.latitude,
        longitude=listing.longitude,
        category=listing.category,
        property_type=listing.property_type or "House",
        amenities=listing.amenities,
        images=listing.images,
        host_id=current_user.id,
        rating=5.0,
        reviews_count=0
    )
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    return db_listing

@app.put("/api/listings/{listing_id}", response_model=schemas.Listing)
def update_listing(
    listing_id: int,
    updated_listing: schemas.ListingCreate,
    current_user: models.User = Depends(get_current_user_db),
    db: Session = Depends(get_db)
):
    db_listing = db.query(models.Listing).filter(models.Listing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    if db_listing.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this listing")
        
    db_listing.title = updated_listing.title
    db_listing.description = updated_listing.description
    db_listing.price_per_night = updated_listing.price_per_night
    db_listing.location = updated_listing.location
    db_listing.latitude = updated_listing.latitude
    db_listing.longitude = updated_listing.longitude
    db_listing.category = updated_listing.category
    db_listing.property_type = updated_listing.property_type or "House"
    db_listing.amenities = updated_listing.amenities
    db_listing.images = updated_listing.images
    
    db.commit()
    db.refresh(db_listing)
    return db_listing

@app.delete("/api/listings/{listing_id}")
def delete_listing(
    listing_id: int,
    current_user: models.User = Depends(get_current_user_db),
    db: Session = Depends(get_db)
):
    db_listing = db.query(models.Listing).filter(models.Listing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    if db_listing.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this listing")
        
    db.delete(db_listing)
    db.commit()
    return {"detail": "Listing deleted successfully"}

# Booking Routes
@app.post("/api/bookings", response_model=schemas.Booking)
def create_booking(
    booking: schemas.BookingCreate,
    current_user: models.User = Depends(get_current_user_db),
    db: Session = Depends(get_db)
):
    if booking.start_date >= booking.end_date:
        raise HTTPException(status_code=400, detail="Start date must be before end date")
        
    # Verify listing exists
    listing = db.query(models.Listing).filter(models.Listing.id == booking.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    # Check availability (no overlapping confirmed bookings)
    overlap = db.query(models.Booking).filter(
        models.Booking.listing_id == booking.listing_id,
        models.Booking.status == "confirmed",
        models.Booking.start_date < booking.end_date,
        models.Booking.end_date > booking.start_date
    ).first()
    
    if overlap:
        raise HTTPException(status_code=400, detail="The listing is already booked for these dates")
        
    # Calculate price
    delta = booking.end_date - booking.start_date
    total_price = listing.price_per_night * delta.days
    
    db_booking = models.Booking(
        listing_id=booking.listing_id,
        guest_id=current_user.id,
        start_date=booking.start_date,
        end_date=booking.end_date,
        total_price=total_price,
        guests_count=booking.guests_count,
        status="confirmed"
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

@app.get("/api/bookings", response_model=List[schemas.Booking])
def get_bookings(
    role: str = Query("guest"),
    current_user: models.User = Depends(get_current_user_db),
    db: Session = Depends(get_db)
):
    if role == "host":
        # Get bookings for listings owned by this host
        return db.query(models.Booking).join(models.Listing).filter(
            models.Listing.host_id == current_user.id
        ).all()
    else:
        # Get bookings made by this user as a guest
        return db.query(models.Booking).filter(
            models.Booking.guest_id == current_user.id
        ).all()

@app.delete("/api/bookings/{booking_id}")
def cancel_booking(
    booking_id: int,
    current_user: models.User = Depends(get_current_user_db),
    db: Session = Depends(get_db)
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    # Allow guest who booked or host who owns listing to cancel
    listing = db.query(models.Listing).filter(models.Listing.id == booking.listing_id).first()
    if booking.guest_id != current_user.id and (listing and listing.host_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")
        
    booking.status = "cancelled"
    db.commit()
    return {"detail": "Booking cancelled successfully"}

# Review Routes
@app.post("/api/reviews", response_model=schemas.Review)
def create_review(
    review: schemas.ReviewCreate,
    current_user: models.User = Depends(get_current_user_db),
    db: Session = Depends(get_db)
):
    listing = db.query(models.Listing).filter(models.Listing.id == review.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    # Check if guest has a confirmed booking for this listing to match Airbnb realistic workflow
    booking = db.query(models.Booking).filter(
        models.Booking.listing_id == review.listing_id,
        models.Booking.guest_id == current_user.id,
        models.Booking.status == "confirmed"
    ).first()
    
    if not booking:
        raise HTTPException(status_code=400, detail="You must book this listing before leaving a review")
        
    db_review = models.Review(
        listing_id=review.listing_id,
        author_id=current_user.id,
        rating=review.rating,
        comment=review.comment,
        created_at=datetime.utcnow()
    )
    db.add(db_review)
    db.commit()
    
    # Update Listing rating and review counts
    all_reviews = db.query(models.Review).filter(models.Review.listing_id == review.listing_id).all()
    avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews)
    
    listing.rating = round(avg_rating, 2)
    listing.reviews_count = len(all_reviews)
    db.commit()
    
    db.refresh(db_review)
    return db_review

@app.get("/api/listings/{listing_id}/reviews", response_model=List[schemas.Review])
def get_listing_reviews(listing_id: int, db: Session = Depends(get_db)):
    return db.query(models.Review).filter(models.Review.listing_id == listing_id).order_by(models.Review.created_at.desc()).all()
