<div align="center">

# 🌍 Wandrr

### Connect with Fellow Travelers, Plan Adventures Together

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-336791?style=flat&logo=postgresql)](https://postgresql.org)
[![Duffel](https://img.shields.io/badge/Duffel-Flight_API-FF5A1F?style=flat)](https://duffel.com)

**Wandrr** is a full-stack travel companion app — discover solo travelers and travel groups, book real flights & hotels, manage group adventures, and get AI-powered itineraries for 18 Indian destinations.

</div>

---

## Features

| Feature | Description |
|---------|-------------|
| 🔐 **Passwordless Auth** | Email OTP signup & signin via Nodemailer — no passwords stored |
| 🌟 **Solo Travellers** | Post travel plans, swipe-style discovery, connect with like-minded travellers |
| 💕 **Travel Connections** | Send/accept connection requests, reveal contact details on mutual match |
| 👥 **Travel Groups** | Create or join groups via invite code, owner controls, max-member cap |
| ✈️ **Flight Booking** | Live flight search via Duffel API with real airline data, displayed in INR |
| 🏨 **Hotel Booking** | Curated hotel database (6–8 hotels/city across 18 destinations) with star ratings |
| 📋 **My Bookings** | View and cancel active flight & hotel reservations |
| 🤖 **AI Itinerary Generator** | Gemini-powered day-by-day trip plans for 18 cities — 4 travel styles × 3 budget tiers; falls back to local knowledge base if API is unavailable |
| 👤 **Profile Management** | View and edit name & phone; email is immutable |

---

## Tech Stack

### Frontend
- **React 18** + **Vite** — fast HMR, component-based UI
- **React Router v6** — client-side routing with protected routes
- **Tailwind CSS** — utility-first styling with dark glassmorphism theme
- **Context API** — global auth state (`UserContext`)

### Backend
- **Node.js** + **Express** — RESTful API server
- **pg** — connection pool for PostgreSQL queries
- **Nodemailer** — email OTP delivery via Gmail SMTP
- **otplib** — TOTP-based one-time password generation
- **crypto** — secure random join-code generation for groups

### External APIs
- **Duffel Flights API** — real-time flight search and offer retrieval
- **Google Gemini 1.5 Flash** — AI-generated travel itineraries (backend proxy, key never exposed)
- Exchange rate conversion to INR built into the backend proxy

### Database
- **PostgreSQL 14+** — relational schema with 7 tables
- Raw SQL migrations in `backend/config/`

---

## Architecture

```
┌─────────────────────────────┐        ┌──────────────────────────────────┐
│        React Frontend        │        │         Express Backend           │
│  (Vite dev server :5173)    │◄──────►│       (Node.js :5000)            │
│                             │  /api  │                                  │
│  Pages                      │        │  Routes                          │
│  ├── SignIn / SignUp         │        │  ├── /api/auth      (OTP flow)   │
│  ├── MainMenu (dashboard)   │        │  ├── /api/users     (profile)    │
│  ├── Solo Travellers        │        │  ├── /api/travel-posts           │
│  ├── Travel Connections     │        │  ├── /api/connection-requests    │
│  ├── Travel Groups          │        │  ├── /api/groups    (CRUD)       │
│  ├── Plan Bookings          │        │  ├── /api/flights   (Duffel)     │
│  ├── My Bookings            │        │  ├── /api/hotels    (MySQL)      │
│  ├── AI Itinerary Agent     │        │  └── /api/bookings  (flight+hotel│
│  └── Profile                │        │                                  │
└─────────────────────────────┘        └──────────────┬───────────────────┘
                                                       │
                              ┌────────────────────────┼───────────────────┐
                              │                        │                   │
                       ┌──────▼──────┐    ┌───────────▼──────┐   ┌────────▼──────┐
                       │ PostgreSQL   │    │  Duffel Flight   │   │  Gmail SMTP   │
                       │     DB      │    │     API          │   │  (Nodemailer) │
                       └─────────────┘    └──────────────────┘   └───────────────┘
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833)
- A free [Duffel account](https://duffel.com) for the test API key

### 1. Clone & install

```bash
git clone https://github.com/jaybharuka/wandrr.git
cd wandrr

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Database setup

```bash
# Create schema and all tables (run once)
psql -U postgres -d wandrr -f backend/config/setup.sql

# Seed hotel data for all 18 destinations
psql -U postgres -d wandrr -f backend/config/hotels_seed.sql
```

### 3. Environment variables

Copy the example and fill in your values:

```bash
cp backend/.env.example backend/.env
```

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/wandrr

EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password

PORT=5000

DUFFEL_API_KEY=duffel_test_your_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run

```bash
# Terminal 1 — backend
cd backend && npm start

# Terminal 2 — frontend
cd frontend && npm run dev
```

Open **http://localhost:5173**. You'll land on the cinematic hero page — click **Begin Journey** to sign in. API calls proxy to `http://localhost:5000`.

---

## Database Schema

```
users                travel_posts          connection_requests
─────────────────    ──────────────────    ───────────────────
id (PK)              id (PK)               id (PK)
name                 user_id (FK→users)    sender_id (FK→users)
email (unique)       destination           receiver_id (FK→users)
phone                travel_date           status
created_at           description           created_at
                     created_at

travel_groups        group_members         bookings
─────────────────    ──────────────────    ───────────────────
id (PK)              id (PK)               id (PK)
name                 group_id (FK)         user_id (FK→users)
destination          user_id (FK→users)    destination
description          joined_at             airline
join_code (unique)                         departure / arrival
is_private           hotels                fare
max_members          ──────────────────    booking_date
created_by (FK)      id (PK)
created_at           name                  hotel_bookings
                     city                  ───────────────────
                     stars                 id (PK)
                     price_per_night       user_id (FK→users)
                     description           hotel_id (FK→hotels)
                     amenities             check_in / check_out
                                           total_price
                                           booking_date
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup/initiate` | Send OTP to new user's email |
| `POST` | `/api/auth/signup/verify` | Verify OTP → create account & return userId |
| `POST` | `/api/auth/signin/initiate` | Send OTP to existing user |
| `POST` | `/api/auth/signin/verify` | Verify OTP → return userId |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/:id` | Get user profile |
| `PUT` | `/api/users/:id` | Update name / phone |

### Travel Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/travel-posts` | List posts (filter by destination) |
| `POST` | `/api/travel-posts` | Create a travel post |
| `DELETE` | `/api/travel-posts/:id` | Delete own post |

### Connections
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/connection-requests` | Send connection request |
| `PUT` | `/api/connection-requests/:id` | Accept / reject |
| `GET` | `/api/connection-requests/:userId` | Get all connections |

### Travel Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/groups` | Create group (returns join code) |
| `POST` | `/api/groups/join` | Join group by code |
| `GET` | `/api/groups/user/:userId` | Get user's groups |
| `GET` | `/api/groups/destination/:dest` | Discover public groups |
| `DELETE` | `/api/groups/:groupId/leave` | Leave group (non-owners only) |
| `DELETE` | `/api/groups/:groupId` | Delete group (owner only) |

### Flights
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/flights/search` | Search live flights via Duffel API (returns INR prices) |

### AI
| Method | Endpoint | Description |
|--------|----------|--------------|
| `POST` | `/api/ai/itinerary` | Generate Gemini AI itinerary (city, days, style, budget) |

### Hotels
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/hotels?city=Goa` | Get hotels for a city |
| `GET` | `/api/hotels/cities` | List all cities with hotel data |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/bookings?userId=1` | Get user's flight bookings |
| `POST` | `/api/bookings` | Book a flight |
| `DELETE` | `/api/bookings/:id` | Cancel flight booking |
| `GET` | `/api/hotelBookings?userId=1` | Get user's hotel bookings |
| `POST` | `/api/hotelBookings` | Book a hotel |
| `DELETE` | `/api/hotelBookings/:id` | Cancel hotel booking |

---

## Project Structure

```
wandrr/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MySQL connection pool
│   │   ├── setup.sql             # Master schema — run once
│   │   ├── hotels_seed.sql       # Hotel data for 18 destinations
│   │   └── travel_groups_schema.sql
│   ├── routes/
│   │   ├── auth.js               # OTP signup/signin
│   │   ├── users.js              # Profile CRUD
│   │   ├── travelPosts.js        # Travel post discovery
│   │   ├── connectionRequests.js # Traveller connections
│   │   ├── groups.js             # Travel groups
│   │   ├── flights.js            # Duffel API proxy
│   │   ├── hotels.js             # Hotel queries
│   │   ├── bookings.js           # Flight bookings
│   │   └── hotelBookings.js      # Hotel bookings
│   ├── .env.example              # Required environment variables
│   ├── package.json
│   └── server.js                 # Express app entry point
│
└── frontend/
    ├── src/
    │   ├── AIPage.jsx             # AI itinerary generator
    │   ├── App.jsx                # Router + UserProvider
    │   ├── itineraryData.js       # City knowledge base (18 destinations)
    │   ├── mainmenu.jsx           # Dashboard
    │   ├── MyBookingsPage.jsx     # Booking management
    │   ├── PlanBookingsPage.jsx   # Flight + hotel search & booking
    │   ├── ProfilePage.jsx        # User profile
    │   ├── SignInPage.jsx
    │   ├── SignUpPage.jsx
    │   ├── TravelGroupsPage.jsx   # Group management
    │   ├── TinderPage.jsx         # Solo traveller discovery
    │   ├── MatchesPage.jsx        # Connections management
    │   └── UserContext.jsx        # Global auth context
    ├── vite.config.js             # Proxy /api → :5000
    └── package.json
```

---

## Key Design Decisions

- **Passwordless auth** — eliminates password storage & breach risk; OTPs expire server-side
- **Backend API proxy for Duffel** — API key never exposed to the browser
- **INR conversion on the backend** — single source of truth for currency; frontend always receives ₹
- **Inline confirmation modals** — replaced all `window.confirm()` blocking dialogs with React state
- **Owner-only group deletion** — prevents groups from being left without an owner
- **Gemini AI itinerary with local fallback** — calls `gemini-1.5-flash` via a secure backend proxy; if the API is unavailable, falls back to a built-in knowledge base covering 4 styles × 3 budgets × 18 cities — always works
- **API key never in the browser** — Gemini key lives only in `backend/.env`, proxied through Express

---

## License

MIT
