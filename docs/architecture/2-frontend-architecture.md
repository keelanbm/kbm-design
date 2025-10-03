# 2. Front‑End Architecture

## Framework & Rendering

- **Next.js** provides routing, static generation (SSG), server‑side rendering (SSR) and incremental static regeneration (ISR). Use SSG for largely static pages (e.g., the About page, the 3‑D gallery), ISR for project pages that update periodically, and SSR for dynamic or personalised pages. Edge rendering can be enabled on Vercel for low latency.
- **React Three Fiber (R3F)** powers the immersive 3‑D grid. Create a cylinder or sphere geometry and map each project card onto its surface. Scroll events rotate the geometry, with fallback CSS Grid for non‑WebGL devices. Integrate GSAP ScrollTrigger for smooth synchronisation between scroll and 3‑D rotation.
- **React Bits & Aceternity UI** provide ready‑made components and animations (e.g., floating nav bar, interactive cards). Compose these with Tailwind CSS utilities and custom CSS variables to establish a dark theme and per‑category accent colours.
- **Tailwind CSS & CSS Variables** handle styling. Define a neutral dark palette and expose CSS variables (`--accent-work`, `--accent-motion`, etc.) that the UI and navigation can consume. Use utility classes for responsive design.

## State & Data Fetching

- **Static Data Loading** – Use `getStaticProps`/`getStaticPaths` to fetch project lists and individual project content from the CMS at build time. For content that changes frequently (e.g., blog posts or news), use ISR with a revalidation window.
- **Client Data Hooks** – Build custom React hooks to fetch additional data (e.g., related projects, analytics events) on the client side. Use SWR or React Query for caching and revalidation.
- **Context for Theme & Category** – Manage global state (selected category, colour palette, sound settings) via React Context or Zustand. Pass accent colours down to R3F materials and UI components.
