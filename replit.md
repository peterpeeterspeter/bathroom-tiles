# De Badkamer - Bathroom Renovation Platform

## Overview
A Dutch-language bathroom renovation platform built with React, Vite, and Tailwind CSS. It uses Gemini AI for bathroom analysis/rendering and Supabase as the backend database. Users can get free renovation quotes, use an AI bathroom planner, and browse advice articles.

## Project Architecture
- **Framework**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS v4
- **AI (generation)**: Google Gemini API (`@google/genai`) via LaoZhang proxy (gemini-3-pro-image-preview for renders)
- **AI (expert analysis)**: Google Gemini API direct (gemini-3-flash-preview for 9-step expert renovation analysis, via GOOGLE_AI_API_KEY)
- **Backend**: Supabase (external, not local DB)
- **PDF Generation**: jspdf + html2canvas
- **Routing**: react-router-dom v7

## AI Pipeline (PlannerPage)
1. **Style Selection** — User picks preset or uploads reference images (no AI call yet)
2. **Dimensions & Photo** — User enters dimensions + uploads bathroom photo
3. **Expert Analysis + Product Configuration** — `analyzeProjectContext()` runs with all inputs → 9-step analysis → enriched StyleProfile. Each product category has Vervangen/Behouden toggle (+ Toevoegen/Verwijderen for shower/bathtub)
4. **Processing**:
   - `analyzeBathroomInput()` runs first (gemini-3-pro-preview, temperature 0.2) — returns enhanced spatial data: camera position/wall, wall-by-wall features (windows/doors/plumbing), fixture conditions, primary light direction, plumbing wall
   - Product images fetched as base64
   - `generateRenovation()` + `calculateRenovationCost()` run in parallel
   - Render receives full ProjectSpec as SPATIAL CONTEXT preamble (room dims, walls, fixtures, camera, lighting) to prime the model
   - Single-shot render: original photo + inspiration images + product reference images → gemini-3-pro-image-preview with thinkingBudget:8192 + 2K output
   - Cost estimate (temperature 0.1) is scope-aware: kept items have zero cost, fixture condition and plumbing wall distance affect labor costs
5. User dimensions take priority over AI-estimated dimensions
6. Photos are compressed to 1500px max before API calls
7. Product reference images sent as inline base64 parts (up to 14 images supported)
8. `generateEmptySpace()` removed — no longer needed with single-shot approach

### AI API Configuration
| Function | Model | Temperature | Thinking | Notes |
|---|---|---|---|---|
| analyzeBathroomInput | gemini-3-pro-preview | 0.2 | N/A | Enhanced schema: camera, walls, lighting, plumbing, fixture conditions |
| generateRenovation | gemini-3-pro-image-preview | default | thinkingBudget: 8192 | SPATIAL CONTEXT preamble from analysis, 2K output |
| calculateRenovationCost | gemini-3-pro-preview | 0.1 | N/A | Plumbing wall awareness, fixture condition affects labor |

## Directory Structure
- `/components` - React UI components
- `/pages` - Page-level components (Home, Kosten, Planner, Inspiratie, Advies, etc.)
- `/lib` - Utility services (supabase client, analytics, PDF, SEO, productService)
- `/services` - AI services (Gemini integration, style analysis)
- `/supabase` - Supabase migrations and edge functions
- `/public` - Static assets (robots.txt, sitemap.xml)

## Environment Variables
- `GEMINI_API_KEY` - Google Gemini / LaoZhang API key (secret, for image generation)
- `GEMINI_BASE_URL` - Custom API endpoint (set to https://api.laozhang.ai)
- `GOOGLE_AI_API_KEY` - Google AI API key (secret, for style analysis via ai.google.dev)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Development
- Dev server: `npm run dev` (port 5000)
- Build: `npm run build` (output to `dist/`)
- Preview: `npm run preview`

## Deployment
- Static deployment with `npm run build`, serving from `dist/`
- API keys baked into bundle at build time via Vite `define` config
- Do NOT use `typeof process` guards around `process.env.*` — Vite replaces these tokens at build time

## Lead Generation System
- **Project tracking**: `projects` table stores complete project state (style, products, dims, estimates, images)
- **Lead scoring**: Client-side 0-100 algorithm (contact 25pts, project data 35pts, AI outputs 20pts, budget 20pts)
- **Image storage**: `project-images` bucket (private) for user photos and AI renders
- **Email notifications**: `send-lead-notification` Edge Function → Resend → peterpeeterspeter@gmail.com
- **PDF dossier**: Enhanced PDF with room dimensions, price tier badges, product details
- **Non-blocking**: Image uploads and email notifications don't break user flow on failure
- **Graceful degradation**: If `projects` table or new `leads` columns don't exist, planner still works

### Database Migration Required
Run `supabase/migrations/20260211_create_projects_and_storage.sql` in Supabase SQL Editor to:
1. Create `projects` table with RLS policies
2. Add `project_id`, `lead_score`, `selected_product_details` columns to `leads`
3. Add storage policies for `project-images` bucket

### Edge Function Deployment Required
Deploy `supabase/functions/send-lead-notification` and set `RESEND_API_KEY` in Supabase secrets

## Recent Changes
- 2026-02-11: B2B contractor marketing page (`/voor-vakmensen`):
  - 12-section marketing page: Hero, Problem comparison, How it works, What's in a lead, Lead score explained, Pricing tiers, ROI calculator (interactive), Testimonials, Before/After showcase, FAQ, Final CTA, Sign-up form
  - Route added in App.tsx, nav link in Header.tsx, footer link in Footer.tsx
  - Interactive ROI calculator with sliders (order value, conversion rate, leads/month)
  - Contractor sign-up form with specialisatie toggles, plan selection, KvK field
  - Reuses design system (primary teal, accent orange, Tailwind classes)
- 2026-02-11: Lead generation system:
  - Created `projects` table + migration (supabase/migrations/20260211_create_projects_and_storage.sql)
  - Built projectService.ts for project CRUD and image uploads to Supabase Storage
  - Enhanced leadService.ts with 0-100 lead scoring and graceful column fallback
  - Updated PlannerPage.tsx: creates project on session start, tracks style/products/room/results at each step
  - Enhanced pdfService.ts: room dimensions, price tier badges, product pricing
  - Enhanced ResultDisplay.tsx: accepts room/product data for PDF generation
  - Created send-lead-notification Edge Function for Resend email with project dossier
  - Created project-images Storage bucket (private, 10MB limit)
  - LeadCaptureForm enhanced with timeline dropdown
- 2026-02-11: Product system upgrade:
  - Added price_low, price_high, price_tier, catalog_image_path, render_image_path, description columns to products table
  - Migration file: supabase/migrations/20260211_upgrade_products.sql (user must run in Supabase SQL editor)
  - Product images now served from Supabase Storage bucket 'product-images' (user creates + uploads)
  - productService.ts: getProductCatalogImageUrl(), getProductRenderImageUrl(), fetchRenderImagesForProducts() with fallback to legacy image_url
  - CategoryProductSelector: shows price tier badges (Budget/Midden/Premium) + price ranges
  - Cost estimation: uses price_low/price_high ranges instead of single price
  - CSV import edge function: supports new columns (price_low, price_high, price_tier, catalog_image_path, render_image_path, description)
- 2026-02-10: Single-shot rendering pipeline:
  - Removed two-step pipeline (generateEmptySpace + generateRenovationRender)
  - Added single-shot generateRenovation() — original photo goes directly to gemini-3-pro-image-preview with Thinking mode + 2K output
  - Product reference images fetched as base64 and sent inline (up to 14)
  - Added Behouden/Vervangen toggle per product category in ProductConfiguration
  - Added Toevoegen/Verwijderen options for Shower and Bathtub categories
  - Cost estimate now scope-aware: kept items have zero cost
  - Homepage hero changed from image to video
- 2026-02-10: New Inspiratie page at /badkamer-inspiratie with 14 before/after transformation cards, multi-filter pills, lightbox with swipe/keyboard nav, CTA + FAQ section. Nav updated from Advies to Inspiratie.
- 2026-02-10: Enhanced expert analysis response schema with description fields for longer, more detailed output
- 2026-02-09: Initial Replit setup - configured Vite for port 5000 with allowedHosts
- 2026-02-09: Fixed production build env var issue (removed typeof process guards)
- 2026-02-09: Connected Supabase and LaoZhang proxy
- 2026-02-09: Major AI pipeline improvements:
  - Bug fix: User dimensions now merge with AI analysis (not silently overwritten)
  - Bug fix: generateEmptySpace retries once then throws (no more silent fallback)
  - Bug fix: Fixed category-to-MaterialConfig key mapping (Faucet→faucetFinish, Lighting→lightingType)
  - Bug fix: BudgetTier now used in cost prompt with tier-specific guidance
  - Performance: analyzeBathroomInput + generateEmptySpace run in parallel
  - Performance: Photos compressed to 1500px before API calls
  - Prompt: Simplified analysis prompt, removed unused calibration_object
  - Prompt: Empty space prompt uses natural language (no fake API syntax)
  - Prompt: Render prompt uses architectural photography terms instead of gaming jargon
  - Prompt: Product reference images sent as inline image parts (not URL text)
  - Prompt: Added Dutch labor rate table to cost estimation (no more hallucinated prices)
  - Prompt: Material units now come from AI (m2, pcs, set) instead of hardcoded 'pcs/m2'
