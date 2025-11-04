# PlayCue Homepage - Comprehensive Design Guidelines

## Design Approach & Philosophy
**Reference-Based Approach**: Drawing inspiration from modern gaming platforms (Discord, Epic Games Store) and Gen Z-focused apps (Spotify, TikTok) while maintaining family-friendly accessibility. The design balances futuristic aesthetics with intuitive usability for ages 8-40+.

**Core Principles**:
- Futuristic minimalism with energetic personality
- Instant clarity on game selection and play modes
- Frictionless path from landing to playing
- Visual hierarchy that guides exploration

---

## Typography System

**Font Selection**: 
- **Primary**: 'Plus Jakarta Sans' (Google Fonts) - Modern, geometric, tech-forward
- **Accent**: 'Space Grotesk' (Google Fonts) - For headlines and game names

**Hierarchy**:
- **Hero Headline**: Space Grotesk, 72px/84px desktop, 48px/56px mobile, font-weight 700
- **Hero Tagline**: Plus Jakarta Sans, 24px/32px desktop, 18px/28px mobile, font-weight 400
- **Section Headers**: Space Grotesk, 36px/44px desktop, 28px/36px mobile, font-weight 600
- **Game Card Title**: Plus Jakarta Sans, 20px/28px, font-weight 600
- **Game Card Description**: Plus Jakarta Sans, 15px/22px, font-weight 400
- **Body Text**: Plus Jakarta Sans, 16px/24px, font-weight 400
- **Navigation**: Plus Jakarta Sans, 15px/20px, font-weight 500
- **Buttons**: Plus Jakarta Sans, 16px/20px, font-weight 600

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Micro spacing: 2-4 units (8-16px)
- Component internal: 4-8 units (16-32px)
- Section padding: 16-24 units (64-96px vertical)
- Container max-width: 1280px (max-w-7xl)

**Grid System**:
- Game cards: 1 column mobile, 2 columns tablet, 3 columns desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Card gap: 6 units (24px)

---

## Component Library

### Navigation Bar
- **Structure**: Full-width, fixed top position with backdrop blur
- **Content**: PlayCue logo (left), navigation links (center: Games, About, How to Play), Profile/Login (right)
- **Height**: 64px desktop, 56px mobile
- **Treatment**: Subtle border bottom with gradient effect

### Hero Section
- **Layout**: Full viewport height (min-h-screen), centered content
- **Background**: Gradient mesh with animated geometric shapes (subtle purple-orange gradients)
- **Content Stack**: 
  - PlayCue logo/wordmark (large, top)
  - Tagline: "Play anytime, anywhere – together" (centered, prominent)
  - Primary CTA: "Join to play now" button with 3D lift effect
  - Supporting text: Brief value prop (optional: "10+ games. No setup. Just fun.")
- **Button Treatment**: 
  - Large pill-shaped button (px-12, py-4)
  - Purple background with orange gradient hover
  - 3D shadow effect with subtle float animation (translateY on hover)
  - Blur backdrop when over hero background

### Filter Navigation
- **Structure**: Horizontal tab bar below hero section
- **Options**: "All" | "Play Alone" | "Play Together (Offline)" | "Play Together (Join Room)"
- **Active State**: Purple background fill with rounded pill shape, orange underline accent
- **Inactive State**: Transparent with subtle hover lift
- **Layout**: Centered, responsive stack to dropdown on mobile
- **Spacing**: 8 units padding, 4 units between tabs

### Game Cards
- **Card Structure**:
  - Icon container: 64px circle with gradient background (purple-orange blend)
  - Game icon: 32px, centered within container
  - Game name: Bold, 20px
  - Description: 2 lines maximum, 15px, truncated with ellipsis
  - Subtle border with gradient on hover
- **Card Dimensions**: Aspect ratio 4:3, min-height 280px
- **Hover Effect**: Lift (translateY -4px) with shadow expansion, border glow
- **Background**: Frosted glass effect with subtle purple tint
- **Click Behavior**: Entire card clickable, scales down slightly on press

### Footer (Brief)
- **Content**: Copyright, social links, quick navigation
- **Treatment**: Minimal, single row on desktop, stacked on mobile
- **Spacing**: 12 units padding

---

## Animations & Interactions

**Hero Button 3D Animation**:
- Perspective transform with Z-axis lift on hover
- Box-shadow layers creating depth (multiple purple/orange shadows)
- Subtle scale pulse (1.0 to 1.02) on idle state
- Transform: rotateX(5deg) perspective(1000px)

**Page Transitions**:
- Filter changes: Cross-fade game cards with stagger (50ms delay between cards)
- Card entrance: Fade up with slight scale (0.95 to 1.0) on scroll reveal
- No excessive motion - maintain accessibility

**Micro-interactions**:
- Tab hover: Gentle scale (1.02) with transition
- Card hover: Lift animation (150ms ease-out)
- Icon rotation: Subtle rotation on game card hover (5-10 degrees)

---

## Images

**Hero Background**: 
- Abstract 3D geometric composition with floating shapes (spheres, cubes, pyramids)
- Purple-to-orange gradient overlay with transparency
- Subtle animated movement (parallax or slow float)
- Serves as backdrop, not focal point - ensures text readability

**Game Card Icons**: 
Each game requires a custom icon (32px, simple line art or filled style):
- **WordLink**: Chain links or letter blocks
- **Colordle**: Paint palette or color wheel
- **Globetrix**: Globe with location pin
- **Pictionary**: Easel or paintbrush
- **Charades**: Comedy/drama masks
- **Password**: Speech bubble with lock
- **Taboo**: Forbidden sign or crossed-out word
- **Wavelength**: Wave pattern or dial
- **Blankslate**: Empty notecard or writing
- **Guess the Imposter**: Magnifying glass or question mark silhouette

Use icon library: Heroicons or create simple SVG icons maintaining consistent stroke weight (2px) and rounded edges

---

## Responsive Behavior

**Breakpoints**:
- Mobile: < 768px (single column, stacked navigation)
- Tablet: 768px - 1024px (2 column grid, compact spacing)
- Desktop: > 1024px (3 column grid, full spacing)

**Mobile Optimizations**:
- Hero height: 75vh instead of full viewport
- Filter tabs: Horizontal scroll or dropdown selector
- Card grid: Single column with full-width cards
- Touch targets: Minimum 44px for all interactive elements

---

## Accessibility Standards

- Color contrast: Minimum 4.5:1 for all text on backgrounds
- Focus indicators: 2px purple outline on all interactive elements
- Keyboard navigation: Full tab order through nav, filters, cards
- ARIA labels: Proper labeling for filter tabs and game cards
- Reduced motion: Respect prefers-reduced-motion for all animations

---

**Design Ethos**: Create an instant "wow" moment with the hero while maintaining clear information architecture. Every element should feel intentional, modern, and inviting. The design should whisper "futuristic" without shouting, letting playful energy come through purple-orange accents and smooth interactions.