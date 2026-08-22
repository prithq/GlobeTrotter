# GlobeTrotter — AI-Powered Multi-City Travel & Route Planner

GlobeTrotter is a full-stack, intelligent travel planning web application designed to help travelers discover cities, design multi-stop itineraries, optimize travel routes geographically to minimize costs, estimate day-by-day budgets, and share travel notes with a global community.

---

## Key Features

### Intelligent Route & Cost Optimization
- **Geographic Path Optimization**: Automatically reorders multi-city trip stops into geographically efficient paths (e.g. *Gujarat → Mumbai → Bangalore*) rather than arbitrary input order, lowering transportation expenses and travel time.
- **Budget Estimations**: Instant budget calculation broken down into **Stay**, **Food**, **Transport**, and **Activities**.

### Realtime Destination Search & Nearby Attractions
- **Live Search**: Real-time city search powered by OpenAI and dynamic dataset indexing.
- **Nearby Places Recommendation**: Searching for any city (e.g. *Manali*) automatically displays top local attractions and nearby scenic spots (*Solang Valley, Kasol, Shimla, Kullu*).
- **Dynamic Photo Matching**: High-resolution travel photos auto-resolved for all trip destinations.

### Itinerary Builder & Trip Calendar
- **Day-Wise Activity Planning**: Organize activities, time slots, duration, and estimated costs per stop day.
- **Visual Trip Calendar**: View ongoing, upcoming, and completed trips on a unified calendar grid.
- **Interactive My Trips View**: Search, filter, and track all personal trips in one interface.

### Traveler Community Notes
- **Community Feed**: Discover and search authentic travel notes posted by fellow travelers.
- **Publish Travel Notes**: Share trip experiences, star ratings, and destination photos directly to the community feed.
- **Likes & Sharing**: Interactive like counter and 1-click note link sharing.

### Profile & Avatar Management
- **Local Avatar Upload**: Direct local profile picture upload with immediate persistence without forced logouts.
- **Pre-Planned & Past Trips History**: Dedicated sections showcasing active upcoming journeys and past travel memories.

---

## Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4, PostCSS, Autoprefixer
- **Icons**: React Icons / Lucide React
- **Routing**: React Router DOM v7
- **Feedback**: React Hot Toast

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: MongoDB Atlas via Mongoose ORM
- **Authentication**: JWT (JSON Web Tokens) & BcryptJS password hashing
- **AI Integration**: OpenAI API (real-time place & route suggestions)
- **Mailing**: Nodemailer (password reset flows)

---

## Repository Structure

```
GlobeTrotter/
├── package.json              # Root package script runner
├── README.md                 # Project documentation
├── API_REFERENCE.md          # Comprehensive API endpoint reference
├── client/                   # Frontend React + Vite application
│   ├── src/
│   │   ├── api/              # Axios instance & API client modules
│   │   ├── components/       # Shared UI components
│   │   ├── context/          # Auth Context provider
│   │   ├── pages/            # Application pages (Dashboard, Itinerary, Community, Profile, etc.)
│   │   └── utils/            # Image helper & utility functions
│   └── package.json
└── server/                   # Backend Express API server
    ├── config/               # Database connection config
    ├── middleware/           # JWT auth middleware
    ├── models/               # Mongoose data schemas (User, City, Activity, Trip, CommunityPost)
    ├── routes/               # API routes (Auth, Cities, Activities, Trips, Community, Suggest)
    ├── server.js             # Express entry point
    └── test-routes.js        # Automated API test suite
```

---

## Quick Start & Setup

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **MongoDB Atlas** cluster URI

---

### 1. Installation

Clone the repository and install dependencies for root, client, and server:

```bash
git clone https://github.com/prithq/GlobeTrotter.git
cd GlobeTrotter
npm run install-all
```

---

### 2. Environment Configuration

Create a `.env` file in the `server/` directory:

```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/GlobeTrotter?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

Create a `.env` file in the `client/` directory (optional):

```env
VITE_API_URL=http://localhost:8000/api
```

---

### 3. Running the Application

Start both backend server and frontend development client concurrently:

```bash
npm run dev
```

- **Frontend Client**: Runs on `http://localhost:5173`
- **Backend API Server**: Runs on `http://localhost:8000`

---

## Automated Testing

To run the automated backend route verification suite:

```bash
cd server
node test-routes.js
```

The test suite validates:
- Health check endpoints
- Authentication flows (Signup, Login, Me, Token verification)
- User profile updates
- City & Activity search and filtering
- Trip creation, route cost optimization, and daywise stop management
- Community travel notes fetching and publishing

---

## API Documentation

For full API endpoint specifications, payload schemas, and response formats, refer to [`API_REFERENCE.md`](file:///i:/Github/Completed/Hackathons/GlobeTrotter/API_REFERENCE.md).

---

## Appendix & Licensing

### Google Maps Platform Appendix

- **Cost Notice:** Usage of Google Maps Platform products and services may incur costs against your Google Cloud project billing account.
- **Products-Used List:**
  - Routes API (Compute Route Matrix / Distance Matrix)
  - Places API (New)
  - Geocoding API
- **API Key Restrictions:** Direct link to restrict production API keys: [Google Cloud API Key Restrictions](https://docs.cloud.google.com/api-keys/docs/add-restrictions-api-keys)
- **License Scope:** Google-sourced code snippets are provided 'as-is' under the Apache 2.0 License ([Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0)). This license covers only the Google-sourced snippets, not the full generated project output.
- **Terms of Service:** Use of this code is subject to the [Google Maps Platform Terms of Service](https://cloud.google.com/maps-platform/terms).
