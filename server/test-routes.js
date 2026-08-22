import dotenv from "dotenv";
dotenv.config();

const BASE = `http://localhost:${process.env.PORT || 8000}`;
let TOKEN = "";
let USER_ID = "";
let TRIP_ID = "";
let STOP_ID = "";
let CITY_ID = "";
let ACTIVITY_ID = "";

const TEST_EMAIL = `test_${Date.now()}@globetrotter.test`;
const TEST_PASSWORD = "Test@1234";

let passed = 0;
let failed = 0;

async function req(method, path, body, auth = true) {
  const headers = { "Content-Type": "application/json" };
  if (auth && TOKEN) headers["Authorization"] = `Bearer ${TOKEN}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json;
  try { json = await res.json(); } catch { json = {}; }
  return { status: res.status, body: json };
}

function assert(label, condition, info = "") {
  if (condition) {
    console.log(`  ✅ PASS  ${label}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL  ${label}${info ? "  →  " + info : ""}`);
    failed++;
  }
}

console.log("\n📋  Health");
{
  const r = await fetch(`${BASE}/health`);
  const txt = await r.text();
  assert("GET /health → 200", r.status === 200, txt);
}

console.log("\n📋  Auth");
{
  // Signup
  const r = await req("POST", "/api/auth/signup",
    { name: "Test User", email: TEST_EMAIL, password: TEST_PASSWORD }, false);
  assert("POST /api/auth/signup → 201", r.status === 201, JSON.stringify(r.body));
  TOKEN = r.body.token || "";
  USER_ID = r.body.user?.id || "";

  // Login
  const r2 = await req("POST", "/api/auth/login",
    { email: TEST_EMAIL, password: TEST_PASSWORD }, false);
  assert("POST /api/auth/login → 200", r2.status === 200, JSON.stringify(r2.body));
  TOKEN = r2.body.token || TOKEN;

  // Me
  const r3 = await req("GET", "/api/auth/me");
  assert("GET /api/auth/me → 200", r3.status === 200, JSON.stringify(r3.body));

  // No token → 401
  const r4 = await req("GET", "/api/auth/me", null, false);
  assert("GET /api/auth/me (no token) → 401", r4.status === 401);

  // Forgot password
  const r5 = await req("POST", "/api/auth/forgot-password", { email: TEST_EMAIL }, false);
  assert("POST /api/auth/forgot-password → 200", r5.status === 200, JSON.stringify(r5.body));
}

console.log("\n📋  Users");
{
  const r = await req("GET", `/api/users/${USER_ID}`);
  assert("GET /api/users/:id → 200", r.status === 200, JSON.stringify(r.body));

  const r2 = await req("PUT", `/api/users/${USER_ID}`, { name: "Updated Name" });
  assert("PUT /api/users/:id → 200", r2.status === 200, JSON.stringify(r2.body));
  assert("PUT /api/users/:id  name updated", r2.body.name === "Updated Name");

  const r3 = await req("GET", "/api/users/invalid-id");
  assert("GET /api/users/invalid-id → 400", r3.status === 400);
}

console.log("\n📋  Cities");
{
  const r = await req("GET", "/api/cities");
  assert("GET /api/cities → 200", r.status === 200, JSON.stringify(r.body));
  assert("GET /api/cities  has data+pagination keys",
    r.body.data !== undefined && r.body.pagination !== undefined);

  const r2 = await req("GET", "/api/cities?search=paris&sort=popularity");
  assert("GET /api/cities?search=paris&sort=popularity → 200", r2.status === 200);

  const r3 = await req("GET", "/api/cities?country=France&region=Europe");
  assert("GET /api/cities?country=France&region=Europe → 200", r3.status === 200);

  if (r.body.data?.length > 0) {
    CITY_ID = r.body.data[0]._id;
    const r4 = await req("GET", `/api/cities/${CITY_ID}`);
    assert("GET /api/cities/:id → 200", r4.status === 200, JSON.stringify(r4.body));
  } else {
    console.log("  ⚠️  SKIP  GET /api/cities/:id  (no cities in DB — seed some data to test)");
  }

  const r5 = await req("GET", "/api/cities/invalid-id");
  assert("GET /api/cities/invalid-id → 400", r5.status === 400);
}

console.log("\n📋  Activities");
{
  const r = await req("GET", "/api/activities");
  assert("GET /api/activities → 200", r.status === 200, JSON.stringify(r.body));
  assert("GET /api/activities  has data+pagination keys",
    r.body.data !== undefined && r.body.pagination !== undefined);

  const r2 = await req("GET", "/api/activities?category=food&costMax=50");
  assert("GET /api/activities?category=food&costMax=50 → 200", r2.status === 200);

  if (r.body.data?.length > 0) {
    ACTIVITY_ID = r.body.data[0]._id;
    const r3 = await req("GET", `/api/activities/${ACTIVITY_ID}`);
    assert("GET /api/activities/:id → 200", r3.status === 200);
  } else {
    console.log("  ⚠️  SKIP  GET /api/activities/:id  (no activities in DB)");
  }

  const r4 = await req("GET", "/api/activities/invalid-id");
  assert("GET /api/activities/invalid-id → 400", r4.status === 400);
}

console.log("\n📋  Trips");
{
  const r = await req("POST", "/api/trips", {
    name: "Test Trip",
    description: "A test",
    startDate: "2026-09-01",
    endDate: "2026-09-15"
  });
  assert("POST /api/trips → 201", r.status === 201, JSON.stringify(r.body));
  TRIP_ID = r.body._id || "";

  const r2 = await req("GET", "/api/trips");
  assert("GET /api/trips → 200", r2.status === 200);
  assert("GET /api/trips  has data+pagination keys",
    r2.body.data !== undefined && r2.body.pagination !== undefined);

  const r3 = await req("GET", `/api/trips/${TRIP_ID}`);
  assert("GET /api/trips/:id → 200", r3.status === 200);

  const r4 = await req("PUT", `/api/trips/${TRIP_ID}`, { name: "Updated Trip" });
  assert("PUT /api/trips/:id → 200", r4.status === 200);
  assert("PUT /api/trips/:id  name updated", r4.body.name === "Updated Trip");

  const r5 = await req("PATCH", `/api/trips/${TRIP_ID}/publish`, { isPublic: true });
  assert("PATCH /api/trips/:id/publish → 200", r5.status === 200);
  assert("PATCH /api/trips/:id/publish  isPublic=true", r5.body.isPublic === true);
}

console.log("\n📋  Trip Stops");
{
  const fakeCityId = CITY_ID || "64f1a2b3c4d5e6f7a8b9c0d1"; // fallback fake id
  const r = await req("POST", `/api/trips/${TRIP_ID}/stops`, {
    cityId: fakeCityId,
    cityName: "Paris",
    startDate: "2026-09-01",
    endDate: "2026-09-05"
  });
  assert("POST /api/trips/:tripId/stops → 201", r.status === 201, JSON.stringify(r.body));
  STOP_ID = r.body.stops?.[0]?._id || "";

  if (STOP_ID) {
    const r2 = await req("PATCH", `/api/trips/${TRIP_ID}/stops/reorder`, {
      orderedStopIds: [STOP_ID]
    });
    assert("PATCH /api/trips/:tripId/stops/reorder → 200", r2.status === 200);
  }

  if (STOP_ID) {
    const r3 = await req("PUT", `/api/trips/${TRIP_ID}/stops/${STOP_ID}`, {
      cityName: "Paris Updated"
    });
    assert("PUT /api/trips/:tripId/stops/:stopId → 200", r3.status === 200);
  }
}

console.log("\n📋  Stop Activities");
{
  if (STOP_ID) {
    const fakeActivityId = ACTIVITY_ID || "64f1a2b3c4d5e6f7a8b9c0d2";
    const r = await req("POST", `/api/trips/${TRIP_ID}/stops/${STOP_ID}/activities`, {
      activityId: fakeActivityId,
      name: "Eiffel Tower Visit",
      category: "sightseeing",
      scheduledDate: "2026-09-02",
      scheduledTime: "10:00",
      cost: 30
    });
    assert("POST /api/trips/:tripId/stops/:stopId/activities → 201",
      r.status === 201, JSON.stringify(r.body));

    const addedActivityId = r.body.stops?.[0]?.activities?.[0]?._id;
    if (addedActivityId) {
      // Update activity
      const r2 = await req("PUT",
        `/api/trips/${TRIP_ID}/stops/${STOP_ID}/activities/${addedActivityId}`,
        { cost: 35 });
      assert("PUT  .../activities/:activityId → 200", r2.status === 200);

      const r3 = await req("PATCH",
        `/api/trips/${TRIP_ID}/stops/${STOP_ID}/activities/reorder`,
        { orderedActivityIds: [addedActivityId] });
      assert("PATCH .../activities/reorder → 200", r3.status === 200);

      const r4 = await req("DELETE",
        `/api/trips/${TRIP_ID}/stops/${STOP_ID}/activities/${addedActivityId}`);
      assert("DELETE .../activities/:activityId → 200", r4.status === 200);
    }
  } else {
    console.log("  ⚠️  SKIP  Stop activity tests (no stop was created)");
  }
}

console.log("\n📋  Itinerary, Calendar & Budget");
{
  if (TRIP_ID) {
    const r1 = await req("GET", `/api/trips/${TRIP_ID}/itinerary`);
    assert("GET /api/trips/:tripId/itinerary → 200", r1.status === 200, JSON.stringify(r1.body));

    const r2 = await req("GET", `/api/trips/${TRIP_ID}/calendar`);
    assert("GET /api/trips/:tripId/calendar → 200", r2.status === 200, JSON.stringify(r2.body));

    const r3 = await req("GET", `/api/trips/${TRIP_ID}/budget`);
    assert("GET /api/trips/:tripId/budget → 200", r3.status === 200, JSON.stringify(r3.body));

    const pubRes = await req("PATCH", `/api/trips/${TRIP_ID}/publish`, { isPublic: true });
    const slug = pubRes.body.publicSlug;

    if (slug) {
      const pubView = await req("GET", `/api/trips/public/${slug}`, null, false);
      assert("GET /api/trips/public/:slug (unauthenticated) → 200", pubView.status === 200, JSON.stringify(pubView.body));
    }
  }
}

console.log("\n📋  AI Suggestions");
{
  try {
    const r = await req("GET", "/api/suggest?place=Paris");
    assert("GET /api/suggest?place=Paris → 200", r.status === 200, JSON.stringify(r.body));

    const rRoute = await req("GET", "/api/suggest/stops?from=Paris&to=Rome");
    assert("GET /api/suggest/stops?from=Paris&to=Rome → 200", rRoute.status === 200, JSON.stringify(rRoute.body));

    const rBudget = await req("POST", "/api/suggest/budget", {
      stops: [{ cityName: "Paris", days: 3 }, { cityName: "Rome", days: 4 }]
    });
    assert("POST /api/suggest/budget → 200", rBudget.status === 200, JSON.stringify(rBudget.body));

    const rOpt = await req("POST", "/api/suggest/optimize-route", {
      origin: "Gujarat",
      destinations: ["Bangalore", "Mumbai"]
    });
    assert("POST /api/suggest/optimize-route → 200", rOpt.status === 200, JSON.stringify(rOpt.body));

    if (TRIP_ID) {
      const rTripOpt = await req("POST", `/api/trips/${TRIP_ID}/optimize-route`);
      assert("POST /api/trips/:id/optimize-route → 200", rTripOpt.status === 200, JSON.stringify(rTripOpt.body));
    }
  } catch (err) {
    console.warn("  ⚠️  AI Suggestions Test Skipped (External Network Socket Reset):", err.message);
  }
}

console.log("\n📋  Cleanup");
{
  if (STOP_ID) {
    const r = await req("DELETE", `/api/trips/${TRIP_ID}/stops/${STOP_ID}`);
    assert("DELETE /api/trips/:tripId/stops/:stopId → 200", r.status === 200);
  }

  const r2 = await req("DELETE", `/api/trips/${TRIP_ID}`);
  assert("DELETE /api/trips/:id → 200", r2.status === 200);

  const r3 = await req("DELETE", `/api/users/${USER_ID}`);
  assert("DELETE /api/users/:id → 200", r3.status === 200, JSON.stringify(r3.body));
}

console.log(`\n${"─".repeat(50)}`);
console.log(`  Results:  ✅ ${passed} passed   ❌ ${failed} failed`);
console.log(`${"─".repeat(50)}\n`);
if (failed > 0) process.exit(1);
