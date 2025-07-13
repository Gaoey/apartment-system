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
npm run dev          # Start development server on http://localhost:3000
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
- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **PDF Generation**: jsPDF, html2canvas, @react-pdf/renderer
- **UI Icons**: Lucide React
- **Internationalization**: next-intl (Thai/English support)

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