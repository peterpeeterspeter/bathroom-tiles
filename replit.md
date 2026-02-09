# De Badkamer - Bathroom Renovation Platform

## Overview
A Dutch-language bathroom renovation platform built with React, Vite, and Tailwind CSS. It uses Gemini AI for bathroom analysis/rendering and Supabase as the backend database. Users can get free renovation quotes, use an AI bathroom planner, and browse advice articles.

## Project Architecture
- **Framework**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS v4
- **AI (generation)**: Google Gemini API (`@google/genai`) via LaoZhang proxy (gemini-3-pro-image-preview for renders)
- **AI (style analysis)**: Google Gemini API direct (gemini-3-flash-preview for style tag extraction, via GOOGLE_AI_API_KEY)
- **Backend**: Supabase (external, not local DB)
- **PDF Generation**: jspdf + html2canvas
- **Routing**: react-router-dom v7

## AI Pipeline (PlannerPage)
1. **Style Selection** — User picks preset or uploads references → `analyzeStyleFromReferences()` (optional)
2. **Product Configuration** — Products scored by style profile from Supabase
3. **Dimensions & Photo** — User enters dimensions + uploads bathroom photo
4. **Processing** (parallel):
   - `analyzeBathroomInput()` + `generateEmptySpace()` run in parallel
   - Then `calculateRenovationCost()` + `generateRenovationRender()` run in parallel
5. User dimensions take priority over AI-estimated dimensions
6. Photos are compressed to 1500px max before API calls
7. Product reference images are sent as inline image parts to the render model

## Directory Structure
- `/components` - React UI components
- `/pages` - Page-level components (Home, Kosten, Planner, Advies, etc.)
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

## Recent Changes
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
