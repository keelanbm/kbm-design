# 3. Content & Data Layer

## Headless CMS

- **Choice** – Sanity and Strapi are flexible and widely used; both support custom schemas, rich media fields and image optimisation. Sanity offers a portable studio and real‑time updates; Strapi provides built‑in authentication and GraphQL generation.
- **Schema Design** – Define content types for Projects, Categories, and Site Settings. Each Project entry includes title, slug, description, media (images, videos), tags, accent colour, and optional fields like technology stack or role. Category entries define names and palette values; Site Settings store personal bio, contact information and nav labels.
- **Media Hosting** – Store large assets on a media platform (e.g., Cloudinary, S3). Use the CMS to reference these assets via secure URLs. Implement responsive images and different video formats (e.g., MP4 and HLS) for cross‑device compatibility.

## API Access

- **Data Fetching** – Query the CMS via its REST or GraphQL API. For static generation, perform these requests during build; for dynamic actions (e.g., search), call the API from serverless functions to keep keys secret.
- **CORS & Security** – Configure CORS to allow the front‑end domain. Secure API tokens using environment variables and avoid exposing them in client‑side code.
