# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Apartment Rental Billing System built with Next.js 15, TypeScript, Tailwind CSS, and MongoDB. The system manages apartment buildings, rooms, tenants, and generates billing invoices with PDF export capabilities.

## Development Commands

### Setup & Installation
```bash
npm install
```

### Development
```bash
npm run dev          # Start development server with --turbopack on http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Setup
- Ensure MongoDB is running locally or configure MONGODB_URI in .env.local
- Copy .env.example to .env.local and configure database connection
- Default local connection: `mongodb://localhost:27017/bill-renting`

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS 4.0
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **PDF Generation**: @react-pdf/renderer, jsPDF, html2canvas, react-pdf
- **UI Icons**: Lucide React
- **Internationalization**: next-intl (Thai/English support)
- **Date Handling**: date-fns

### Project Structure
```
src/
├── app/
│   ├── [locale]/          # Locale-based routing (th/en)
│   │   ├── api/          # API routes
│   │   │   ├── apartments/ # Apartment CRUD operations
│   │   │   ├── bills/     # Bill management
│   │   │   └── rooms/     # Room operations
│   │   ├── apartments/    # Apartment management pages
│   │   ├── bills/        # Billing pages
│   │   ├── settings/     # Owner settings
│   │   └── page.tsx      # Homepage
│   └── layout.tsx        # Root layout
├── components/           # Reusable React components
│   ├── Header.tsx       # Main navigation header
│   └── LanguageSwitcher.tsx # Language switching component
├── lib/
│   └── mongodb.ts       # Database connection
├── models/              # Mongoose schemas
│   ├── Apartment.ts     # Apartment model
│   ├── Room.ts         # Room model
│   ├── Bill.ts         # Bill model with auto-calculations
│   └── Owner.ts        # Owner information model
├── i18n.ts             # Internationalization configuration
└── middleware.ts       # Next.js middleware for locale routing
messages/               # Translation files
├── th.json            # Thai translations
└── en.json            # English translations
```

### Internationalization Architecture

The application uses **route-based internationalization** with Thai as the default language:

#### Key Components:
1. **Middleware** (`src/middleware.ts`): Handles locale detection and routing
2. **Route Structure**: All pages are under `/[locale]/` dynamic segment
3. **Translation Files**: JSON files in `/messages/` directory
4. **Language Switcher**: Client-side component for dynamic language switching

#### URL Patterns:
- `/th/apartments` - Thai version (default)
- `/en/apartments` - English version
- `/apartments` - Redirects to `/th/apartments`

#### Usage in Components:
```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations('ComponentName');
return <h1>{t('title')}</h1>;
```

### Database Models

#### Apartment
- name, address, phone, taxId
- One apartment can have multiple rooms

#### Room
- apartmentId (reference), roomNumber
- Belongs to one apartment

#### Bill
- apartmentId, roomId, billingDate
- Tenant information (name, address, phone, taxId)
- Rental period (from, to dates)
- Charges: rent, discount, electricity, water, aircon, fridge, dynamic other fees (array of {description, amount})
- Auto-calculated fields: netRent, electricityCost, waterCost, grandTotal
- Pre-save hook automatically calculates totals

#### Owner
- name, address, phone, taxId
- Static information used on invoices

### API Endpoints

#### Apartments
- `GET /api/apartments` - List all apartments
- `POST /api/apartments` - Create apartment
- `GET /api/apartments/[id]` - Get apartment by ID
- `PUT /api/apartments/[id]` - Update apartment
- `DELETE /api/apartments/[id]` - Delete apartment

#### Bills
- `GET /api/bills` - List bills (supports apartmentId, roomId filters)
- `POST /api/bills` - Create new bill (auto-calculates totals)
- `GET /api/bills/[id]` - Get bill by ID
- `PUT /api/bills/[id]` - Update bill
- `DELETE /api/bills/[id]` - Delete bill
- `GET /api/bills/[id]/with-running-number` - Get bill with generated running number
- `GET /api/bills/latest-room-data` - Get latest room data for new bill creation
- `POST /api/bills/latest-room-data` - Update tenant info for current month bills
- `GET /api/bills/monthly-summary` - Get monthly bill summary report

#### Rooms
- `GET /api/rooms` - List rooms (supports apartmentId filter)
- `POST /api/rooms` - Create room
- `GET /api/rooms/[id]` - Get room by ID
- `PUT /api/rooms/[id]` - Update room
- `DELETE /api/rooms/[id]` - Delete room

#### Owner
- `GET /api/owner` - Get owner information
- `POST /api/owner` - Create/update owner information

### Key Features Implemented

1. **Multi-Apartment Management**: Create, update, delete apartments
2. **Room Management**: Each apartment can have multiple rooms
3. **Bill Generation**: Automatic calculation of utility costs and totals
4. **Dynamic Other Fees**: Add, update, remove multiple other fees with descriptions
5. **Form Validation**: Comprehensive client-side validation with error messages
6. **Internationalization (i18n)**:
   - Thai language as default
   - English language support
   - Dynamic language switching
   - Localized routes (/th/*, /en/*)
   - Translation-ready navigation and components
7. **Billing Logic**:
   - Net Rent = Rent - Discount
   - Electricity Cost = (End Meter - Start Meter) × Rate + Meter Fee
   - Water Cost = (End Meter - Start Meter) × Rate + Meter Fee
   - Grand Total = Net Rent + Electricity + Water + Aircon + Fridge + Sum of Other Fees

### Development Guidelines

1. **Database Operations**: Always use `dbConnect()` before mongoose operations
2. **Error Handling**: API routes return consistent `{success: boolean, data/error}` format
3. **Model Validation**: Mongoose schemas include validation and required fields
4. **Auto-calculations**: Bill model uses pre-save hooks for automatic calculations
5. **TypeScript**: Strict typing with interfaces for all models and API responses
6. **Internationalization**: Use useTranslations() hook for all user-facing text
7. **Form Validation**: Implement comprehensive validation with localized error messages

### TypeScript Patterns for MongoDB Population

When using `.populate()` with Mongoose queries, create interface types for populated documents:

```typescript
// For populated documents
interface PopulatedBill extends Omit<IBill, 'roomId' | 'apartmentId'> {
  roomId: IRoom;
  apartmentId: IApartment;
}

// Cast populated queries
const bill = await Bill.findOne({})
  .populate("apartmentId", "name")
  .populate("roomId", "roomNumber") as unknown as PopulatedBill;
```

This pattern resolves TypeScript errors when accessing populated fields like `bill.roomId.roomNumber`.

### Future Implementation Tasks

- PDF generation with bill template (3 sections: Original, Customer Copy, Tax Invoice)
- Auto-generate document numbers
- Bulk bill generation
- Email PDF functionality
- Room management UI
- Complete apartment and bill management interfaces

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `NEXT_PUBLIC_APP_NAME`: Application name for branding

## Progress Tracking with `PROGRESS.md`
Claude must follow this protocol when interacting with the `PROGRESS.md` file:
### Update Protocol
1. **Read Current State**  
   Always read the full current content of `PROGRESS.md` before making any changes.
2. **Validate Change Context**  
   Make sure the update aligns with the current progress. Avoid skipping steps or overwriting newer updates.
3. **Apply Changes Carefully**  
   Only edit the parts of `PROGRESS.md` that are relevant to the update. Maintain formatting and structure.

### Error Handling
If Claude encounters an error or inconsistency while updating `PROGRESS.md`:
1. **Do Not Proceed Immediately**  
   Stop and do not apply the update.
2. **Recheck `PROGRESS.md`**  
   Reload and verify the current state of `PROGRESS.md`.
3. **Synchronize and Retry**  
   If the problem was due to a stale view, retry the update with the refreshed state. Otherwise, report or skip the update safely.
> ⚠️ **Important:** Claude should be conservative — never assume it's safe to update without confirming with the latest content in `PROGRESS.md`.
