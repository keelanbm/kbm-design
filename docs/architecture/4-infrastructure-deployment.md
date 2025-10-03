# 4. Infrastructure & Deployment

## Hosting & CD

- **Vercel** is recommended for Next.js projects due to built‑in support for serverless functions, ISR and edge rendering. It automatically handles CI/CD on pushes to the repository and integrates with analytics.
- **Netlify** is an alternative with similar capabilities (serverless functions, deploy previews). Choose based on familiarity and required features (Vercel supports edge functions more natively).

## Serverless Functions

- Use serverless functions for tasks that require secure processing or cannot run on the client, such as contact form submission, email sending or retrieving private CMS data. Place them in the `api/` directory of Next.js.
- If needed, set up an SSR/edge function to handle user‑specific interactions (e.g., sound preferences stored in cookies).

## CDN & Caching

- Leverage the hosting platform’s CDN to serve static assets and generated pages globally. Use cache headers and `revalidate` settings in Next.js to control freshness of ISR pages.
- Optimise media with automatic image compression and responsive sizing. Lazy load 3‑D models and videos to minimise initial payload.
