# 🏠 NestIQ – Smart Home Automation System

A production-ready Smart Home Automation web application built for the Web Engineering university project. Manage rooms, control smart devices, and schedule automation — all from one secure, responsive interface.

---

## 📸 Features at a Glance

| Feature | Description |
|---|---|
| 🔐 **Auth** | JWT-secured signup, login, logout with bcrypt password hashing |
| 🏠 **Rooms** | Create, edit, delete rooms (Bedroom, Kitchen, Office, etc.) |
| 💡 **Devices** | Add and control lights, fans, AC, heaters — toggle ON/OFF in real time |
| ⏰ **Schedules** | Automate devices with once / daily / weekly recurring schedules |
| 📊 **Dashboard** | Live stats — active devices, schedule count, recent activity |
| 📱 **Responsive** | Fully mobile-friendly with a collapsible sidebar |

---

## 🛠 Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS** + custom design system
- **React Hook Form** + **Zod** — form validation
- **Axios** — HTTP client
- **Framer Motion / CSS animations**
- **Lucide React** — icons

### Backend
- **Next.js API Routes** (serverless-compatible)
- **MongoDB** with **Mongoose** ODM
- **JWT** authentication + **bcryptjs** password hashing

### Testing
- **Jest** + **React Testing Library** — unit tests
- **Playwright** — E2E tests

### Deployment
- **Vercel** (frontend + serverless API)
- **MongoDB Atlas** (cloud database)

---

## 📁 Folder Structure

```
webeng-project-smart-home-automation/
├── src/
│   ├── app/
│   │   ├── (auth)/               # Login & Register pages (unprotected)
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/          # Protected dashboard pages
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── rooms/page.tsx
│   │   │   ├── devices/page.tsx
│   │   │   ├── schedules/page.tsx
│   │   │   └── layout.tsx        # Auth guard + sidebar
│   │   ├── api/
│   │   │   ├── auth/             # register, login, logout, me
│   │   │   ├── rooms/            # CRUD + [id]
│   │   │   ├── devices/          # CRUD + [id] + [id]/toggle
│   │   │   ├── schedules/        # CRUD + [id]
│   │   │   └── dashboard/        # Aggregated stats
│   │   ├── layout.tsx            # Root layout (AuthProvider, Toaster)
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/Sidebar.tsx
│   │   ├── dashboard/StatCard.tsx
│   │   ├── rooms/RoomModal.tsx
│   │   ├── devices/DeviceCard.tsx
│   │   ├── devices/DeviceModal.tsx
│   │   ├── schedules/ScheduleModal.tsx
│   │   └── ui/DeleteConfirm.tsx
│   ├── hooks/
│   │   └── useAuth.tsx           # AuthContext + hook
│   ├── lib/
│   │   ├── db/mongoose.ts        # DB connection with caching
│   │   ├── middleware/auth.ts    # JWT middleware (withAuth)
│   │   ├── utils/
│   │   │   ├── jwt.ts            # signToken / verifyToken
│   │   │   ├── apiClient.ts      # Axios instance + typed API helpers
│   │   │   └── helpers.ts        # formatTime, cn, label maps
│   │   └── validations/schemas.ts # Zod schemas
│   ├── models/
│   │   ├── User.ts
│   │   ├── Room.ts
│   │   ├── Device.ts
│   │   └── Schedule.ts
│   └── types/index.ts
├── tests/
│   ├── unit/
│   │   ├── validations.test.ts   # Zod schema tests
│   │   ├── helpers.test.ts       # Utility function tests
│   │   ├── jwt.test.ts           # JWT sign/verify tests
│   │   └── components.test.tsx   # React component tests
│   └── e2e/
│       └── smarthome.spec.ts     # Playwright E2E tests
├── .env.example
├── .env.local                    # Your local secrets (not committed)
├── jest.config.ts
├── playwright.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
├── AI_PROMPTS.md
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/smarthome?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_minimum_32_chars_long
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

> **Security note:** Never commit `.env.local` to version control. The `.gitignore` already excludes it.

---

## 🚀 Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/webeng-project-smart-home-automation.git
cd webeng-project-smart-home-automation
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your MongoDB Atlas URI and JWT secret
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Tests

### Unit tests (Jest)

```bash
npm run test          # Run all unit tests once
npm run test:watch    # Watch mode
```

### E2E tests (Playwright)

```bash
# First install Playwright browsers (one-time setup)
npx playwright install

# Run E2E tests (starts dev server automatically)
npm run test:e2e

# Open interactive UI mode
npm run test:e2e:ui
```

---

## 📦 Production Build

```bash
npm run build   # Build for production
npm run start   # Start production server locally
npm run lint    # Check for ESLint errors
```

---

## ☁️ Deploying to Vercel

### Option A – Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Option B – GitHub Integration

1. Push the repository to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project**.
3. Import your GitHub repository.
4. Add environment variables in the Vercel dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN` → `7d`
5. Click **Deploy**.

### Setting up MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user with read/write access.
3. Whitelist `0.0.0.0/0` in Network Access (for Vercel serverless IPs).
4. Copy the connection string and paste it into `MONGODB_URI`.

---

## 🌐 API Reference

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Get current user |

### Rooms

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rooms` | List all rooms |
| POST | `/api/rooms` | Create a room |
| PUT | `/api/rooms/:id` | Update a room |
| DELETE | `/api/rooms/:id` | Delete room + cascade |

### Devices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/devices?roomId=` | List devices (filter by room) |
| POST | `/api/devices` | Add a device |
| PUT | `/api/devices/:id` | Update a device |
| DELETE | `/api/devices/:id` | Delete device + schedules |
| PATCH | `/api/devices/:id/toggle` | Toggle ON/OFF |

### Schedules

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/schedules?deviceId=` | List schedules |
| POST | `/api/schedules` | Create schedule |
| PUT | `/api/schedules/:id` | Update schedule |
| DELETE | `/api/schedules/:id` | Delete schedule |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Aggregated home stats |

> All endpoints except `/api/auth/register` and `/api/auth/login` require a valid JWT (cookie or `Authorization: Bearer <token>` header).

---

## 🗄️ Database Schemas

### User
```
name, email (unique), password (hashed), role ("user" | "admin")
```

### Room
```
name, type (bedroom|kitchen|living_room|office|bathroom|garage|basement|other),
userId → User (indexed)
Unique index: [userId, name]
```

### Device
```
name, type (light|fan|ac|heater|chiller|tv|camera|lock|thermostat|speaker|other),
roomId → Room, userId → User, isOn: Boolean
Indexes: [userId, roomId], [userId, isOn]
```

### Schedule
```
deviceId → Device, userId → User,
action ("on"|"off"), startTime (HH:MM), endTime (HH:MM, optional),
frequency ("once"|"daily"|"weekly"), daysOfWeek [0-6], isActive
Indexes: [userId, deviceId], [userId, isActive]
```

---

## 📋 Live Demo

🔗 **Deployment URL:** _Add your Vercel deployment link here after deployment_

---

## 📝 License

This project was developed as part of a Web Engineering university module.
