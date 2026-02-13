# De Badkamer - Bathroom Renovation Platform

## Overview
De Badkamer is a Dutch-language bathroom renovation platform that leverages AI to simplify the renovation process. It offers users free renovation quotes, an AI-powered bathroom planner, and informative advice articles. The platform aims to streamline bathroom design and renovation, providing a comprehensive solution from inspiration to execution.

## User Preferences
I want iterative development.
Ask before making major changes.
I prefer to use simple language.
I want detailed explanations.

## System Architecture
The platform is built with **React 19**, **TypeScript**, and **Vite 6** for a modern and efficient frontend. **Tailwind CSS v4** is used for styling, ensuring a consistent and responsive UI/UX.

### AI Integration
The AI core is powered by **Google Gemini API**.
- **Generative AI**: `gemini-3-pro-image-preview` is used for bathroom rendering, accessed via a LaoZhang proxy for image generation.
- **Expert Analysis**: `gemini-3-flash-preview` provides a 9-step expert renovation analysis, directly accessed via the Google AI API.

### Backend and Data Management
**Supabase** serves as the primary backend, handling database operations, authentication, and storage.
- Project data, including style, products, dimensions, estimates, and images, is stored in the `projects` table.
- User photos and AI-generated renders are stored in a private `project-images` Supabase Storage bucket.
- Lead scoring (0-100 algorithm) is implemented client-side, factoring in contact details, project data, AI outputs, and budget.
- Email notifications for leads are managed by a Supabase Edge Function (`send-lead-notification`) integrating with Resend.

### AI Pipeline Overview
The AI planner workflow involves:
1.  **Style Selection**: Users choose preset styles or upload reference images.
2.  **Dimensions & Photo**: Users provide bathroom dimensions and upload a photo.
3.  **Expert Analysis & Product Configuration**: The system performs a 9-step analysis, generating an enriched `StyleProfile` and allowing users to configure products (replace/keep, add/remove).
4.  **Processing**:
    -   `analyzeBathroomInput()` enhances spatial data (CameraSpec, WallSpec, fixture conditions).
    -   `generateRenovation()` creates a single-shot render using the original photo, inspiration, and product reference images. Prompt structure: task instruction + room fidelity constraints FIRST, then Perspective Lock and Room Description inside STEP 1 (verification), spatial/layout data in STEP 2, product scope in STEP 3, style in STEP 4, and final constraints at the end (bookend pattern).
    -   `calculateRenovationCost()` provides a scope-aware cost estimate, considering kept items and plumbing wall distance.
    -   User-provided dimensions take precedence over AI estimates.
    -   Photos are compressed to 1500px before API calls.
    -   Product reference images (up to 14) are sent as inline base64 parts.

### AI API Configuration and Routing
-   **LaoZhang proxy (`GEMINI_API_KEY`, `GEMINI_BASE_URL`)**: Exclusively for `generateRenovation` (image generation).
-   **Google direct API (`GOOGLE_AI_API_KEY`)**: First choice for all text/analysis calls, with the proxy as fallback.
-   Routing uses `withRetry` with `'direct-first'` as the default (Google API first, proxy fallback) or `'proxy-only'` for specific functions.

### Other Technical Implementations
-   **PDF Generation**: `jspdf` and `html2canvas` are used to create detailed PDF dossiers for projects.
-   **Routing**: `react-router-dom v7` manages navigation within the application.
-   **Lead Generation**: Non-blocking image uploads and email notifications ensure smooth user experience. Graceful degradation is implemented for database table/column availability.
-   **Product System**: Products include `price_low`, `price_high`, `price_tier`, and various image paths. Cost estimation uses price ranges. A product catalog of 81 curated products from Sawiday.be is integrated, including `images` (array of CDN URLs) and `source_url`.
-   **User Intent Capture**: Free-text fields for `moodDescription` (aesthetic preferences) and `roomNotes` (room constraints) are integrated into AI prompts with sanitization.

## External Dependencies
-   **Google Gemini API**: For AI-powered bathroom analysis and rendering.
-   **LaoZhang Proxy**: Custom proxy for specific Gemini API calls, primarily for image generation.
-   **Supabase**: Backend-as-a-Service for database, authentication, and storage.
-   **Resend**: Email API used for sending lead notifications via Supabase Edge Functions.
-   **jspdf**: JavaScript library for generating PDFs client-side.
-   **html2canvas**: Library to take screenshots of webpages or parts of them, used for PDF generation.
-   **react-router-dom**: For client-side routing in the React application.
-   **rorix.nl CDN**: Hosts product images directly.