# GlobeTrotter — Backend API Reference

> **Base URL:** `http://localhost:8000/api`  
> **Auth:** All 🔒 routes require the header: `Authorization: Bearer <token>`  
> **Dates:** Send as ISO string — `"2026-09-01"`  
> **Time:** Send as `"HH:MM"` string — `"09:30"`  
> **Pagination:** All list endpoints accept `?page=1&limit=20`

---

## 1. Auth — `/api/auth`

> No token required unless marked 🔒

### POST `/api/auth/signup`
Create a new account.

**Request Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response `201`**
```json
{
  "token": "<jwt>",
  "user": { "id", "name", "email", "role" }
}
```

---

### POST `/api/auth/login`
Login with existing credentials.

**Request Body**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response `200`**
```json
{
  "token": "<jwt>",
  "user": { "id", "name", "email", "role" }
}
```

---

### GET `/api/auth/me` 🔒
Get the currently logged-in user's profile.

**Response `200`**
```json
{
  "_id", "name", "email", "photoUrl",
  "languagePref", "role", "savedDestinations"
}
```

---

### POST `/api/auth/forgot-password`
Send a password reset link to the user's email.

**Request Body**
```json
{ "email": "john@example.com" }
```

**Response `200`**
```json
{ "message": "If that email exists, a reset link has been sent" }
```

---

### POST `/api/auth/reset-password`
Reset the password using the token from email.

**Request Body**
```json
{
  "resetToken": "<token-from-email>",
  "newPassword": "newSecret123"
}
```

**Response `200`**
```json
{ "message": "Password reset successful" }
```

---

## 2. Users — `/api/users` 🔒

### GET `/api/users/:id`
Get a user's public profile.

**Response `200`**
```json
{
  "_id", "name", "email", "photoUrl",
  "languagePref", "role", "savedDestinations"
}
```

---

### PUT `/api/users/:id`
Update own profile. Only the authenticated user can edit their own account.

**Request Body** *(all fields optional)*
```json
{
  "name": "New Name",
  "photoUrl": "https://...",
  "languagePref": "fr"
}
```

**Response `200`** — updated user object

---

### DELETE `/api/users/:id`
Delete own account. Only the authenticated user can delete their own account.

**Response `200`**
```json
{ "message": "Account deleted", "id": "<userId>" }
```

---

## 3. Trips — `/api/trips` 🔒

### GET `/api/trips`
List all trips for the logged-in user.

**Query Params**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Results per page (max 100) |

**Response `200`**
```json
{
  "data": [
    {
      "_id", "name", "description",
      "startDate", "endDate", "coverPhotoUrl",
      "isPublic", "destinationCount", "createdAt"
    }
  ],
  "pagination": { "page", "limit", "total", "pages" }
}
```

---

### POST `/api/trips`
Create a new trip.

**Request Body**
```json
{
  "name": "Europe Summer 2026",
  "startDate": "2026-09-01",
  "endDate": "2026-09-20",
  "description": "Optional trip description",
  "coverPhotoUrl": "https://..."
}
```

**Response `201`** — full trip object

---

### GET `/api/trips/:id`
Get a single trip with all stops and activities.

**Response `200`** — full trip object including `stops[]` and nested `activities[]`

---

### PUT `/api/trips/:id`
Update trip details.

**Request Body** *(all fields optional)*
```json
{
  "name", "description", "startDate", "endDate", "coverPhotoUrl"
}
```

**Response `200`** — updated trip object

---

### DELETE `/api/trips/:id`
Delete a trip permanently.

**Response `200`**
```json
{ "message": "Trip deleted", "id": "<tripId>" }
```

---

### PATCH `/api/trips/:id/publish`
Toggle a trip's public/private visibility. Generates a `publicSlug` on first publish.

**Request Body**
```json
{ "isPublic": true }
```

**Response `200`**
```json
{
  "isPublic": true,
  "publicSlug": "a1b2c3d4",
  "publicUrl": "/trips/public/a1b2c3d4"
}
```

---

## 4. Stops — nested under trips 🔒

### POST `/api/trips/:tripId/stops`
Add a city stop to a trip.

**Request Body**
```json
{
  "cityId": "<cityObjectId>",
  "cityName": "Paris",
  "startDate": "2026-09-01",
  "endDate": "2026-09-05"
}
```

**Response `201`** — full updated trip object

---

### PUT `/api/trips/:tripId/stops/:stopId`
Update a stop's details.

**Request Body** *(all fields optional)*
```json
{
  "cityName": "Paris Updated",
  "startDate": "2026-09-02",
  "endDate": "2026-09-06"
}
```

**Response `200`** — full updated trip object

---

### DELETE `/api/trips/:tripId/stops/:stopId`
Remove a stop from a trip.

**Response `200`** — full updated trip object

---

### PATCH `/api/trips/:tripId/stops/reorder`
Reorder city stops within a trip.

**Request Body**
```json
{
  "orderedStopIds": ["<stopId1>", "<stopId2>", "<stopId3>"]
}
```

**Response `200`** — full updated trip object

---

## 5. Stop Activities — nested under stops 🔒

### POST `/api/trips/:tripId/stops/:stopId/activities`
Add an activity to a stop.

**Request Body**
```json
{
  "activityId": "<activityObjectId>",
  "name": "Eiffel Tower Visit",
  "category": "sightseeing",
  "cost": 30,
  "scheduledDate": "2026-09-02",
  "scheduledTime": "10:00"
}
```

**Response `201`** — full updated trip object

---

### PUT `/api/trips/:tripId/stops/:stopId/activities/:activityId`
Update a scheduled activity.

**Request Body** *(all fields optional)*
```json
{
  "scheduledDate": "2026-09-03",
  "scheduledTime": "14:00",
  "cost": 35
}
```

**Response `200`** — full updated trip object

---

### DELETE `/api/trips/:tripId/stops/:stopId/activities/:activityId`
Remove an activity from a stop.

**Response `200`** — full updated trip object

---

### PATCH `/api/trips/:tripId/stops/:stopId/activities/reorder`
Reorder activities within a stop.

**Request Body**
```json
{
  "orderedActivityIds": ["<actId1>", "<actId2>"]
}
```

**Response `200`** — full updated trip object

---

## 6. Itinerary / Calendar / Budget 🔒

### GET `/api/trips/:tripId/itinerary`
Full day-wise itinerary grouped by city stop → day → activities.
Used for the **Itinerary View Screen**.

**Response `200`**
```json
{
  "tripId", "tripName", "startDate", "endDate", "totalDays",
  "stops": [
    {
      "stopId", "cityId", "cityName", "orderIndex",
      "startDate", "endDate",
      "days": [
        {
          "date": "2026-09-01",
          "dayNumber": 1,
          "activities": [
            {
              "id", "activityId", "name",
              "category", "scheduledTime", "cost"
            }
          ]
        }
      ]
    }
  ]
}
```

---

### GET `/api/trips/:tripId/calendar`
Flat date-indexed view of the entire trip.
Used for the **Trip Calendar / Timeline Screen**.

**Response `200`**
```json
{
  "tripId", "tripName", "startDate", "endDate",
  "days": [
    {
      "date": "2026-09-01",
      "dayNumber": 1,
      "cityName": "Paris",
      "activities": [
        {
          "id", "activityId", "name",
          "category", "scheduledTime", "cost"
        }
      ]
    }
  ]
}
```

---

### GET `/api/trips/:tripId/budget`
Full cost breakdown with per-day analysis and overbudget alerts.
Used for the **Trip Budget & Cost Breakdown Screen**.

**Response `200`**
```json
{
  "tripId", "tripName", "totalDays",
  "summary": {
    "activities": 150,
    "transport": 200,
    "stay": 400,
    "meals": 100,
    "misc": 50,
    "grandTotal": 900,
    "averageDailyCost": 45.00
  },
  "stopBreakdown": [
    { "stopId", "cityName", "activityTotal", "days" }
  ],
  "perDayBreakdown": [
    { "date": "2026-09-01", "cost": 60 }
  ],
  "overbudgetDays": [
    { "date": "2026-09-01", "cost": 60 }
  ]
}
```

---

## 7. Cities — `/api/cities` 🔒

### GET `/api/cities`
Search and filter cities.

**Query Params**
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search by city name |
| `country` | string | Filter by country |
| `region` | string | Filter by region |
| `sort` | string | `popularity` (default) or `costIndex` |
| `page` | number | Page number |
| `limit` | number | Results per page |

**Response `200`**
```json
{
  "data": [
    {
      "_id", "name", "country", "region",
      "costIndex", "popularityScore", "imageUrl"
    }
  ],
  "pagination": { "page", "limit", "total", "pages" }
}
```

---

### GET `/api/cities/:id`
Get a single city by ID.

**Response `200`** — full city object

---

## 8. Activities — `/api/activities` 🔒

### GET `/api/activities`
Browse and filter activities.

**Query Params**
| Param | Type | Description |
|-------|------|-------------|
| `cityId` | string | Filter by city |
| `category` | string | `sightseeing` · `food` · `adventure` · `culture` · `other` |
| `costMax` | number | Max cost filter |
| `durationMax` | number | Max duration in minutes |
| `search` | string | Search by activity name |
| `page` | number | Page number |
| `limit` | number | Results per page |

**Response `200`**
```json
{
  "data": [
    {
      "_id", "cityId", "name", "category",
      "cost", "durationMinutes", "description", "imageUrl"
    }
  ],
  "pagination": { "page", "limit", "total", "pages" }
}
```

---

### GET `/api/activities/:id`
Get a single activity by ID.

**Response `200`** — full activity object

---

## 9. Public Shared Trip — No Auth Required

### GET `/api/trips/public/:slug`
Read-only public view of a shared itinerary via its slug.
Used for the **Shared/Public Itinerary View Screen**.

**Response `200`**
```json
{
  "tripId", "tripName", "startDate", "endDate",
  "totalDays", "coverPhotoUrl", "description",
  "stops": [ "...same shape as /itinerary..." ]
}
```

---

## 10. AI Suggestions — `/api/suggest` 🔒

### GET `/api/suggest?place=Goa`
Returns top 6 places to visit in the given city/place using GPT-5-mini with live web search.

**Query Params**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `place` | string | ✅ | City or place name e.g. `Goa`, `Paris`, `Tokyo` |

**Response `200`**
```json
{
  "place": "Goa",
  "suggestions": [
    {
      "name": "Basilica of Bom Jesus",
      "what": "A 17th-century Baroque church in Old Goa.",
      "why": "Houses St. Francis Xavier's relics; UNESCO World Heritage site."
    }
  ]
}
```
> ⚠️ Response takes 15–30 seconds — show a loading state on the frontend.

---

## 11. AI Budget Estimate — `/api/trips/:tripId/budget/estimate` 🔒

### GET `/api/trips/:tripId/budget/estimate`
AI-powered cost estimation for the full trip. Estimates transport, accommodation, food, and activity costs per city stop using GPT-5-mini.

**Response `200`**
```json
{
  "tripId": "...",
  "tripName": "Europe Summer 2026",
  "startDate": "...",
  "endDate": "...",
  "aiEstimate": {
    "stops": [
      {
        "city": "Paris",
        "days": 4,
        "transportation_usd": 350,
        "accommodation_usd": 480,
        "food_usd": 160,
        "activities_usd": 120,
        "stop_total_usd": 1110,
        "activities": [
          { "name": "Eiffel Tower Visit", "estimated_cost_usd": 30 }
        ]
      }
    ],
    "summary": {
      "total_transportation_usd": 350,
      "total_accommodation_usd": 480,
      "total_food_usd": 160,
      "total_activities_usd": 120,
      "grand_total_usd": 1110,
      "average_per_day_usd": 277.5
    }
  }
}
```

---

## Quick Reference Table

| Method | Endpoint | Auth | Used On Screen |
|--------|----------|------|----------------|
| POST | `/api/auth/signup` | ❌ | Login / Signup |
| POST | `/api/auth/login` | ❌ | Login / Signup |
| GET | `/api/auth/me` | ✅ | App bootstrap |
| POST | `/api/auth/forgot-password` | ❌ | Forgot Password |
| POST | `/api/auth/reset-password` | ❌ | Reset Password |
| GET | `/api/users/:id` | ✅ | Profile Screen |
| PUT | `/api/users/:id` | ✅ | Profile Settings |
| DELETE | `/api/users/:id` | ✅ | Profile Settings |
| GET | `/api/trips` | ✅ | My Trips Screen |
| POST | `/api/trips` | ✅ | Create Trip Screen |
| GET | `/api/trips/:id` | ✅ | Trip Detail |
| PUT | `/api/trips/:id` | ✅ | Edit Trip |
| DELETE | `/api/trips/:id` | ✅ | My Trips Screen |
| PATCH | `/api/trips/:id/publish` | ✅ | Trip Detail |
| POST | `/api/trips/:tripId/stops` | ✅ | Itinerary Builder |
| PUT | `/api/trips/:tripId/stops/:stopId` | ✅ | Itinerary Builder |
| DELETE | `/api/trips/:tripId/stops/:stopId` | ✅ | Itinerary Builder |
| PATCH | `/api/trips/:tripId/stops/reorder` | ✅ | Itinerary Builder |
| POST | `/api/trips/:tripId/stops/:stopId/activities` | ✅ | Itinerary Builder |
| PUT | `/api/trips/:tripId/stops/:stopId/activities/:activityId` | ✅ | Itinerary Builder |
| DELETE | `/api/trips/:tripId/stops/:stopId/activities/:activityId` | ✅ | Itinerary Builder |
| PATCH | `/api/trips/:tripId/stops/:stopId/activities/reorder` | ✅ | Itinerary Builder |
| GET | `/api/trips/:tripId/itinerary` | ✅ | Itinerary View |
| GET | `/api/trips/:tripId/calendar` | ✅ | Calendar / Timeline |
| GET | `/api/trips/:tripId/budget` | ✅ | Budget Screen |
| GET | `/api/trips/public/:slug` | ❌ | Shared Trip View |
| GET | `/api/cities` | ✅ | City Search |
| GET | `/api/cities/:id` | ✅ | City Detail |
| GET | `/api/activities` | ✅ | Activity Search |
| GET | `/api/activities/:id` | ✅ | Activity Detail |

---

## Frontend Integration Notes

- After login/signup, store `token` in `localStorage` or React context
- Attach to every protected request: `headers: { Authorization: 'Bearer <token>' }`
- All list responses return `{ data: [], pagination: {} }` — use `pagination.pages` for infinite scroll or page controls
- After `PATCH /publish`, construct the shareable URL as: `<frontendBaseUrl>/shared/<publicSlug>`
- `category` enum for activities: `sightseeing` · `food` · `adventure` · `culture` · `other`
- `category` enum for trip expenses: `transport` · `stay` · `meals` · `misc`
