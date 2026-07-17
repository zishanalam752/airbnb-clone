from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models
from datetime import date, timedelta, datetime
import json

def seed_db():
    # Re-create tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # 1. Create Users
    users = [
        models.User(
            name="Zishan Alam",
            email="zishan@host.com",
            role="host",
            avatar_url="https://media.licdn.com/dms/image/v2/D5603AQHznNnzPIrRIQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1725197165835?e=2147483647&v=beta&t=HwIK_b-qS2exZ263Rp0_p1x7waVk5Xd5J-AkEHZLWRM"
        ),
        models.User(
            name="Sarah Host",
            email="sarah@host.com",
            role="host",
            avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
        ),
        models.User(
            name="Rajesh Kumar",
            email="rajesh@host.com",
            role="host",
            avatar_url="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150"
        ),
        models.User(
            name="Alice Guest",
            email="alice@guest.com",
            role="guest",
            avatar_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
        ),
        models.User(
            name="Bob Guest",
            email="bob@guest.com",
            role="guest",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
        )
    ]

    for user in users:
        db.add(user)
    db.commit()

    # Fetch users back to get IDs
    zishan = db.query(models.User).filter_by(email="zishan@host.com").first()
    sarah = db.query(models.User).filter_by(email="sarah@host.com").first()
    rajesh = db.query(models.User).filter_by(email="rajesh@host.com").first()
    alice = db.query(models.User).filter_by(email="alice@guest.com").first()
    bob = db.query(models.User).filter_by(email="bob@guest.com").first()

    # 2. Create Listings (minimum 3 coherent house/hotel images per listing)
    listings = [
        # Icons
        models.Listing(
            title="The Barbie Dreamhouse Mansion",
            description="Live like an icon in this neon-pink dreamhouse right on the Malibu coastline. Complete with a private dance floor, DJ booth, infinity pool, and Ken's personal roller rink. This life-sized Barbie dreamhouse offers stunning ocean vistas and three floors of pure pop luxury.",
            price_per_night=350.0,
            location="Malibu, California",
            latitude=34.0259,
            longitude=-118.7798,
            category="Icons",
            property_type="Mansion",
            amenities=["Wifi", "Pool", "Beachfront", "Kitchen", "Air conditioning", "Hot tub", "Gym"],
            images=[
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
                "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
                "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"
            ],
            host_id=zishan.id,
            rating=4.95,
            reviews_count=20
        ),
        models.Listing(
            title="Futuristic Desert Dome",
            description="Disconnect in this off-grid dome structure located deep in the high desert of Joshua Tree. Powered entirely by solar, featuring stargazing skylights, a cowboy tub, and a firepit to watch the desert sky come alive.",
            price_per_night=210.0,
            location="Joshua Tree, California",
            latitude=34.1362,
            longitude=-116.3156,
            category="Icons",
            property_type="Unique Space",
            amenities=["Wifi", "Air conditioning", "Hot tub", "Mountain view"],
            images=[
                "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800",
                "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
                "https://images.unsplash.com/photo-1508333706533-1ab43ecb1606?w=800"
            ],
            host_id=zishan.id,
            rating=4.88,
            reviews_count=12
        ),
        # Beachfront
        models.Listing(
            title="Sleek Beachfront Villa",
            description="Step directly onto the golden sand from this architecturally stunning modern home. Floor-to-ceiling glass doors slide away to combine the oceanfront deck and the living room into a single indoor-outdoor paradise.",
            price_per_night=480.0,
            location="Maui, Hawaii",
            latitude=20.7984,
            longitude=-156.3319,
            category="Beachfront",
            property_type="Villa",
            amenities=["Beachfront", "Wifi", "Kitchen", "Air conditioning", "Ocean view", "BBQ grill"],
            images=[
                "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
                "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800"
            ],
            host_id=sarah.id,
            rating=4.97,
            reviews_count=35
        ),
        models.Listing(
            title="Luxury Goan Beachfront Villa",
            description="Experience pure coastal bliss in this stunning beach villa in North Goa. Enjoy a private pool overlooking the Arabian Sea, direct private beach access, authentic Goan architectural details, and fully staffed premium hospitality.",
            price_per_night=150.0,
            location="Goa, India",
            latitude=15.5494,
            longitude=73.7536,
            category="Beachfront",
            property_type="Villa",
            amenities=["Beachfront", "Wifi", "Pool", "Kitchen", "Air conditioning", "BBQ grill"],
            images=[
                "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800",
                "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800",
                "https://images.unsplash.com/photo-1613545325278-f24b0cae1224?w=800"
            ],
            host_id=rajesh.id,
            rating=4.92,
            reviews_count=18
        ),
        # Cabins
        models.Listing(
            title="Luxurious A-Frame Retreat",
            description="Escape to the mountains in this designer A-frame cabin surrounded by towering pines. Features a custom hot tub, modern gas fireplace, lofted bedroom, and custom record player with an extensive jazz collection.",
            price_per_night=250.0,
            location="Big Bear Lake, California",
            latitude=34.2439,
            longitude=-116.9114,
            category="Cabins",
            property_type="Cabin",
            amenities=["Wifi", "Mountain view", "Hot tub", "Fireplace", "Kitchen", "Air conditioning"],
            images=[
                "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800",
                "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800",
                "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800"
            ],
            host_id=zishan.id,
            rating=4.91,
            reviews_count=15
        ),
        models.Listing(
            title="Scenic Himalayan Pine Cabin",
            description="Tucked away in the snow-dusted mountains of Shimla, this cozy wooden logs cabin offers stunning panoramic views of the Himalayas. Features a stone fireplace, private balcony, glass-sunroom, and home-cooked Himachali meals.",
            price_per_night=90.0,
            location="Shimla, India",
            latitude=31.1048,
            longitude=77.1734,
            category="Cabins",
            property_type="Cabin",
            amenities=["Wifi", "Mountain view", "Fireplace", "Kitchen", "Pets allowed"],
            images=[
                "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
                "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
                "https://images.unsplash.com/photo-1475855581690-80accde3ae2b?w=800"
            ],
            host_id=rajesh.id,
            rating=4.85,
            reviews_count=9
        ),
        # Mansions
        models.Listing(
            title="Heritage Royal Haveli",
            description="Live like royalty in this beautifully restored 18th-century Haveli in the heart of the Pink City. Features exquisite frescoes, a central courtyard, a traditional stepwell-inspired pool, and classical sitar performances in the evening.",
            price_per_night=220.0,
            location="Jaipur, India",
            latitude=26.9124,
            longitude=75.7873,
            category="Mansions",
            property_type="Mansion",
            amenities=["Wifi", "Pool", "Kitchen", "Air conditioning", "Gym", "Breakfast included"],
            images=[
                "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800",
                "https://images.unsplash.com/photo-1585983224974-084a8e065e76?w=800",
                "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800"
            ],
            host_id=rajesh.id,
            rating=4.96,
            reviews_count=22
        ),
        models.Listing(
            title="Tuscan Style Luxury Estate",
            description="An expansive private estate featuring a private vineyard, Olympic-sized swimming pool, personal chef quarters, and automated smart-home systems. Recreate a Italian getaway right in Northern California.",
            price_per_night=850.0,
            location="Napa Valley, California",
            latitude=38.2975,
            longitude=-122.2869,
            category="Mansions",
            property_type="Mansion",
            amenities=["Pool", "Kitchen", "Gym", "Air conditioning", "Hot tub", "Wifi"],
            images=[
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
            ],
            host_id=zishan.id,
            rating=4.92,
            reviews_count=10
        ),
        # Countryside
        models.Listing(
            title="Traditional Kerala Houseboat",
            description="Sail along the serene backwaters of Alleppey in this luxurious, handcrafted traditional Kettuvallam houseboat. Made of wood and coir, featuring full amenities, an open-deck lounge, and local fish delicacies prepared live by onboard chefs.",
            price_per_night=130.0,
            location="Alleppey, India",
            latitude=9.4981,
            longitude=76.3388,
            category="Countryside",
            property_type="Unique Space",
            amenities=["Ocean view", "Kitchen", "Air conditioning", "Breakfast included", "Pets allowed"],
            images=[
                "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800",
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
                "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"
            ],
            host_id=rajesh.id,
            rating=4.89,
            reviews_count=14
        ),
        models.Listing(
            title="Lavender Fields Farmhouse",
            description="Relax at this historical 19th-century farmhouse surrounded by active lavender fields. Participate in honey harvesting, walk the organic orchards, or simply read a book on the wraparound veranda.",
            price_per_night=140.0,
            location="Provence, France",
            latitude=43.9493,
            longitude=4.8055,
            category="Countryside",
            property_type="House",
            amenities=["Wifi", "Kitchen", "Pets allowed", "Garden view"],
            images=[
                "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
                "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
                "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800"
            ],
            host_id=sarah.id,
            rating=4.82,
            reviews_count=19
        )
    ]

    for listing in listings:
        db.add(listing)
    db.commit()

    # Get listings back to seed bookings & reviews
    barbie = db.query(models.Listing).filter_by(title="The Barbie Dreamhouse Mansion").first()
    villa = db.query(models.Listing).filter_by(title="Sleek Beachfront Villa").first()
    aframe = db.query(models.Listing).filter_by(title="Luxurious A-Frame Retreat").first()

    # 3. Create Bookings
    today = date.today()
    bookings = [
        # Active booking for Alice
        models.Booking(
            listing_id=barbie.id,
            guest_id=alice.id,
            start_date=today + timedelta(days=2),
            end_date=today + timedelta(days=5),
            total_price=barbie.price_per_night * 3,
            guests_count=2,
            status="confirmed"
        ),
        # Past booking for Bob (so he can have reviews seeded)
        models.Booking(
            listing_id=villa.id,
            guest_id=bob.id,
            start_date=today - timedelta(days=10),
            end_date=today - timedelta(days=7),
            total_price=villa.price_per_night * 3,
            guests_count=4,
            status="confirmed"
        ),
        # Overlapping check
        models.Booking(
            listing_id=aframe.id,
            guest_id=alice.id,
            start_date=today + timedelta(days=15),
            end_date=today + timedelta(days=20),
            total_price=aframe.price_per_night * 5,
            guests_count=1,
            status="confirmed"
        )
    ]

    for booking in bookings:
        db.add(booking)
    db.commit()

    # 4. Create Reviews
    reviews = [
        models.Review(
            listing_id=villa.id,
            author_id=bob.id,
            rating=5,
            comment="This property was absolutely stunning! The walk directly onto the beach was spectacular, and Sarah was a wonderful host.",
            created_at=datetime.utcnow() - timedelta(days=6)
        ),
        models.Review(
            listing_id=villa.id,
            author_id=alice.id,
            rating=4,
            comment="Incredible views and great response times from host. Minor issue with hot water but Sarah sorted it immediately.",
            created_at=datetime.utcnow() - timedelta(days=12)
        ),
        models.Review(
            listing_id=barbie.id,
            author_id=bob.id,
            rating=5,
            comment="It is exactly like the photos! Unbelievable pink experience and Malibu sunsets are second to none.",
            created_at=datetime.utcnow() - timedelta(days=3)
        )
    ]

    for review in reviews:
        db.add(review)
    db.commit()

    # Recalculate average ratings and reviews count for seeded listings
    for listing in db.query(models.Listing).all():
        all_reviews = db.query(models.Review).filter_by(listing_id=listing.id).all()
        if all_reviews:
            avg = sum(r.rating for r in all_reviews) / len(all_reviews)
            listing.rating = round(avg, 2)
            listing.reviews_count = len(all_reviews)
        else:
            listing.rating = listing.rating or 5.0
            listing.reviews_count = listing.reviews_count or 0
    db.commit()

    print("Database seeded successfully with users, listings, bookings, and reviews including India destinations!")
    db.close()

if __name__ == "__main__":
    seed_db()
