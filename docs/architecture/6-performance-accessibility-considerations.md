# 6. Performance & Accessibility Considerations

- **Lazy Loading** – Load 3‑D assets, videos and heavy images only when they enter the viewport. Provide skeleton placeholders while content loads.
- **Fallbacks** – Offer a 2‑D grid for devices that cannot handle WebGL or have reduced motion settings. Use feature detection and respect `prefers-reduced-motion` to disable heavy animations.
- **Optimised Bundles** – Take advantage of React Server Components and code splitting to minimise client‑side JavaScript. Use tree‑shaking and dynamic imports for optional libraries (e.g., GSAP).
- **Accessibility** – Ensure text contrasts meet WCAG guidelines. Provide keyboard navigation, focus indicators and alt text for all images.
