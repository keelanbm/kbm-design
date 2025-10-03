# 1. High‑Level Overview

KBM.Design is an interactive portfolio for showcasing UX/UI design, motion work and “vibe coding” projects. It needs to deliver polished visuals and smooth motion while remaining performant and easy to maintain. To achieve this the system is divided into three main layers:

1. **Presentation layer** – A Next.js front‑end built with React, React Three Fiber (R3F), Tailwind CSS, and supporting libraries like React Bits and Aceternity UI. This layer renders the 3‑D gallery, project pages and navigation. It includes client‑side components (for interactive effects) and server‑side/edge rendering for SEO and performance.
2. **Content & data layer** – A headless CMS (e.g., Sanity or Strapi) stores project metadata, text, images, videos and category definitions. Media assets are stored on a dedicated media service (e.g., Cloudinary or Amazon S3) and referenced from the CMS. A lightweight API fetches data at build time or per request.
3. **Infrastructure & services** – Hosting on Vercel (or Netlify) provides CDN distribution, serverless functions, and analytics. External services include analytics providers (e.g., Vercel Analytics, Google Analytics) and optional contact form/email services. Deployment scripts handle continuous integration and updates.

```
┌─────────────────────────┐        ┌────────────────────────────┐
│        Visitors         │        │     Admin/Author (CMS)      │
└──────────────┬──────────┘        └───────────────┬────────────┘
               │                                       │
               ▼                                       ▼
       ┌────────────────┐                  ┌────────────────────────┐
       │ Next.js Front‑ │                  │ Headless CMS Dashboard │
       │  end (R3F, UI) │◄───────────────┐ │  (Sanity/Strapi)        │
       └────────────────┘                │ └────────────────────────┘
               │ API Calls/ISR           │           ▲
               │ (SSR/SSG/Client Fetch)  │           │
               ▼                         │           │
       ┌────────────────┐                │           │
       │    CMS API     │───────────────┘           │
       │ (GraphQL/REST) │                            │
       └────────────────┘                            │
               │                                     │
               ▼                                     │
        ┌───────────────┐                ┌─────────────────────────┐
        │ Media Storage │◄──────────────►│  Deployment & Hosting   │
        │  (S3, Cloudinary)│            │ (Vercel/Netlify + CDN) │
        └───────────────┘                └─────────────────────────┘
               │                                     │
               ▼                                     ▼
        ┌───────────────┐                ┌─────────────────────────┐
        │  Analytics &   │◄──────────────►│ Serverless Functions    │
        │   Monitoring   │                │  (Form handling, etc.)  │
        └───────────────┘                └─────────────────────────┘
```
