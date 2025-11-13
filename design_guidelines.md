# Electronixz E-Commerce Design Guidelines

## Design Approach
**Reference-Based: Samsung Product Pages**
Drawing inspiration from Samsung's clean, futuristic aesthetic with emphasis on product photography, generous whitespace, and sophisticated blue accent usage.

## Color Palette
- **Primary Blue**: #1428A0 (buttons, links, accents, category highlights)
- **White**: #FFFFFF (backgrounds, cards, text on blue)
- **Light Gray**: #F5F5F5 (subtle backgrounds, section dividers)
- **Medium Gray**: #E0E0E0 (borders, dividers)
- **Dark Gray**: #2C2C2C (primary text)
- **Success Green**: #5CB85C (Add to Cart confirmations)

## Typography System
- **Primary Font**: 'Inter' or 'Roboto' via Google Fonts
- **Headings**: Bold (700) - H1: 48px, H2: 36px, H3: 28px, H4: 22px
- **Body Text**: Regular (400) - 16px base, 18px for product descriptions
- **Product Names**: Semi-bold (600) - 20px
- **Prices**: Bold (700) - 24px for details page, 18px for cards
- **Button Text**: Medium (500) - 16px, uppercase tracking

## Layout System
**Spacing Units**: Tailwind units of 2, 4, 6, 8, 12, 16, 20 (p-2, m-4, gap-6, etc.)

**Container Widths**:
- Full-width hero: w-full
- Content sections: max-w-7xl
- Product grids: max-w-6xl
- Form content: max-w-2xl

**Responsive Grid**:
- Mobile: 1 column (grid-cols-1)
- Tablet: 2 columns (md:grid-cols-2)
- Desktop: 3-4 columns (lg:grid-cols-3 for products, lg:grid-cols-4 for categories)

## Component Library

### Navigation Header
- Fixed top position with white background and subtle shadow
- Logo left-aligned (blue accent color)
- Horizontal navigation center (Home, Products, About, Contact)
- Cart icon right-aligned with item count badge (blue circle)
- Mobile: Hamburger menu with slide-out drawer
- Height: 72px desktop, 64px mobile

### Hero Banner (Homepage)
- Full-width section with large product imagery
- Height: 600px desktop, 400px mobile
- Overlay text: left or center-aligned with white text on dark gradient overlay
- CTA button with blurred background (glass effect): white text, 16px padding, rounded corners
- No hover/active states on hero buttons

### Category Cards (Homepage)
- 4-column grid on desktop, 2-column tablet, 1-column mobile
- Each card: white background, rounded corners (8px), subtle shadow on hover
- Category image at top (aspect ratio 4:3)
- Category name below in bold, centered
- Entire card clickable with subtle scale transform on hover

### Featured Products Section (Homepage)
- 3-column grid showcasing 6-9 products
- Section heading: "Featured Electronics" - centered, 36px, bold
- Product cards match Products page styling

### Product Cards (Products Page & Homepage)
- White background with rounded corners (12px)
- Product image: aspect ratio 1:1, fills card width
- Product name: semi-bold, 20px, 2-line max with ellipsis
- Price: bold, 24px, blue color
- "Add to Cart" button: full-width, blue background, white text, 48px height, rounded (6px)
- Subtle lift shadow on card hover

### Product Details Page
- Two-column layout: Image gallery left (60%), Details right (40%)
- Image gallery: Main large image (600x600px) with thumbnail strip below (4-5 thumbnails)
- Product title: 36px, bold
- Price: 32px, bold, blue
- Specifications table: alternating light gray/white rows, 2-column layout
- Description: 18px, readable line-height (1.7)
- "Buy Now" primary button (blue) + "Add to Cart" secondary button (outlined blue)
- Mobile: Stack vertically, gallery first

### Shopping Cart Page
- Cart items table/list with product thumbnail, name, price, quantity controls, remove button
- Quantity controls: Plus/minus buttons flanking number display
- Subtotal per item displayed
- Right sidebar (desktop) or bottom section (mobile): Order summary with Total in large bold text
- "Proceed to Checkout" prominent blue button

### About Page
- Hero section with company image and mission statement overlay
- 2-column sections alternating: text-left/image-right, then image-left/text-right
- Company values displayed as icon cards (3-column grid)
- Timeline or milestones section with vertical line connector

### Contact Page
- Centered form layout (max-w-2xl)
- Input fields: White background, light gray border, blue focus border, 56px height
- Text area: 160px height
- Labels: 14px, medium gray, above inputs with 8px spacing
- Submit button: Full-width, blue, 56px height
- Optional contact information sidebar with phone, email, address icons

### Footer
- Dark background (#2C2C2C) with white text
- Three sections: Company info left, Quick links center, Social icons right
- Social icons: circular, white outline, hover fills blue
- Copyright text centered at bottom, smaller (14px)
- Desktop: horizontal layout, Mobile: stacked sections

## Animations & Interactions
- Minimize animations - use sparingly
- Product card hover: subtle translate-y (-4px) and shadow increase
- Button states: opacity change only (hover: 0.9, active: 0.8)
- Page transitions: none - instant loading
- Cart count badge: subtle pulse when item added

## Images

### Homepage Hero Banner
- Large lifestyle image showcasing electronics in modern setting (1920x600px)
- Should feature premium electronics (TV, smartphone, smartwatch) in aspirational context
- Dark gradient overlay for text readability

### Category Cards
- High-quality product category images:
  - Fridges: Modern stainless steel refrigerator
  - TVs: Sleek 4K television display
  - Smartwatches: Premium watch on wrist
  - Smartphones: Latest flagship phone
  - Earbuds: Wireless earbuds in case
  - Laptops: Slim laptop open at angle
  - Power Banks: Portable charger
  - Washing Machines: Front-load washer
  - ACs: Wall-mounted air conditioner

### Product Images
- White background product photography (pure white #FFFFFF)
- Multiple angles for gallery (front, side, back, detail shots)
- Minimum 800x800px resolution
- Consistent lighting and shadows

### About Page
- Team or office environment photo for hero
- Technology/innovation imagery for mission section
- Clean, professional photography matching Samsung's style

## Accessibility
- Maintain WCAG AA contrast ratios
- All form inputs with proper labels
- Cart count badge includes aria-label
- Focus indicators visible (blue outline)
- Keyboard navigation fully supported