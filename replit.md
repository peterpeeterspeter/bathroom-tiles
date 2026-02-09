# De Badkamer - Bathroom Renovation Platform

## Overview
A Dutch-language bathroom renovation platform built with React, Vite, and Tailwind CSS. It uses Gemini AI for bathroom analysis/rendering and Supabase as the backend database. Users can get free renovation quotes, use an AI bathroom planner, and browse advice articles.

## Project Architecture
- **Framework**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS v4
- **AI**: Google Gemini API (`@google/genai`)
- **Backend**: Supabase (external, not local DB)
- **PDF Generation**: jspdf + html2canvas
- **Routing**: react-router-dom v7

## Directory Structure
- `/components` - React UI components
- `/pages` - Page-level components (Home, Kosten, Planner, Advies, etc.)
- `/lib` - Utility services (supabase client, analytics, PDF, SEO)
- `/services` - AI services (Gemini integration, style analysis)
- `/supabase` - Supabase migrations and edge functions
- `/public` - Static assets (robots.txt, sitemap.xml)

## Environment Variables
- `GEMINI_API_KEY` or `VITE_GEMINI_API_KEY` - Google Gemini API key
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Development
- Dev server: `npm run dev` (port 5000)
- Build: `npm run build` (output to `dist/`)
- Preview: `npm run preview`

## Deployment
- Static deployment with `npm run build`, serving from `dist/`

## Recent Changes
- 2026-02-09: Initial Replit setup - configured Vite for port 5000 with allowedHosts
