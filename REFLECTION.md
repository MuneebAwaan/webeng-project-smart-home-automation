# 📝 Reflection Report — NestIQ Smart Home Automation
## Web Engineering Project | AI-Assisted Development

---

### Introduction (50 words)

This report reflects on the development of NestIQ, a full-stack Smart Home Automation system built using Next.js 15, MongoDB, TypeScript, and Tailwind CSS. The project was developed with AI assistance, and this report honestly evaluates what that collaboration looked like in practice — the wins, the friction, and the lessons.

---

### 1. How AI Assisted During Development (~150 words)

AI tools accelerated development significantly in several structured areas. Generating boilerplate — Mongoose schemas, Zod validation schemas, Next.js API route handlers — was by far the most useful application. Tasks that would normally take an hour were completed in minutes. The AI consistently produced well-structured TypeScript, remembered to include error handling, and suggested patterns (like the Mongoose connection cache for serverless) that I would not have discovered as quickly on my own.

AI also helped with repetitive symmetry: once the Rooms API was established, generating the Devices and Schedules APIs followed a pattern the AI handled cleanly. Similarly, the pattern of a modal form, a card component, a list page, and a delete confirmation was applied consistently across all three resource types.

For test writing, AI excelled at producing edge-case coverage I might have skipped — particularly for Zod schemas and the JWT utility.

---

### 2. Challenges Faced (~120 words)

The biggest challenge was Next.js 15's architectural changes. The App Router requires `"use client"` at the top of every component that uses browser APIs, React hooks, or context. Several AI-generated components omitted this directive, causing cryptic server-component errors. I learned to check for this immediately.

The `useSearchParams()` hook in Next.js 15 requires a `<Suspense>` boundary, which the AI did not initially include, resulting in a build error. This required wrapping the devices and schedules pages manually.

Managing the Mongoose connection in serverless functions was another challenge. The AI suggested the caching pattern, but the TypeScript `declare global` type extension to make strict mode happy had to be added manually. Without it, the build failed with type errors.

---

### 3. Bugs Introduced by AI (~100 words)

Several bugs were introduced that required manual correction:

- **JWT test setup**: The AI placed `process.env.JWT_SECRET` assignment after the import, but the module throws at load time if the variable is missing. Moving the assignment before the import fixed it.
- **Midnight time formatting**: `formatTime("00:00")` was expected to return `"12:00 AM"` but the AI wrote logic that returned `"0:00 AM"`.
- **Typo in Jest config**: `setupFilesAfterFramework` (wrong) instead of `setupFilesAfterEachTest` (also wrong — the correct key is `setupFilesAfterFramework` is not a valid Jest key; the correct key is `setupFilesAfterFramework` → it should be `setupFilesAfterEnv`).
- **Missing cascade delete**: The initial Room delete route did not delete associated devices and their schedules.

---

### 4. Security Concerns Addressed (~100 words)

Security was taken seriously throughout the project:

- Passwords are hashed with bcrypt using a cost factor of 12 before storing in MongoDB.
- JWT tokens are stored in HTTP-only cookies, which are inaccessible to JavaScript, preventing XSS theft. LocalStorage is used as a fallback for the Axios interceptor only.
- All API routes validate input with Zod before touching the database — no raw request bodies reach Mongoose.
- Every database query filters by `userId` to enforce data isolation between users.
- The MongoDB Atlas cluster requires username/password auth and IP allowlisting.
- Environment variables are never committed — `.gitignore` excludes all `.env.*` files.

---

### 5. Testing Experience (~100 words)

Testing was approached on two levels. Unit tests with Jest covered Zod schemas (catching edge cases like the weekly-schedule day requirement), utility functions (time formatting, className merging), JWT signing and verification, and React components (StatCard rendering, DeleteConfirm behaviour). Writing these tests actually caught two real bugs: the midnight formatting issue and the JWT setup ordering problem.

The Playwright E2E tests verified the browser-level experience — form rendering, navigation links, validation error display, and password visibility toggle. Running E2E tests without a live database was a deliberate design choice: tests focus on UI behaviour, not API responses, making them fast and CI-friendly.

---

### 6. Lessons Learned from AI-Assisted ("Vibe") Coding (~150 words)

The biggest lesson is that AI-assisted development requires an engaged reviewer, not a passive copy-paster. The AI produced excellent first drafts, but every output needed reading, understanding, and often adjusting. Blindly accepting AI output would have shipped code with subtle bugs — some of which would only surface in production (like the serverless connection caching issue).

AI is strongest at: boilerplate generation, consistent pattern application, remembering library APIs, and suggesting security best practices. It is weakest at: understanding framework-specific version changes (Next.js 15 App Router quirks), handling TypeScript strict mode edge cases, and producing test setups that account for module load-time side effects.

The workflow that worked best was: describe the requirement clearly → review the output critically → modify what is wrong → move to the next feature. AI as a senior pair programmer who needs code review, not as an autonomous developer.

---

### Conclusion (50 words)

NestIQ demonstrates that AI-assisted development can produce a production-quality full-stack application significantly faster than solo development. However, the quality of the output directly depends on the developer's ability to evaluate, debug, and improve AI-generated code. Technical knowledge remains essential — AI amplifies it rather than replacing it.
