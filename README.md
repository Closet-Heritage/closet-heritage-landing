# Closet Heritage — Landing Page

Marketing and waitlist landing page for [Closet Heritage](https://github.com/Closet-Heritage), an AI-powered wardrobe and outfit planning app.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **Tailwind CSS v4** with CSS variable theming
- **Shadcn/UI** (Accordion, Button, Input, Dialog)
- **Supabase** for waitlist email collection
- **TypeScript**

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Then fill in your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |

## Project Structure

```
app/
  layout.tsx              Root layout (fonts, metadata)
  page.tsx                Assembles all sections
  globals.css             Tailwind config, CSS variables, theme
  api/waitlist/route.ts   POST endpoint — saves email to Supabase

components/
  Navbar.tsx              Sticky nav, logo, links, mobile hamburger
  Hero.tsx                Heading, subtitle, CTA, hero image
  Quote.tsx               Reusable quote with L-bracket corners
  HowItWorks.tsx          3-step cards with dashed corner accents
  Rediscover.tsx          Feature section with phone mockup
  Features.tsx            2x2 grid of phone screenshots
  BuiltForReal.tsx        Bullet points + horizontal gallery
  FinalCTA.tsx            Closing CTA with corner brackets
  FAQ.tsx                 Accordion with +/- icons
  Footer.tsx              Contact form + social links over bg image
  BottomBar.tsx           Logo, tagline, terms link
  WaitlistForm.tsx        CTA button → modal with email input
  ui/                     Shadcn/UI components

public/images/            Exported assets from Figma
```

## Theming

Colors are defined as CSS variables in `globals.css` under `:root`, registered in the `@theme inline` block for Tailwind:

- **Palette**: Warm browns (`#FFF9F4` background, `#291A0C` foreground, `#C4A882` accent)
- **CTA buttons**: `--btn-cta` (#F5E9DA), `--btn-cta-light` (#FFF5E7)
- **Dark cards**: `--card-dark` (#1A1210)
- **Section backgrounds**: `--section-warm` (#FFF5E7)
- **Fonts**: Playfair Display (headings) + Fira Code (body)

## Waitlist API

`POST /api/waitlist` with `{ "email": "user@example.com" }`.

Emails are stored in the `waitlist_emails` table in Supabase. Duplicate emails return a friendly message instead of an error.

## Scripts

```bash
npm run dev       # Development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```
