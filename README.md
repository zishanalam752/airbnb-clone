# Airbnb Clone Marketplace - SDE Fullstack Assignment

This project is a functional full-stack clone of the Airbnb web application, replicating Airbnb's signature photo-forward design, responsive user experience, and core booking/hosting workflows.

---

## Technical Stack

*   **Frontend**: Next.js 15 (App Router, TypeScript, Tailwind CSS, Lucide React Icons)
*   **Backend**: Python, FastAPI
*   **Database & ORM**: SQLite (via SQLAlchemy)
*   **Seeding & Validation**: Pydantic, Custom Seed Script

---

## Architecture Overview

```
                        +----------------------------+
                        |  Next.js (App Router, TS)  |
                        |      & Tailwind CSS        |
                        +--------------+-------------+
                                       |
                     REST API Calls    |  (JSON over HTTP)
                  Header: X-User-Id    v
                        +--------------+-------------+
                        |       FastAPI Backend      |
                        +--------------+-------------+
                                       |
                          SQLAlchemy   |  ORM Queries
                                       v
                        +--------------+-------------+
                        |   SQLite Database (.db)    |
                        | (Auto-switchable to PG/My) |
                        +----------------------------+
```

### Key Technical Patterns
1.  **Mock Authenticated Personas**: To facilitate full end-to-end evaluation, user authentication is simulated. A profile switcher in the header allows toggling between 4 personas (2 Hosts, 2 Guests). API calls inject an `X-User-Id` header, which the backend routes intercept to retrieve user contexts.
2.  **Flexible Database Backend**: The backend is configured to use SQLite locally, but reads a `DATABASE_URL` environment variable if present. It maps Postgres protocols (`postgres://` -> `postgresql://`) automatically, making it ready to be deployed to production hosting services (Render, Railway, Supabase, Neon) without code changes.
3.  **Real-Time Date-Blocking Calendar**: Confirmed bookings serialize directly within Listing details, allowing the frontend to dynamically calculate date-range availability, disable occupied intervals on calendars, and reject overlapping dates.

---

## Database Schema

All database models reside in `backend/models.py`.

### 1. `users` Table
Stores account information, identifying users as guests or hosts.
*   `id` (Integer, Primary Key)
*   `name` (String, Non-Nullable)
*   `email` (String, Unique, Indexed)
*   `role` (String: `"guest"` or `"host"`)
*   `avatar_url` (String, Nullable)

### 2. `listings` Table
Stores property listing listings with ratings aggregation.
*   `id` (Integer, Primary Key)
*   `title` (String, Non-Nullable)
*   `description` (String, Non-Nullable)
*   `price_per_night` (Float, Non-Nullable)
*   `location` (String, Non-Nullable)
*   `latitude` (Float, Nullable)
*   `longitude` (Float, Nullable)
*   `category` (String, Non-Nullable - e.g., `"Icons"`, `"Beachfront"`)
*   `amenities` (JSON list of strings)
*   `images` (JSON list of image URLs)
*   `host_id` (Integer, Foreign Key to `users.id`)
*   `rating` (Float, Default `5.0`)
*   `reviews_count` (Integer, Default `0`)

### 3. `bookings` Table
Stores guest reservations with check-in/out ranges.
*   `id` (Integer, Primary Key)
*   `listing_id` (Integer, Foreign Key to `listings.id`)
*   `guest_id` (Integer, Foreign Key to `users.id`)
*   `start_date` (Date, Non-Nullable)
*   `end_date` (Date, Non-Nullable)
*   `total_price` (Float, Non-Nullable)
*   `guests_count` (Integer, Non-Nullable)
*   `status` (String, Default `"confirmed"` - can be `"cancelled"`)

### 4. `reviews` Table
Stores guest experience reviews.
*   `id` (Integer, Primary Key)
*   `listing_id` (Integer, Foreign Key to `listings.id`)
*   `author_id` (Integer, Foreign Key to `users.id`)
*   `rating` (Integer, Range 1 to 5)
*   `comment` (String, Non-Nullable)
*   `created_at` (DateTime, Default UTC timestamp)

---

## API Overview

### Users Endpoints
*   `GET /api/users`: List all mock profiles.
*   `GET /api/users/me`: Fetch profile detail for the active user session (determined via `X-User-Id` header).
*   `POST /api/users`: Create a new user profile.

### Listings Endpoints
*   `GET /api/listings`: Fetch properties. Supports query filters:
    *   `category`: Category query (e.g., `Beachfront`).
    *   `location`: Case-insensitive destination search.
    *   `min_price` / `max_price`: Nightly cost filtering.
    *   `start_date` / `end_date`: Checks booking calendars and excludes properties with overlapping reservations.
*   `GET /api/listings/{id}`: Detailed property info, including confirmed bookings date arrays and host profiles.
*   `POST /api/listings`: Register a new listing (accessible to Host personas only).
*   `PUT /api/listings/{id}`: Edit listed property (accessible only to listing host).
*   `DELETE /api/listings/{id}`: Delete property (accessible only to listing host).

### Bookings Endpoints
*   `POST /api/bookings`: Create a reservation. Checks for overlapping dates on the database and computes the night-count total price.
*   `GET /api/bookings`: Fetch user bookings. Filterable by query parameter `role=guest` (stays booked by current user) or `role=host` (reservations made by guests for properties owned by this host).
*   `DELETE /api/bookings/{id}`: Cancels a booking (marks status as `"cancelled"` and frees up calendar dates).

### Reviews Endpoints
*   `POST /api/reviews`: Leaves a review on a property. Verifies that the guest has booked the property before. Recalculates average rating and review counts on the listing entry automatically.
*   `GET /api/listings/{id}/reviews`: Returns all reviews for a specific property.

---

## Setup & Running Locally

### Backend Setup
1.  Navigate to `backend/`:
    ```bash
    cd backend
    ```
2.  Set up and activate virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Seed the local SQLite database (`airbnb.db`):
    ```bash
    python seed.py
    ```
5.  Launch API server:
    ```bash
    uvicorn main:app --reload --port 8000
    ```
    *API documentation is interactive and viewable at [http://localhost:8000/docs](http://localhost:8000/docs)*.

### Frontend Setup
1.  Navigate to `frontend/`:
    ```bash
    cd ../frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Launch Next.js development server:
    ```bash
    npm run dev
    ```
4.  Open the browser to [http://localhost:3000](http://localhost:3000).

---

## Deployment Instructions

*   **Frontend**: Can be built for static/node hosting (e.g. Vercel, Netlify) by setting the environment variable `NEXT_PUBLIC_API_URL` to point to the hosted backend domain URL.
*   **Backend**: Can be deployed to services like Render or Railway. Simply run `uvicorn main:app --host 0.0.0.0 --port $PORT` and connect an online PostgreSQL database URL environment variable (`DATABASE_URL`).
