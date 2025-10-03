# KBM.Design

Interactive portfolio showcasing UX/UI design, motion design, and vibe coding.

**Live Site:** [https://kbm-design.vercel.app](https://kbm-design.vercel.app)

## Tech Stack

- **Framework:** Next.js 15.5.4 with App Router
- **Language:** TypeScript with strict mode
- **Styling:** Tailwind CSS with custom CSS variables
- **3D Graphics:** React Three Fiber, Three.js, Drei
- **Animation:** GSAP, Framer Motion
- **Code Quality:** ESLint, Prettier, Husky, lint-staged

## Prerequisites

- Node.js 18+ (currently using 24.7.0)
- npm or pnpm

## Installation

1. Clone the repository:

```bash
git clone https://github.com/keelanbm/kbm-design.git
cd kbm-design
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
/app                  - Next.js App Router pages and layouts
/components           - Reusable React components
/lib                  - Utility functions and helpers
/styles               - Global styles and CSS variables
  /globals.css        - Dark theme with category-specific accent colors
/public               - Static assets
```

## Development Workflow

### Pre-commit Hooks

This project uses Husky and lint-staged to ensure code quality. Before each commit:

- ESLint checks and auto-fixes TypeScript/JavaScript files
- Prettier formats all staged files
- Commits are blocked if linting errors persist

### Theming

The project uses CSS variables for theming with category-specific accent colors:

- **Work (UX/UI):** Blue (`--accent-work`)
- **Motion Design:** Purple (`--accent-motion`)
- **Vibe Coding:** Green (`--accent-code`)

Access these in components with Tailwind classes:

```tsx
<div className="bg-background text-foreground">
  <h1 className="text-accent-work">UX/UI Projects</h1>
</div>
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, Next.js will automatically try 3001, 3002, etc.

### TypeScript Errors

Run type checking:

```bash
npx tsc --noEmit
```

### ESLint Errors

Fix auto-fixable issues:

```bash
npm run lint -- --fix
```

### Prettier Formatting

Format all files:

```bash
npm run format
```

## License

Private project - All rights reserved
