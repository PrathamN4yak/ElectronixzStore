# Electronixz E-Commerce Platform

## Overview

Electronixz is a modern e-commerce platform for premium electronics, featuring a clean Samsung-inspired design with a focus on product photography and user experience. The application provides a complete shopping experience with product browsing, detailed product views, shopping cart functionality, and contact forms. Built as a full-stack web application with React frontend and Express backend, it emphasizes visual appeal through generous whitespace, sophisticated blue accents, and responsive design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server, providing fast HMR and optimized production builds
- Wouter for lightweight client-side routing instead of React Router

**UI Component System**
- shadcn/ui component library (New York style variant) built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Component aliases configured for clean imports (`@/components`, `@/lib`, `@/hooks`)
- Comprehensive design system with defined color palette, typography scale, and spacing units documented in `design_guidelines.md`

**State Management & Data Fetching**
- TanStack Query (React Query) v5 for server state management
- Custom query client with infinite stale time and disabled automatic refetching
- Optimistic updates and cache invalidation for cart operations
- React Hook Form with Zod validation for form handling

**Design System**
- Primary color: Blue (#1428A0) for branding and CTAs
- Neutral grays for text and backgrounds with white emphasis
- CSS custom properties for theme consistency
- Responsive grid system: 1 column (mobile) → 2 columns (tablet) → 3-4 columns (desktop)
- Samsung-inspired aesthetic with generous whitespace and clean layouts

### Backend Architecture

**Server Framework**
- Express.js as the HTTP server
- TypeScript with ESM module system
- Custom Vite middleware integration for development with HMR
- Request/response logging middleware for API monitoring

**Data Layer Strategy**
- Currently using in-memory storage (MemStorage class) as the data persistence layer
- Schema definitions using Drizzle ORM with PostgreSQL dialect for future database migration
- Drizzle Kit configured for schema migrations (output to `./migrations` directory)
- Neon Database serverless driver configured for production PostgreSQL connection

**API Design**
- RESTful API endpoints under `/api` prefix
- CRUD operations for products, cart items, and contact messages
- Zod schema validation on all POST/PATCH endpoints
- Consistent error handling with appropriate HTTP status codes

**Storage Interface Pattern**
- IStorage interface defines contract for all data operations
- MemStorage implements interface with in-memory Maps for development
- Designed for easy swap to database-backed implementation
- Sample product data initialization in constructor

### Data Models

**Product Schema**
- UUID primary keys
- Fields: name, category, price (decimal), description, image path, specifications array, featured flag
- Zod validation schemas generated from Drizzle schema

**Cart Schema**
- Simple cart items with product ID reference and quantity
- No user authentication - session-based cart (single shared cart)

**Contact Messages**
- Captures name, email, and message with Zod validation
- Email format and minimum length validation enforced

### Routing Structure

**Client Routes (Wouter)**
- `/` - Home page with hero banner, featured products, and category grid
- `/products` - Product listing page with grid layout
- `/product/:id` - Individual product detail page
- `/cart` - Shopping cart with quantity controls and checkout
- `/about` - Company information and values
- `/contact` - Contact form with validation

**API Routes (Express)**
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get single product
- `GET /api/cart` - Get all cart items
- `POST /api/cart` - Add item to cart
- `PATCH /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart
- `POST /api/contact` - Submit contact message

## External Dependencies

**UI & Styling**
- @radix-ui/* - Headless UI component primitives (25+ component packages)
- Tailwind CSS with PostCSS for styling
- class-variance-authority and clsx for conditional styling
- lucide-react for icon system
- Google Fonts (Inter/Roboto family) loaded via CDN

**State & Forms**
- @tanstack/react-query - Server state management and caching
- react-hook-form - Form state management
- @hookform/resolvers - Zod integration for form validation
- zod - Runtime type validation

**Database & ORM**
- drizzle-orm - TypeScript ORM with schema builder
- drizzle-zod - Generate Zod schemas from Drizzle tables
- @neondatabase/serverless - Neon PostgreSQL serverless driver
- drizzle-kit - Migration tool and schema push utility

**Development Tools**
- @replit/vite-plugin-* - Replit-specific development enhancements
- tsx - TypeScript execution for development server
- esbuild - Production server bundling

**Build Configuration**
- Vite aliases: `@` → client/src, `@shared` → shared, `@assets` → attached_assets
- Public build output: `dist/public`
- Server build output: `dist` (bundled with esbuild)