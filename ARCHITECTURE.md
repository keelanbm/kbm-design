# Design Portfolio - Architecture

## Overview
Professional design portfolio inspired by phantom.land, featuring an infinite grid component built with Three.js, Notion CMS integration, and fluid motion design.

---

## Tech Stack

### Frontend Framework
- **Next.js 14+** (App Router)
- **TypeScript** (type safety)
- **React 18** (UI components)

### Styling & Animation
- **Tailwind CSS** (utility-first styling)
- **Motion.dev** (fluid animations)
- **Lucide React** (icon system)
- **shadcn/ui** (component library)

### 3D Graphics
- **Three.js** (WebGL rendering)
- **React Three Fiber** (React integration)
- Custom infinite grid with post-processing effects

### Content Management
- **Notion API** (CMS backend)
- Dynamic project data fetching
- Markdown/MDX support

---

## Project Structure

```
design-portfolio/
├── app/                          # Next.js app directory
│   ├── about/                    # About page route
│   ├── blog/                     # Blog page route
│   ├── projects/                 # Projects page route
│   ├── test-notion/              # Notion integration testing
│   ├── page.tsx                  # Homepage with infinite grid
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── animations/               # Animation components
│   ├── layout/                   # Layout components
│   │   ├── InfiniteGrid.tsx      # Main grid component (React wrapper)
│   │   └── infinite-grid/        # Three.js infinite grid implementation
│   │       ├── InfiniteGridClass.ts      # Core grid logic
│   │       ├── GridManager.ts            # Mesh/tile management
│   │       ├── EventHandler.ts           # Mouse/scroll events
│   │       ├── DisposalManager.ts        # Memory cleanup
│   │       ├── PostProcessShader.ts      # Post-processing effects
│   │       ├── createTexture.ts          # Canvas texture generation
│   │       ├── shaders.ts                # GLSL shader code
│   │       └── types.ts                  # TypeScript types
│   └── portfolio/                # Portfolio-specific components
│
├── lib/                          # Utility libraries
│   ├── data/                     # Data management
│   ├── notion/                   # Notion API integration
│   ├── types/                    # Shared TypeScript types
│   ├── utils/                    # Utility functions
│   ├── motion.ts                 # Motion.dev configuration
│   └── mdx.ts                    # MDX processing
│
├── content/                      # Static content
│   └── projects/                 # Project markdown files
│
├── public/                       # Static assets
│   ├── audio/                    # Audio files
│   ├── images/                   # Image assets
│   ├── models/                   # 3D models
│   └── videos/                   # Video files
│
├── scripts/                      # Development scripts
│   ├── phantom-land-comparison.md    # Design reference comparison
│   ├── phantom-land-analysis.md      # Design analysis notes
│   └── inspection-summary.md         # Inspection notes
│
├── types/                        # Global TypeScript types
│
├── .env.local                    # Environment variables (Notion, Cloudinary)
└── .claude.json                  # Claude Code configuration (MCP servers)
```

---

## Core Components

### 1. Infinite Grid Component
**Location:** `components/layout/infinite-grid/`

**Architecture:**
- **InfiniteGridClass.ts**: Core Three.js scene management
  - WebGL renderer setup
  - Camera positioning
  - Scene lifecycle management
  - Post-processing pipeline

- **GridManager.ts**: Tile creation and management
  - 9 tile groups (3×3 layout for infinite scrolling)
  - Foreground/background mesh creation
  - Texture application
  - Material management

- **EventHandler.ts**: User interaction
  - Mouse tracking
  - Scroll handling with inertia
  - Hover effects
  - Click detection for navigation

- **PostProcessShader.ts**: Visual effects
  - Lens distortion
  - Vignette effect
  - Full-screen quad rendering

- **createTexture.ts**: Canvas-based texture generation
  - 2048x2048 resolution cards
  - Image loading and fallbacks
  - Text rendering (title, tags, date)
  - Background blur effect

**Key Features:**
- Infinite scrolling with 9-group tile system
- Shader-based blur for backgrounds
- Post-processing (distortion + vignette)
- Canvas-generated textures for project cards
- Hover interactions and click navigation

---

### 2. Notion CMS Integration
**Location:** `lib/notion/`

**Features:**
- Dynamic project data fetching
- Markdown/MDX content support
- Image hosting via Cloudinary
- Database querying and filtering

**Environment Variables:**
```bash
NOTION_TOKEN=ntn_...              # Notion integration token
NOTION_DATABASE_ID=...            # Database ID
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...  # Image CDN
```

---

### 3. MCP Servers (Claude Code Integration)
**Location:** `~/.claude.json`

**Configured Servers:**
- **Notion MCP**: Notion workspace integration (HTTP)
- **Playwright MCP**: Browser automation (stdio)
- **Figma MCP**: Figma Desktop integration (HTTP at `http://127.0.0.1:3845/mcp`)
- **GitHub MCP**: GitHub Copilot integration (HTTP with Bearer auth)

---

## Data Flow

### Project Display Pipeline
```
Notion Database
  → API Fetch (lib/notion/)
  → Transform to CardData (lib/types/)
  → Generate Textures (createTexture.ts)
  → Apply to Meshes (GridManager.ts)
  → Render with Three.js (InfiniteGridClass.ts)
  → Display in Browser
```

### User Interaction Flow
```
User Input (mouse/scroll)
  → EventHandler.ts captures events
  → Update camera position
  → Raycast for hover detection
  → Update mesh uniforms (opacity, hover effects)
  → Trigger navigation on click
```

---

## Known Issues & Active Work

### 🚨 WebGL Rendering Errors
**Status:** Debugging in progress
**Detailed Plan:** `.claude/plans/typed-petting-gosling.md`

**Root Causes:**
1. UV distortion overflow in post-processing shader
2. Canvas blur corrupting texture mipmaps
3. Texture property initialization race condition
4. Missing render target clear operations
5. Render target size mismatches
6. Excessive draw calls (DoubleSide rendering)
7. Geometry duplication (180 instances)

**Expected Fixes:**
- **Phase 1**: Critical shader fixes (2-3 hours)
- **Phase 2**: Render pipeline cleanup (1-2 hours)
- **Phase 3**: Performance optimization (1-2 hours)

**Success Metrics:**
- ✅ Zero WebGL errors
- ✅ 60fps sustained
- ✅ Draw calls reduced from 360 → 180
- ✅ Memory usage < 150MB

---

## Design Philosophy

### Visual Design
- **Inspired by phantom.land**: Fluid motion, bespoke layouts
- **Grid distortion**: Lens effect for depth perception
- **Blur backgrounds**: Visual hierarchy and focus
- **Vignette**: Edge darkening for polish

### Performance Targets
- 60 FPS on high-DPR displays (2x pixel ratio)
- <150MB memory usage
- ~180 draw calls (after optimization)
- Smooth scrolling with inertia

### Code Quality
- TypeScript for type safety
- Modular architecture (separation of concerns)
- Memory management (disposal on unmount)
- Error boundary wrapping

---

## Development Workflow

### Running Locally
```bash
npm install          # Install dependencies
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run lint         # Run linter
```

### Git Branches
- `main`: Stable production code
- `feature/migrate-to-threejs`: Three.js migration work (current)

### Testing WebGL Changes
1. Open DevTools → Console (watch for WebGL errors)
2. Open DevTools → Performance → FPS meter
3. Test on Chrome, Firefox, Safari
4. Test on Retina displays (2x DPR)
5. Validate draw calls: `renderer.info.render.calls`

---

## Future Enhancements

### Planned Features
- Video textures for project previews
- Advanced post-processing (bloom, chromatic aberration)
- Mobile/touch optimization
- Accessibility improvements (keyboard navigation)
- Analytics integration

### Technical Debt
- Browser compatibility testing
- E2E test coverage
- Performance monitoring
- Error tracking (Sentry)

---

## References

### Documentation
- [Next.js App Router](https://nextjs.org/docs)
- [Three.js Documentation](https://threejs.org/docs/)
- [Notion API](https://developers.notion.com/)
- [Claude Code Documentation](https://code.claude.com/docs)

### Design Reference
- **phantom.land**: Primary design inspiration
- Analysis docs in `scripts/phantom-land-*.md`

### Internal Documentation
- **TODO**: See `TODO.md` for current tasks
- **WebGL Debugging**: See `.claude/plans/typed-petting-gosling.md`
- **README**: See `README.md` for quick start
