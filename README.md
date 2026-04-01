# Multi-Tenant Booking System

A comprehensive booking system with tenant isolation, flexible scheduling (15/30/60 minute slots), 24-hour availability, and payment-confirmed appointments using Stripe.

## Features

✅ **Multi-Tenant Architecture** - Complete data isolation using tenant_id  
✅ **Flexible Scheduling** - Configure 15, 30, or 60-minute appointment slots  
✅ **24-Hour Support** - Schedule appointments any time of day  
✅ **Break Time Management** - Add custom break times to schedules  
✅ **Secure Payments** - Stripe integration with payment confirmation  
✅ **Modern UI** - Beautiful glassmorphism design with TailwindCSS  
✅ **Real-time Availability** - Dynamic slot generation respecting breaks and bookings

## Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication
- Stripe Payment Processing

**Frontend:**
- Next.js 14 (App Router)
- React + TypeScript
- TailwindCSS
- Stripe Elements

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Stripe account (test mode)

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database URL, JWT secret, and Stripe keys

# Run database migrations
npx prisma migrate dev --name init
npx prisma generate

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your API URL and Stripe publishable key

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/booking_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
PORT=5000
NODE_ENV="development"
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## Usage Guide

### For Business Owners (Tenants)

1. **Register** - Create your business account at `/register`
2. **Login** - Access your dashboard at `/login`
3. **Configure Schedules** - Set up working hours, slot durations, and break times
4. **Share Booking Link** - Copy your unique booking URL from the dashboard
5. **Manage Appointments** - View and track all bookings in real-time

### For Customers

1. Visit the business's booking page: `/book/[tenantId]`
2. Select a date and available time slot
3. Enter your contact information
4. Complete payment via Stripe
5. Receive confirmation (appointment confirmed only after payment)

## Testing

### Test Stripe Payment

Use these test card numbers:
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002

Any future expiry date and any 3-digit CVC will work.

### Test Multi-Tenancy

1. Register two different business accounts
2. Create schedules for each tenant
3. Verify that each tenant only sees their own data
4. Test booking appointments for different tenants

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new tenant
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Schedules
- `POST /api/schedules` - Create schedule
- `GET /api/schedules` - List schedules
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule
- `POST /api/schedules/:id/breaks` - Add break time
- `DELETE /api/schedules/breaks/:id` - Delete break

### Appointments
- `GET /api/appointments/available-slots` - Get available slots
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - List appointments (admin)
- `GET /api/appointments/:id` - Get appointment
- `PUT /api/appointments/:id/confirm` - Confirm appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/webhook` - Stripe webhook
- `GET /api/payments/:appointmentId` - Get payment status

## Project Structure

```
booking-system/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── tenant.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── schedule.routes.ts
│   │   │   ├── appointment.routes.ts
│   │   │   └── payment.routes.ts
│   │   └── server.ts
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── book/[tenantId]/page.tsx
    │   │   ├── dashboard/
    │   │   │   ├── page.tsx
    │   │   │   └── schedules/page.tsx
    │   │   ├── login/page.tsx
    │   │   ├── register/page.tsx
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   └── globals.css
    │   └── ...
    └── package.json
```

## License

MIT
"# bookingdao" 
