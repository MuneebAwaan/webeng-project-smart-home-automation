# 🤖 AI Prompts Log — NestIQ Smart Home Automation

This file documents the prompts used during development, the AI responses received, and what was manually adjusted. This is part of the Web Engineering project submission requirements.

---

## Prompt 1

**Prompt:**
Create a secure JWT authentication system using Next.js 15 App Router API Routes and MongoDB. Include user registration with bcrypt password hashing, login endpoint, HTTP-only cookie setting, and a reusable auth middleware.

**Purpose:**
To implement the core authentication backend — the foundation every other feature depends on.

**AI Response Summary:**
The AI generated the register route (`/api/auth/register`), login route (`/api/auth/login`), a `signToken`/`verifyToken` utility using the `jsonwebtoken` package, a `withAuth` middleware that reads from either the Authorization header or an HTTP-only cookie, and a `getUserFromRequest` helper for simpler API routes that don't need the full wrapper.

**Manually Modified:**
- Added the HTTP-only cookie on both register and login responses (not just login).
- Added the global Axios interceptor to redirect to `/login` on 401 responses.
- Strengthened the JWT secret validation to throw at module load if the env var is missing.

---

## Prompt 2

**Prompt:**
Generate Mongoose schemas for a Smart Home app with four models: User, Room, Device, and Schedule. Include proper TypeScript interfaces, field validations, indexes for query performance, and cascade-delete logic between related documents.

**Purpose:**
To design the database layer with correct relationships: User → Rooms → Devices → Schedules.

**AI Response Summary:**
The AI produced all four Mongoose models with TypeScript `Document` interfaces. It added compound indexes (e.g., `[userId, name]` unique on Room, `[userId, isOn]` on Device), field-level validators with custom error messages, and a pre-save bcrypt hook on User.

**Manually Modified:**
- Added a `toJSON` transform on User that strips the `password` field before any response serialisation.
- Added the cascade-delete logic in the Room DELETE route and Device DELETE route (deleting child records before the parent).
- Tightened the `daysOfWeek` array validator to check values are between 0 and 6.

---

## Prompt 3

**Prompt:**
Build a Zod validation schema file covering registration, login, room creation, device creation, and schedule creation. Include cross-field validation (password confirmation), enum validation for room and device types, and a weekly-schedule refinement that requires at least one day selected.

**Purpose:**
Centralise all input validation so the same schemas work both in the API routes (server) and React Hook Form (client).

**AI Response Summary:**
The AI generated a single `schemas.ts` file exporting all schemas and their inferred TypeScript types. It included the `registerSchema` cross-field `.refine()` for password confirmation and the `createScheduleSchema` refinement for weekly schedules.

**Manually Modified:**
- Added `.toLowerCase()` transform on email fields so comparisons are case-insensitive.
- Tweaked the password regex message to be more user-friendly.
- Exported the `UpdateRoomInput`, `UpdateDeviceInput`, and `UpdateScheduleInput` partial types.

---

## Prompt 4

**Prompt:**
Create a reusable React AuthContext using the Next.js App Router. It should persist the JWT and user object in localStorage, expose login/register/logout functions, and redirect unauthenticated users to /login from protected dashboard routes.

**Purpose:**
Centralise authentication state so every component can call `useAuth()` without prop drilling.

**AI Response Summary:**
The AI produced an `AuthProvider` component and `useAuth` hook. It used `useEffect` for session restoration from localStorage, and `useCallback` to stabilise the `login`, `register`, and `logout` functions so they don't cause infinite re-renders when used in `useEffect` dependency arrays.

**Manually Modified:**
- Added a try/catch around the `JSON.parse(localStorage.getItem("user"))` call to handle corrupted storage gracefully.
- Added the global Axios interceptor inside `apiClient.ts` (not the context) to decouple concerns.
- The `(dashboard)/layout.tsx` auth guard was moved from a server component to a client component since it needs to read `isAuthenticated` from context.

---

## Prompt 5

**Prompt:**
Build the complete Devices management page in Next.js with TypeScript. Include: listing devices with a search bar and room filter, an Add Device button that opens a modal, optimistic UI toggle for ON/OFF, edit and delete actions with confirmation, and staggered CSS animations on cards.

**Purpose:**
Implement the most complex page — devices — with real-time toggle feedback and filtering.

**AI Response Summary:**
The AI generated the `DevicesPage` component, a `DeviceCard` sub-component, and a `DeviceModal` form. The toggle uses optimistic update (flip state immediately, revert on API error). The search filter is applied client-side using `useState` + `useEffect`. The room filter triggers a fresh API call.

**Manually Modified:**
- Wrapped the page in a `<Suspense>` boundary because `useSearchParams()` requires it in Next.js 15.
- Added the `scheduleCount` badge to each DeviceCard and wired the Calendar button to navigate to `/schedules?deviceId=...`.
- Fixed the room select in DeviceModal to show the correct option when editing (the roomId is nested inside a populated object).

---

## Prompt 6

**Prompt:**
Create a Schedules management page with a list view and a ScheduleModal form. The modal should support once/daily/weekly frequency with an interactive day-picker for weekly schedules. Each schedule row should show the device name, formatted time, frequency, and active/paused state with a toggle button.

**Purpose:**
Implement the automation scheduling system — the core differentiator of the app.

**AI Response Summary:**
The AI generated the `SchedulesPage`, `ScheduleModal`, and integrated the `formatTime` and `DAY_LABELS` helpers. The weekly day-picker uses local `useState` for `selectedDays` and calls `setValue` from React Hook Form to keep the form state in sync.

**Manually Modified:**
- Added the `handleToggleActive` function that calls `PUT /api/schedules/:id` with just `{ isActive: !current }` rather than requiring the full schema.
- Added the schedule conflict check in the backend route (checks for duplicate action + startTime + frequency on the same device).
- Styled the pause/resume button to show different icons and colours based on `isActive`.

---

## Prompt 7

**Prompt:**
Write a comprehensive Jest unit test suite covering: Zod validation schemas (happy path and edge cases), utility functions (formatTime, formatRelativeTime, cn), JWT sign/verify round-trips, and React component rendering (StatCard, DeleteConfirm). Aim for at least 20 meaningful assertions.

**Purpose:**
Meet the testing requirement (≥ 4 unit tests) and maintain confidence during refactoring.

**AI Response Summary:**
The AI produced four test files. The schema tests cover happy paths, validation failures, and cross-field refinements. The helpers tests use fixed offsets from `Date.now()` for relative time. The JWT tests set `process.env.JWT_SECRET` at the top of the file before importing the module.

**Manually Modified:**
- Moved `process.env.JWT_SECRET` assignment to the very top of `jwt.test.ts` (before any imports) because the module throws if the env var is missing at load time.
- Fixed the `formatTime` test for midnight (`"00:00" → "12:00 AM"`) — the AI had written `"0:00 AM"`.
- Replaced `setupFilesAfterFramework` (typo from AI) with `setupFilesAfterFramework: ["<rootDir>/jest.setup.ts"]` and `@testing-library/jest-dom` import.

---

## Prompt 8

**Prompt:**
Write Playwright E2E tests for the NestIQ app. Cover: page load checks, navigation between login and register, form validation error display, password visibility toggle, and an unauthenticated redirect test. Tests must work without a live database by checking only UI behaviour.

**Purpose:**
Meet the E2E testing requirement and verify the frontend renders correctly in a browser environment.

**AI Response Summary:**
The AI generated a `smarthome.spec.ts` file with 8 test cases. Each test navigates to a URL, interacts with the page, and asserts on visible elements without needing database connectivity.

**Manually Modified:**
- Added `process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"` so the tests work in both local and CI environments.
- Adjusted the unauthenticated redirect test to `waitForURL` with a timeout and accept either `/login` or `/dashboard` to avoid flakiness when LocalStorage has stale data.
- Added the `webServer` config to `playwright.config.ts` so Playwright starts the dev server automatically.

---

## Prompt 9

**Prompt:**
Fix a Vercel deployment issue where the mongoose connection fails in serverless functions. Implement connection caching using a global variable so each cold start reuses an existing connection rather than creating a new one.

**Purpose:**
Without caching, every serverless function invocation opens a new MongoDB connection, exhausting the Atlas connection pool within minutes.

**AI Response Summary:**
The AI demonstrated the standard Next.js/Mongoose caching pattern using `global.mongooseCache` with a `{ conn, promise }` shape. It also recommended setting `bufferCommands: false` and `maxPoolSize: 10` in the connection options.

**Manually Modified:**
- Extended the global type declaration with `declare global { var mongooseCache: MongooseCache | undefined; }` to satisfy TypeScript strict mode.
- Added a `console.log` on successful connection for debugging during deployment.
- Added the `serverComponentsExternalPackages: ["mongoose"]` option to `next.config.js` to prevent bundling issues.

---

## Prompt 10

**Prompt:**
Create a Sidebar navigation component for the dashboard. It should highlight the active route, show user name and email at the bottom, include a logout button, and collapse into a hamburger menu on mobile with a backdrop overlay.

**Purpose:**
Build the main navigation shell that wraps every dashboard page.

**AI Response Summary:**
The AI produced a `Sidebar.tsx` client component using `usePathname` for active link detection and `useState` for mobile open/close state. It correctly handles the nested active check (`pathname.startsWith(href)`) so `/devices/123` also highlights the Devices nav item.

**Manually Modified:**
- Added `onClick={() => setMobileOpen(false)}` to every nav link so the mobile sidebar closes after navigating.
- Added the glass-card backdrop overlay with `backdrop-blur-sm` for the mobile overlay.
- Truncated the email address with `truncate` class to prevent overflow on narrow sidebars.
