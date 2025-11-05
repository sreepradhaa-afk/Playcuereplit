# PlayCue

## Overview

PlayCue is a modern web platform for family-friendly party games that can be played alone, offline together, or in online rooms. The application features 10+ games including Numble, Colordle, Globetrix, Pictionary, Charades, Password, and Taboo. The platform emphasizes a futuristic minimalist design with energetic personality, inspired by modern gaming platforms like Discord and Epic Games Store, while maintaining family-friendly accessibility.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type safety and modern component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing (alternative to React Router)
- Design rationale: Vite provides significantly faster development experience than traditional bundlers, while Wouter reduces bundle size compared to React Router

**UI Component System**
- Shadcn/ui component library with Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with custom design tokens
- Framer Motion for animations and transitions
- Design rationale: Shadcn/ui provides copy-paste components that are fully customizable, avoiding the lock-in of traditional component libraries while maintaining consistency

**State Management**
- TanStack Query (React Query) for server state management and caching
- Custom query client configuration with infinite stale time and disabled refetching
- Design rationale: Separates server state from client state, reducing complexity and providing automatic caching/refetching capabilities

**Design System**
- Custom color palette using HSL with CSS variables for theme support
- Typography system using Google Fonts: Plus Jakarta Sans (primary) and Space Grotesk (accent)
- Spacing primitives based on Tailwind's scale (2, 4, 6, 8, 12, 16, 20, 24 units)
- Responsive grid: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
- Design rationale: CSS variables enable runtime theme switching and maintain consistency across components

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for REST API endpoints
- HTTP server creation using Node's built-in http module
- Design rationale: Express provides minimal overhead while offering extensive middleware ecosystem

**Data Storage**
- In-memory storage using Map data structures (MemStorage class)
- Prepared for PostgreSQL integration via Drizzle ORM
- Design rationale: In-memory storage enables rapid development and testing; architecture allows easy transition to persistent database

**API Structure**
- RESTful endpoints under `/api` prefix
- Current endpoint: `GET /api/games` for retrieving game catalog
- JSON request/response format with automatic parsing
- Design rationale: REST provides simple, stateless API that's easy to consume and extend

**Development Tooling**
- TSX for running TypeScript files directly in development
- ESBuild for production bundling with external package handling
- Custom logging middleware for request/response monitoring
- Design rationale: TSX eliminates compilation step in development; ESBuild provides extremely fast production builds

### Database Schema

**User Management**
- Users table with UUID primary keys, unique usernames, and password fields
- Drizzle Zod integration for runtime validation
- Design rationale: UUIDs prevent enumeration attacks; Drizzle provides type-safe schema definitions and migrations

**Game Data Model**
- Game interface with id, name, description, category (alone/offline/room), and icon fields
- Three game categories for different play modes
- Static game data currently served from in-memory arrays
- Design rationale: Separation of static game metadata from dynamic user/session data

### External Dependencies

**UI Component Libraries**
- @radix-ui/* family: 20+ primitive components for building accessible UI (accordion, dialog, dropdown, popover, etc.)
- cmdk: Command palette component for keyboard-driven navigation
- embla-carousel-react: Touch-friendly carousel implementation
- lucide-react: Icon library with consistent design language
- Design rationale: Radix UI provides production-ready accessibility without imposing visual styles

**Database & ORM**
- @neondatabase/serverless: PostgreSQL driver optimized for serverless environments
- drizzle-orm: Type-safe ORM with SQL-like query builder
- drizzle-kit: Schema management and migration tool
- Design rationale: Drizzle offers better TypeScript inference than traditional ORMs while maintaining SQL transparency

**Form & Validation**
- react-hook-form: Performant form state management
- @hookform/resolvers: Integration layer for validation libraries
- zod: TypeScript-first schema validation
- drizzle-zod: Automatic Zod schema generation from Drizzle tables
- Design rationale: React Hook Form minimizes re-renders; Zod provides runtime type safety matching TypeScript types

**Styling & Animation**
- tailwindcss: Utility-first CSS framework
- class-variance-authority: Type-safe variant handling for components
- clsx & tailwind-merge: Conditional class name utilities
- framer-motion: Production-ready animation library
- Design rationale: Tailwind enables rapid UI development; CVA provides type-safe component variants

**Session Management**
- express-session: Session middleware (prepared for implementation)
- connect-pg-simple: PostgreSQL session store
- Design rationale: Server-side sessions provide better security than client-side JWT for web applications

**Development Tools**
- @replit/vite-plugin-*: Replit-specific development enhancements (cartographer, dev banner, runtime error modal)
- Design rationale: Improves development experience within Replit environment

**Font Integration**
- Google Fonts: Plus Jakarta Sans and Space Grotesk via CDN
- Design rationale: CDN delivery provides optimal caching and performance; selected fonts match gaming platform aesthetic

**Missing/Planned Integrations**
- PostgreSQL database (Drizzle configured but not yet connected)
- WebSocket/real-time capability for "Join Room" game mode
- Authentication system (schema defined, routes not implemented)
- Session storage (connect-pg-simple installed but not configured)

## Recent Changes (November 2025)

### Colordle Game Redesign
- **Target Display**: Players now see the target RGB color as a visual circle they must match
- **Color Palette**: 15-color palette (Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Black, White, Cyan, Magenta, Lime, Teal, Navy)
- **Gameplay Mechanics**: Players select 3 colors from palette; system calculates RGB mix and accuracy percentage
- **Win Condition**: ≥95% RGB accuracy match
- **Security**: Backend sends `targetRGB` (the visual puzzle) but hides `targetColors` (the solution with percentages) until game completion

### Numble Game Implementation
- **Game Type**: Wordle-style number guessing game that replaced WordLink
- **Code Length**: Players choose 3-6 digit code length
- **Gameplay**: 6 attempts to guess secret code using number pad interface
- **Feedback System**: 
  - Green: Correct digit in correct position
  - Yellow: Correct digit in wrong position
  - Gray: Digit not in code
- **Win Condition**: Exact match of all digits in correct positions
- **Security**: Backend hides `targetCode` (solution) until game completion to prevent cheating

### Security Implementation
Both Colordle and Numble implement server-side solution hiding:
- **API Endpoints**: All create/fetch/guess endpoints filter sensitive data based on `game.completed` status
- **Colordle**: Always sends `targetRGB` (required for gameplay), hides `targetColors` until completion
- **Numble**: Never sends `targetCode` until completion
- **Frontend Safety**: Components use null checks (`game?.targetRGB`, `game?.targetCode`) to handle missing solution data gracefully
- **Verified**: End-to-end tests confirm solutions are hidden during gameplay and revealed only in Game Over dialogs