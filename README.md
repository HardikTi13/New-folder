# Badminton Court Booking System (Prototype)

A full-stack web application for booking badminton courts, managing availability, and tracking revenue. This prototype is built with a focus on a modern "Zero Login" experience for quick demonstration.

## 🚀 Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **State Management**: React Hooks
- **Styling**: Tailwind CSS + Shadcn Components

## ✨ Features

- **Booking System**: Interactive calendar and slot selector with real-time availability check.
- **Dynamic Pricing**: Calculates cost based on Court Type, Peak Hours, Weekend Rates, and Add-ons (Coaches, Equipment).
- **Dashboard**: View your booking history and status (Upcoming/Completed).
- **Admin Panel**: View total revenue, total bookings, and a master list of all reservations.
- **Atomic Transactions**: Prevents double-booking using Prisma transaction API.

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database (Local or Cloud like Supabase)

### 1. Clone & Install
```bash
# Clone the repository
git clone <repository-url>
cd <project-folder>

# Install Root Dependencies (concurrently)
npm install

# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 2. Environment Setup

Create a `.env` file in the `server` directory:

```env
# server/.env
PORT=4000
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
# If using Supabase Transaction pooler on port 6543:
# DATABASE_URL="postgresql://...:6543/postgres?schema=public&pgbouncer=true"
```

### 3. Database Setup (Prisma)

Running from the `server` directory:

```bash
# Push Schema to DB
npx prisma db push

# Seed Initial Data (Courts, Coaches, Rules)
npx ts-node prisma/seed.ts
```

### 4. Running the App

From the **Root** directory:

```bash
npm run dev
```

This will run both client and server concurrently:
- **Frontend**: [http://localhost:5173](http://localhost:5173) (or 5174)
- **Backend**: [http://localhost:4000](http://localhost:4000)

## 📂 Project Structure

```
├── client/             # Vite + React Frontend
│   ├── src/
│   │   ├── components/ # Shadcn UI & Custom Components
│   │   ├── pages/      # Booking, Dashboard, Admin Pages
│   │   ├── lib/        # API Client & Utils
│   └── ...
├── server/             # Express Backend
│   ├── prisma/         # Schema & Seed Script
│   ├── src/
│   │   ├── controllers/# Business Logic
│   │   ├── services/   # Pricing & Availability Services
│   │   ├── routes/     # API Routes
│   └── ...
└── package.json        # Root script to run both
```

## 📝 Prototype Notes
- **User System**: No login required. Defaults to a `demo-user` ID for the dashboard.
- **Inventory**: Checks stock availability but does not persistently decrement generic inventory count across days (Simplified for prototype).

## License
MIT
