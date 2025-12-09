# Design Portfolio - TODO

## 🚨 Current Priority: WebGL Debugging

### Phase 1: Critical Shader Fixes (2-3 hours)
- [ ] Fix UV clamping in post-processing shader (shaders.ts:69)
- [ ] Remove canvas blur filter (createTexture.ts:331-336)
- [ ] Fix texture property initialization order (createTexture.ts:268-272, 363-367)
- [ ] Improve error logging (InfiniteGridClass.ts:456-479)
- [ ] Test Phase 1 validation (no WebGL errors, grid renders)

### Phase 2: Render Pipeline Fixes (1-2 hours)
- [ ] Add clear operations between render passes (InfiniteGridClass.ts:719-735)
- [ ] Match render target size to renderer (InfiniteGridClass.ts:515-520)
- [ ] Test Phase 2 validation (no artifacts, smooth effects)

### Phase 3: Performance Optimization (1-2 hours)
- [ ] Remove DoubleSide rendering (GridManager.ts:306-312, 355-363)
- [ ] Share geometry across tiles (GridManager.ts:79, 185-188, 207-210, 484)
- [ ] Test Phase 3 validation (60fps, draw calls halved)

---

## ✅ Recently Completed

### Documentation Setup (Dec 8, 2025)
- ✅ Created TODO.md for task tracking
- ✅ Created ARCHITECTURE.md for system documentation
- ✅ Updated README.md with documentation links

### MCP Server Configuration (Dec 8, 2025)
- ✅ Fixed Figma MCP connection (HTTP at http://127.0.0.1:3845/mcp)
- ✅ Fixed GitHub MCP connection (HTTP with Bearer token auth)
- ✅ Both servers now connecting successfully

---

## 📅 Backlog

### Documentation
- [ ] Review and organize existing phantom.land analysis docs in scripts/
- [ ] Document Notion CMS integration patterns
- [ ] Add component documentation (infinite grid, animations)
- [ ] Create docs/getting-started.md guide
- [ ] Create docs/troubleshooting.md

### Features
- [ ] Implement video texture support for project previews
- [ ] Add advanced post-processing effects (bloom, chromatic aberration)
- [ ] Optimize for mobile/touch devices
- [ ] Add keyboard navigation support
- [ ] Implement analytics integration

### Infrastructure
- [ ] Rotate GitHub PAT token (security)
- [ ] Set up CI/CD pipeline
- [ ] Add E2E tests for critical user flows
- [ ] Set up error tracking (Sentry)
- [ ] Performance monitoring

### Design & UX
- [ ] Test on Safari (WebKit validation)
- [ ] Test on Firefox (shader compatibility)
- [ ] Test on mobile devices (touch interactions)
- [ ] Accessibility audit (keyboard nav, screen readers)

---

## 📖 Documentation References

- **WebGL Debugging Plan:** `.claude/plans/typed-petting-gosling.md`
- **Architecture:** `ARCHITECTURE.md`
- **Getting Started:** `README.md`
