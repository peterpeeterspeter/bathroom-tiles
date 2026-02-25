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
    -   `analyzeBathroomInput()` enhances spatial data (CameraSpec, WallSpec, fixture conditions) AND generates a `naturalDescription` — a detailed, obsessively-specific plain-English room description written by the analysis model. Walls use camera-relative labeling (0=far, 1=right, 2=behind camera, 3=left) instead of compass directions.
    -   `generateRenovation()` creates a single-shot render. Bathroom photo is always IMAGE 1 (first in parts array), before inspiration and product images. Prompt opens with "IMAGE 1 IS YOUR GROUND TRUTH" and all references use "IMAGE 1" consistently. Structure: ground-truth declaration → STEP 1 (study room geometry/perspective from IMAGE 1) → STEP 2 (mentally strip room to bare shell) → STEP 3 (place fixtures one by one from empty room) → STEP 4 (apply finishes and style) → STEP 5 (final verification). Uses Gemini 3's built-in thinking/reasoning (default high) for step-by-step spatial planning.
    -   **INSTRUCT vs ASSERT**: The render prompt uses the INSTRUCT approach — it tells the model WHAT to think about (study the geometry, note the perspective, strip the room) rather than ASSERTING spatial facts from our analysis. The model's own spatial reasoning from seeing IMAGE 1 is more reliable than external analysis text that might be wrong. Only deterministic constraints are asserted (don't change viewpoint, don't add windows). Product scope, style, and user preferences are still passed as data since the model can't infer those.
    -   **REFERENCE NOTES**: Analysis data (naturalDescription, dimensions, fixture conditions, occlusions, structural constraints) is fed into the render prompt as supplementary reference notes after STEP 1. These are explicitly framed as "from a prior analysis — use to supplement your own observations, but trust IMAGE 1 if anything conflicts." This gives the model useful context (room dimensions, what's behind the camera, worn fixtures) without overriding its own spatial reasoning from the photo.
    -   `calculateRenovationCost()` provides a scope-aware cost estimate, considering kept items and plumbing wall distance.
    -   User-provided dimensions take precedence over AI estimates.
    -   Photos are compressed to 1500px before API calls.
    -   Product reference images (up to 14) are sent as inline base64 parts.

### Multi-Approach Rendering
The planner generates up to 5 renovation renders in parallel, each using a different approach:
-   **Aanpak A (baseline)**: Standard INSTRUCT prompt via Gemini proxy.
-   **Aanpak B (structure_locked)**: Locked approach with lower temperature (0.15) for higher fidelity.
-   **Aanpak C (two_pass_locked)**: Two-pass pipeline — first a text-only layout guardrail check, then the locked render.
-   **Aanpak D (openai_gpt_image_1_5)**: OpenAI GPT Image 1.5 edit pipeline (requires `OPENAI_API_KEY`).
-   **Aanpak E (seedream_5_lite_edit)**: ByteDance Seedream v5 Lite via fal.ai (requires `FAL_KEY`, gated by `VITE_ENABLE_SEEDREAM_LITE=true`). Uses URL-based image input from Supabase signed URLs. Prompt uses photographic/architectural language and example-based editing: inspiration images are framed as style exemplars ("apply the style in Figure 2 to Figure 1") leveraging Seedream's ability to infer transformations from before/after pairs. Image ordering: Figure 1 = bathroom photo, Figure 2-N = inspiration images (up to 3, uploaded to Supabase for signed URLs), Figure N+1... = product images (CDN URLs). The `naturalDescription` from analysis is passed as spatial context. Inspiration images (originally base64 data URLs from user uploads) are uploaded to Supabase storage during the Seedream prep phase to obtain HTTP signed URLs.
All approaches are fault-tolerant — if one fails, the others still return. The user sees all successful variants.

### AI API Configuration and Routing
-   **LaoZhang proxy (`GEMINI_API_KEY`, `GEMINI_BASE_URL`)**: For `generateRenovation` image generation (approaches A/B/C).
-   **Google direct API (`GOOGLE_AI_API_KEY`)**: First choice for all text/analysis calls, with the proxy as fallback.
-   **OpenAI API (`OPENAI_API_KEY`)**: For GPT Image 1.5 edit pipeline (approach D).
-   **fal.ai (`FAL_KEY`)**: For Seedream v5 Lite edit pipeline (approach E). Endpoint: `https://fal.run/fal-ai/bytedance/seedream/v5/lite/edit`.
-   Routing uses `withRetry` with `'direct-first'` as the default (Google API first, proxy fallback) or `'proxy-only'` for specific functions.
-   All API keys are injected into the client bundle via `vite.config.ts` `define` block.

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
-   **fal.ai**: AI inference platform used for Seedream v5 Lite image editing pipeline.
-   **OpenAI API**: For GPT Image 1.5 edit pipeline (approach D).
-   **rorix.nl CDN**: Hosts product images directly.