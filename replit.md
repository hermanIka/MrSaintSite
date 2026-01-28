# Mr Saint Travel Agency Website

## Overview

Mr Saint is a premium travel agency website offering three core services: visa facilitation, travel agency creation consulting/coaching, and organized business trips. The site is built as a modern, full-stack web application with a luxury design aesthetic featuring gold and black color schemes. It currently uses in-memory storage with plans to transition to a PostgreSQL database for dynamic content management.

The application serves as both a marketing platform and a foundation for future e-commerce functionality, with UI elements for payment processing designed but not yet active.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tools**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching

**UI Component System**
- Shadcn UI component library (New York style variant) providing pre-built, accessible components
- Radix UI primitives for complex interactive components (dialogs, dropdowns, accordions, etc.)
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theming support (light/dark modes)

**Design System Implementation**
- Strict color palette: Primary Gold (#F2C94C), Deep Black (#000000), Anthracite Gray (#1A1A1A), Metallic Gold (#CFAF59), Pure White (#FFFFFF)
- Typography: Poppins/Montserrat for headings, Inter for body text
- Consistent spacing system using Tailwind units (4, 6, 8, 12, 16, 20, 24)
- Responsive breakpoints handled via Tailwind's mobile-first approach

**State Management Strategy**
- React Query for server state with aggressive caching (staleTime: Infinity)
- React Context for theme management (light/dark mode toggle)
- Local component state using hooks for UI interactions
- Form state managed via React Hook Form with Zod validation

**Page Structure**
- Home: Hero section, services grid, benefits, testimonials carousel, CTA
- Service pages: FacilitationVisa, CreationAgence with dedicated layouts
- Voyages: Trip listing page with filtering capability
- TripDetail: Dynamic route for individual trip details
- Portfolio: Showcase of client success stories
- Contact: Form with validation (non-functional submission)

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for type-safe API development
- ESM (ES Modules) for modern JavaScript module system
- Custom middleware for request logging and JSON body parsing

**Data Layer**
- Current: In-memory storage using Map data structures (MemStorage class)
- Future: Drizzle ORM configured for PostgreSQL with Neon serverless adapter
- Database schema defined with three main entities: trips, testimonials, portfolio
- UUID-based primary keys using PostgreSQL's gen_random_uuid()

**API Design**
- RESTful endpoints following resource-based routing conventions
- GET /api/trips - Retrieve all trips
- GET /api/trips/:id - Retrieve single trip by ID
- GET /api/testimonials - Retrieve all testimonials
- GET /api/portfolio - Retrieve all portfolio items
- Error handling with appropriate HTTP status codes (404, 500)

**Development Setup**
- Vite middleware integration for HMR in development
- SSR-ready architecture with template rendering capability
- Production build uses esbuild for server bundling
- Separate client and server build outputs

**Storage Abstraction**
- IStorage interface defines contract for data operations
- MemStorage provides in-memory implementation with seed data
- Design allows easy swapping to database-backed storage without API changes
- Seed data includes sample trips, testimonials, and portfolio items

### Asset Management

**Static Assets**
- Images stored in /attached_assets/generated_images/
- Asset path aliasing configured in Vite (@assets resolver)
- Design guidelines document stored as attached asset
- Favicon and fonts loaded from static paths

**Font Loading**
- Google Fonts (Poppins, Montserrat, Inter) loaded via CDN
- Preconnect hints for performance optimization
- Font-display: swap for better perceived performance

### Routing Strategy

**Client-Side Routing**
- Wouter for minimal bundle size (1KB vs React Router's ~40KB)
- Route definitions centralized in App.tsx
- Dynamic route parameters for trip details (/voyages/:id)
- 404 handling with NotFound component

**SSR Preparation**
- Server configured to handle all routes (*) for SPA fallback
- HTML template injection ready for future SSR implementation
- Development server proxies API requests to Express

### Form Handling

**Validation & Submission**
- React Hook Form for performant form state management
- Zod schemas for runtime validation (contactFormSchema)
- @hookform/resolvers for seamless Zod integration
- Non-functional submission (console.log for now, ready for backend integration)

**Form Components**
- Reusable form primitives from Shadcn (Input, Textarea, Form, FormField)
- Accessible form controls with proper ARIA labels
- Error message display integrated with validation

### Build & Deployment

**Development Workflow**
- tsx for running TypeScript directly in development
- Concurrent client and server development with HMR
- Type checking via tsc (noEmit mode)

**Production Build**
- Client: Vite build outputs to dist/public
- Server: esbuild bundles to dist/index.js with external packages
- Single node process serves static files and API

**Database Migration**
- Drizzle Kit configured for schema migrations
- Migration files output to /migrations directory
- npm run db:push for schema synchronization

## External Dependencies

### UI & Styling
- **Shadcn UI**: Pre-built accessible component library
- **Radix UI**: Headless UI primitives (accordion, dialog, dropdown, tooltip, etc.)
- **Tailwind CSS**: Utility-first CSS framework with PostCSS
- **class-variance-authority**: Type-safe variant-based styling
- **Lucide React**: Icon library for consistent iconography
- **React Icons**: Additional icon sets (WhatsApp icon)

### Data Fetching & State
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state and validation
- **Zod**: Schema validation for forms and API
- **@hookform/resolvers**: Zod resolver for React Hook Form

### Database & ORM
- **Drizzle ORM**: Type-safe SQL query builder
- **@neondatabase/serverless**: PostgreSQL driver for Neon (serverless-compatible)
- **drizzle-zod**: Generate Zod schemas from Drizzle tables
- **drizzle-kit**: CLI for migrations and schema management

### Routing & Navigation
- **Wouter**: Lightweight React router (1KB)

### Development Tools
- **Vite**: Fast build tool with HMR
- **@vitejs/plugin-react**: React support for Vite
- **TypeScript**: Type safety across codebase
- **esbuild**: Fast JavaScript bundler for production
- **tsx**: TypeScript execution for development

### Carousel & Media
- **embla-carousel-react**: Touch-friendly carousel for testimonials

### Utilities
- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional className utility
- **tailwind-merge**: Merge Tailwind classes without conflicts
- **nanoid**: Unique ID generation

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in development
- **@replit/vite-plugin-cartographer**: Code navigation tools
- **@replit/vite-plugin-dev-banner**: Development environment banner

### Session Management (Configured but Unused)
- **connect-pg-simple**: PostgreSQL session store for Express (prepared for future authentication)
- 