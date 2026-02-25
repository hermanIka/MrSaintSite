# Mr Saint Travel Agency Website

## Overview

Mr Saint is a premium travel agency website offering visa facilitation, travel agency creation consulting, and organized business trips. The project aims to provide a modern, full-stack web application with a luxury design aesthetic, primarily using gold and black color schemes. It emphasizes a modular, domain-driven architecture to ensure clear separation between frontend and backend, organized logically by business domains.

Key capabilities include:
- Comprehensive visa facilitation services.
- Consulting and coaching for new travel agency creation.
- Organization of tailored business trips.
- Dynamic content management for trips, testimonials, and portfolio.
- Multi-provider payment system (Mobile Money, Card, PayPal).
- Integrated booking and scheduling functionality.
- Admin dashboard for content and user management.
- Hybrid chatbot for customer interaction.
- A new service for travel financing ("Voyage à Crédit") with an application and approval workflow.
- Display of "featured trips" on the homepage.

The business vision is to establish Mr Saint as a leading high-end travel service provider, leveraging technology to offer a seamless and sophisticated user experience.

## User Preferences

Preferred communication style: Simple, everyday language (French preferred).

## System Architecture

The application employs a modular, domain-driven architecture for both frontend and backend, promoting clear separation of concerns and maintainability.

**UI/UX Decisions:**
- **Color Scheme:** Luxury aesthetic with gold (#F2C94C), black (#000000), and gray (#1A1A1A).
- **Typography:** Poppins/Montserrat for titles and Inter for body text.
- **Theming:** Supports both light and dark modes.
- **Design System:** Built with Shadcn UI and Radix UI for components, styled with Tailwind CSS.

**Frontend (Client/src/modules):**
Organized into `foundation` (layout, navigation), `content` (dynamic pages like home, about, trips), `interaction` (contact, FAQ), `process` (services, visa, agency creation), `transaction` (reservations, payments), and `admin` (admin login, dashboard).
- **Core Technologies:** React 18 with TypeScript, Vite for bundling, Wouter for routing, TanStack Query for server state management.

**Backend (Server/modules):**
Structured around `content` (API for trips, testimonials, portfolio), `transaction` (payment APIs), `chatbot` (hybrid chatbot logic), and `admin` (protected API for CRUD operations, authentication).
- **Core Technologies:** Express.js with TypeScript, PostgreSQL with Drizzle ORM for persistent data, @neondatabase/serverless for DB connection.

**Technical Implementations & Feature Specifications:**
- **Modular Payment System:** Supports PawaPay (Mobile Money), MaishaPay (Card), and PayPal. All payment logic resides on the server. Designed for extensibility to add more providers.
- **Calendly Integration:** Uses Calendly API v2 for event types and real-time slot availability, redirecting users to Calendly for final booking.
- **Hybrid Chatbot (Refactored):** A floating `ChatWidget` with persistent conversations stored in PostgreSQL. Features:
  - **Versioned System Prompts:** Admin-managed prompts stored in `chatbot_system_prompts` table with version control and active flag.
  - **Session Persistence:** Conversations saved in `chatbot_conversations` table with session IDs stored in localStorage.
  - **Security Isolation:** Chatbot only accesses public data (services, trips, FAQs). No access to payment APIs, admin functions, or secrets.
  - **Mode Hybride:** Defaults to rule-based responses (15+ categories), switches to OpenAI GPT-4o-mini when OPENAI_API_KEY is configured.
  - **Admin Routes:** Full CRUD for system prompts at `/api/admin/chatbot/prompts/*`.
- **Dynamic Content:** Trips, testimonials, and portfolio items are dynamically managed via the admin panel. Portfolio includes filtering by service type and a draft/published status.
- **Admin Module:** Token-based authentication, comprehensive dashboard with statistics, full CRUD capabilities for content, and activity logging.
- **"Voyage à Crédit" Service:** A multi-step form for travel financing applications, including secure document uploads to object storage. Features an admin approval workflow (pending, approved, refused).
- **Module GO+:** A loyalty card system allowing users to purchase virtual GO+ cards (Standard 10€/5% off, Premium 15€/10% off) via MaishaPay or PawaPay. Cards are valid for 1 year and apply discounts to all services. Includes webhook-based auto-activation, admin panel for card/transaction management, and a public card status checker.
- **Featured Trips:** A boolean flag `isFeatured` for trips allows highlighting up to 4 trips in a carousel on the homepage.
- **Database:** PostgreSQL with Drizzle ORM, structured with tables for `trips`, `testimonials`, `portfolio`, `faqs`, `admins`, `activity_logs`, `credit_travel_requests`, `chatbot_conversations`, `chatbot_system_prompts`, `go_plus_plans`, `go_plus_cards`, and `go_plus_transactions`. Includes a seed script for initial data.

**Architectural Rules:**
- Strict separation of frontend and backend: no business logic or API keys exposed client-side, server-side validation is mandatory.
- Each component belongs to a single domain/module.
- Every module must include a context file documenting its responsibilities.
- Modular payment system architecture supports multiple providers with server-side payment logic.

## External Dependencies

- **Payment Gateways:**
    - **PawaPay:** For Mobile Money transactions in 19 African countries (e.g., MTN, Orange, M-Pesa).
    - **MaishaPay:** For credit card payments (Visa, Mastercard, American Express, UnionPay).
    - **PayPal:** For PayPal transactions.
- **Scheduling:**
    - **Calendly API v2:** For managing and displaying booking availability.
- **Database:**
    - **PostgreSQL:** Primary data storage.
    - **@neondatabase/serverless:** For serverless database connection.
- **Chatbot (Optional):**
    - **OpenAI:** Planned integration for advanced chatbot capabilities.
- **Cloud Storage:**
    - **Object Storage:** For secure document uploads related to travel financing applications.