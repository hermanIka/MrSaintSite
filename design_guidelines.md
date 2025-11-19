# Design Guidelines: Mr Saint Travel Agency Website

## Design Approach
**Reference-Based Luxury Travel**: Drawing inspiration from premium travel platforms like Airbnb (for trust and visual storytelling), Luxury Escapes (for high-end presentation), and modern agency sites with strong visual hierarchies. The design emphasizes exclusivity, expertise, and professional credibility through refined aesthetics.

## Color System (Mandatory)
- **Primary Gold**: #F2C94C (CTAs, accents, highlights)
- **Deep Black**: #000000 (primary backgrounds, text on light)
- **Anthracite Gray**: #1A1A1A (alternate backgrounds, cards)
- **Metallic Gold**: #CFAF59 (subtle accents, borders)
- **Pure White**: #FFFFFF (text on dark, alternate sections)

**Color Application**: Alternate sections between black and white backgrounds. Gold buttons on black sections, black buttons on white sections. Maintain high contrast for premium feel.

## Typography
- **Headings**: Poppins or Montserrat (600-700 weight)
  - H1: 48px desktop / 32px mobile
  - H2: 36px desktop / 28px mobile
  - H3: 24px desktop / 20px mobile
- **Body**: Inter (400 regular, 500 medium)
  - Body: 16px / 1.6 line-height
  - Small: 14px

## Spacing System
Use Tailwind units: **4, 6, 8, 12, 16, 20, 24** for consistent luxury spacing. Generous whitespace between sections (py-20 to py-32 desktop, py-12 to py-16 mobile).

## Layout & Structure

### Navigation
- Fixed header with transparent background over hero, solid black on scroll
- Logo left (gold/white), menu center/right
- CTA button: "Réserver un service" (gold, prominent)
- Mobile: Hamburger menu, full-screen overlay with large touch targets

### Homepage Sections
1. **Hero**: Full viewport (90vh) with premium travel imagery, dark overlay (40% opacity), centered content with main headline, subtext, two CTAs (Visa / Agency)
2. **Services Grid**: 3 columns (1 on mobile), cards with icons, hover lift effect
3. **Why Mr Saint**: 4 benefits in grid, icon-title-description format
4. **Testimonials**: Carousel with 3 testimonials, client photos, quote style
5. **CTA Section**: Full-width gold background, centered conversion message

### Service Pages Structure
- Hero banner (smaller, 50vh) with service-specific imagery
- Service description section (max-w-4xl, centered)
- Process steps (timeline or numbered cards)
- Benefits grid (2-3 columns)
- Pricing display (card format, non-functional "Payer maintenant" button)
- Trust indicators (guarantees, testimonials)

### Voyages Page
- Masonry/grid layout: 3 columns desktop, 2 tablet, 1 mobile
- Trip cards: Image top, title, date badge, price, short description, "Voir le programme" CTA
- Filter/sort UI (styled but static)

### Trip Detail Page
- Large hero image gallery (main image + thumbnails)
- Title, date, price prominently displayed
- Itinerary accordion/timeline (day-by-day)
- Inclusions/exclusions in two-column format
- Sticky booking panel on desktop (right sidebar)
- "Réserver ma place" button (gold, large)

### Portfolio Page
- Grid: 3 columns desktop, 2 tablet, 1 mobile
- Project cards with image, business name, category tag
- Hover: Gentle zoom (scale 1.05), shadow elevation
- Section title: "Réalisations et Entrepreneurs accompagnés"

### Contact Page
- Two-column layout: Form left (60%), info right (40%)
- Form fields: Name, Email, Message (styled inputs, non-functional)
- Direct contact buttons: WhatsApp (green accent), Phone, Email (gold)
- Business hours, location info

## Component Design

### Buttons
- **Primary (Gold)**: px-8 py-4, rounded-full, #F2C94C background, black text, bold
- **Secondary (Outlined)**: Border gold/white, transparent background, matching text
- **Buttons on images**: Semi-transparent background (backdrop-blur), white text

### Cards
- Subtle border: 1px solid rgba(242, 201, 76, 0.2)
- Background: Alternate between #1A1A1A and white
- Padding: p-8
- Rounded: rounded-2xl
- Hover: Translate up 4px, shadow elevation

### Forms
- Input fields: Dark background (#1A1A1A) with gold focus ring
- Labels: Gold color, 14px, above inputs
- Spacing: mb-6 between fields

### Footer
- Black background, 4-column grid (1 on mobile)
- Columns: Logo/about, Quick links, Services, Social/contact
- Bottom bar: Legal links, copyright
- Social icons: Gold on hover

## Images

### Hero Images
1. **Homepage**: Luxury travel scene (business class, exotic destination, or Mr Saint in professional setting) - Full width, dark overlay
2. **Visa Page**: Passport stamps, visa documents, international airport scene
3. **Agency Page**: Entrepreneurs in meeting, business coaching setting, successful agency office
4. **Voyages Page**: Destination highlights (Dubai skyline, Istanbul, China business district)
5. **Trip Detail**: High-quality destination imagery, local culture, business amenities

### Service Icons
- Minimalist line icons for services (visa, plane, briefcase)
- Gold color (#F2C94C)
- Consistent stroke width

### Portfolio Images
- 6 placeholder images representing different entrepreneurs/agencies
- Professional headshots or business storefronts

## Animations (Minimal)
- Smooth page transitions (fade-in)
- Scroll-triggered fade-up for sections (subtle, 300ms)
- Button hover: Scale 1.02, 200ms
- Card hover: Lift effect
- **No distracting animations** - maintain premium, professional feel

## Responsive Breakpoints
- Mobile: < 768px (single column, stacked)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (full multi-column layouts)

## Key Design Principles
- **Luxury through restraint**: Generous spacing, limited color palette
- **Trust signals**: Professional imagery, client testimonials, clear pricing
- **Conversion-focused**: Strategic CTAs, clear value propositions
- **Premium feel**: High-quality images, refined typography, sophisticated interactions
- **Bilingual ready**: French primary (as per content), structure supports future translation