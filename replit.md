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
- PostgreSQL database connected via Drizzle ORM for persistent data
- Hybrid approach: Static game data in memory, user data and history in database
- Design rationale: In-memory storage for game data ensures fast access; PostgreSQL for user data provides persistence and reliability

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
- Users table with UUID primary keys from OIDC provider (sub claim)
- User fields: email, firstName, lastName, profileImageUrl, timestamps
- Sessions table for Express session storage with PostgreSQL
- User word history table for tracking shown words per user per game
- Drizzle Zod integration for runtime validation
- Design rationale: OIDC sub as primary key ensures consistency with auth provider; Drizzle provides type-safe schema definitions

**Word Caching System**
- user_word_history table tracks (userId, gameType, wordId, shownAt)
- Prevents word repetition for authenticated users across game sessions
- Filter endpoints automatically exclude previously shown words
- Mark-shown endpoints track words as they appear during gameplay
- Works for Pictionary, Charades, Password, and Taboo games
- Design rationale: Improves user experience by minimizing repetitive content; optional feature that requires authentication

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

**Authentication & Authorization**
- Replit Auth integration for user authentication with Google login support
- OpenID Connect (OIDC) flow for secure authentication
- Session-based authentication using express-session with PostgreSQL session store
- Protected API routes using isAuthenticated middleware
- Design rationale: Replit Auth provides seamless authentication with minimal configuration; server-side sessions offer better security than JWT tokens

**Missing/Planned Integrations**
- WebSocket/real-time capability for "Join Room" game mode
- Additional OAuth providers (GitHub, Apple, Email/Password available through Replit Auth)

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

### Mobile Navigation & Responsive Design
- **Desktop**: Full navigation menu with Games dropdown showing all game categories
- **Mobile**: Hamburger menu using Shadcn Sheet component for responsive access
- **Navigation Items**: Games dropdown (categorized by play mode) and Feedback link
- **User Menu**: Avatar dropdown with user info and logout for authenticated users
- **Design rationale**: Sheet drawer provides clean mobile UX; consistent experience across devices

### Authentication & Word Caching (November 2025)
- **Replit Auth Integration**: Google login enabled (Facebook not supported by Replit Auth)
- **User Flow**: Login button → Replit Auth → Redirect back with session
- **Logout Flow**: Logout button → Server clears session → Redirect to home
- **Navigation UI**: Shows login button when not authenticated, user avatar dropdown when authenticated
- **Word History Tracking**: 
  - Automatically filters out previously shown words for logged-in users
  - Tracks words as they are displayed during gameplay
  - Works across all word-based games (Pictionary, Charades, Password, Taboo)
  - Anonymous users see all words without filtering
- **Database Tables**: users, sessions, user_word_history all operational with PostgreSQL