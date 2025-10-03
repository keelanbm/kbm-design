# KBM.Design Dependencies

## UI Component Library Alternatives

### React Bits & Aceternity UI Status

- **react-bits** (v1.0.5): Package exists but is outdated (last updated 2017), not suitable for modern Next.js 15
- **aceternity-ui** (v0.2.2): Package exists but appears to be a CLI tool rather than component library

### Selected Alternative

- **Framer Motion** (v12.23.22): Production-ready animation library with excellent React integration
  - Provides smooth animations for UI components
  - Well-maintained and widely used
  - Compatible with Next.js App Router and React 19
  - Can be used alongside GSAP for different animation needs

## Full Dependency List

### Core Framework

- `next`: ^15.1.5
- `react`: ^19.0.0
- `react-dom`: ^19.0.0

### 3D Graphics

- `three`: ^0.180.0
- `@react-three/fiber`: ^9.3.0
- `@react-three/drei`: ^10.7.6

### Animation

- `gsap`: ^3.13.0 (for scroll-synchronized animations)
- `framer-motion`: ^12.23.22 (for UI component animations)

### Styling

- `tailwindcss`: ^3.4.1
- `postcss`: ^8
- `autoprefixer`: ^10.4.21

### TypeScript

- `typescript`: ^5
- `@types/node`: ^20
- `@types/react`: ^19
- `@types/react-dom`: ^19
- `@types/three`: ^0.180.0

### Code Quality

- `eslint`: ^8
- `eslint-config-next`: 15.1.5

## Notes

- Node.js 24.7.0 used (exceeds v18+ requirement)
- Package manager: npm
- All dependencies successfully installed without conflicts
