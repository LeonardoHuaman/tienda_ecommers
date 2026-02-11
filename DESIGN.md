# Design System: RC Beauty Store (Stitch)
**Project Title:** RC Beauty E-commerce
**Status:** Initial Design Draft

## 1. Visual Theme & Atmosphere
The RC Beauty Store embodies a **Minimalist Luxury** aesthetic. The atmosphere is **Airy, Elegant, and Clean**, focusing on the products as the primary visual interest. It utilizes high whitespace (breathing room) to convey a premium "boutique" feel, moving away from dense, cluttered marketplace designs. The experience should feel like walking into a high-end beauty studio.

## 2. Color Palette & Roles
* **Cloud Dancer (#F0EEE9):** The primary background color. A sophisticated, warm off-white that feels more premium and softer than pure white. Used for the main canvas.
* **Matte Black (#1A1A1A):** The primary text and high-contrast element color. Used for headings, primary buttons, and critical UI borders.
* **Beauty Gold (#D4AF37):** A subtle accent color used for secondary highlights, star ratings, and subtle hover states to denote luxury.
* **Soft Linen (#E5E1D8):** A secondary background color used for cards or sections to create subtle depth without high contrast.

## 3. Typography Rules
* **Elegant Display (Playfair Display):** Used for main headings (h1, h2) and brand-specific callouts. It adds a timeless floral/beauty character.
* **Modern Sans (Inter/Lato):** Used for body text, navigation items, and button labels. It ensures readability and a contemporary technical feel.
* **Letter Spacing:** Headlines utilize slightly increased letter-spacing (0.05em) for a more refined look.

## 4. Component Stylings
* **Buttons:**
    * **Primary:** Sharp-edged or subtly rounded Matte Black background with Cloud Dancer text. Hover state shifts to Beauty Gold or increases opacity.
    * **Secondary:** Transparent background with Matte Black border (ghost style).
* **Cards/Containers:**
    * **Shape:** Subtly rounded corners (radius: 10px).
    * **Background:** Soft Linen or White with a **whisper-soft diffused shadow** (shadow-sm/md in Tailwind).
    * **Border:** No borders or extremely thin, low-opacity lines to maintain the "airy" feel.
* **Inputs/Forms:**
    * Minimalist bottom-border only or very light grey border. Focus state uses Matte Black.

## 5. Layout Principles
* **Mobile First:** Optimized for vertical scrolling with thumb-friendly touch targets (min 44px).
* **Grid Alignment:** 4/8px spacing system for consistent rhythm.
* **Whitespace:** Generous margins (min 24px) between major sections to prevent visual fatigue.
* **Micro-interactions:** Smooth 200-300ms transitions for hovers and page transitions using Framer Motion.
