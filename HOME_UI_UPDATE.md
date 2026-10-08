# BanglaQR Home Page Update

Implemented a complete public BanglaQR homepage based on the supplied Bengali reference design.

## Sections
- Responsive navbar with Bengali navigation and auth CTAs
- Hero section with BanglaQR payment imagery
- Payment-provider strip
- "কেন BanglaQR?" feature cards
- Small-to-large merchant section with dashboard imagery and stats
- 3-step onboarding / how-it-works section
- Merchant dashboard / reporting showcase
- Business/industry solutions grid
- Two merchant packages: Micro Merchant and Big Merchant
- Testimonials carousel controls
- Final CTA
- Multi-column footer

## Assets
Existing project assets are reused. Clean-copy aliases for the home page were added under `src/assets/home/` so imports remain simple and reliable.

## Package rule
The homepage contains exactly two package categories:
- Micro Merchant
- Big Merchant

No package price was invented because no fixed price was provided in the source requirement.

## Existing functionality preserved
- Existing `/`, `/login`, `/register`, `/verify` routes
- Existing authentication architecture
- Existing Merchant Portal/onboarding routes
