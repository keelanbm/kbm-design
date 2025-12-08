import { chromium } from 'playwright';

async function detailedInspect() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Set viewport to a standard size
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  console.log('Navigating to phantom.land...');
  await page.goto('https://phantom.land', { waitUntil: 'networkidle' });
  
  // Wait for animations
  await page.waitForTimeout(5000);
  
  // Get detailed WebGL and canvas information
  const detailedInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return { error: 'No canvas found' };
    
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return { error: 'No WebGL context' };
    
    // Get all WebGL state
    const extensions = gl.getSupportedExtensions();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    
    const info: any = {
      canvas: {
        width: canvas.width,
        height: canvas.height,
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight,
        style: {
          width: canvas.style.width,
          height: canvas.style.height,
          position: window.getComputedStyle(canvas).position,
          transform: window.getComputedStyle(canvas).transform,
        },
      },
      webgl: {
        drawingBufferWidth: gl.drawingBufferWidth,
        drawingBufferHeight: gl.drawingBufferHeight,
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
        maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
        maxVertexTextureImageUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
        maxCombinedTextureImageUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
        maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
        devicePixelRatio: window.devicePixelRatio,
      },
      renderer: debugInfo ? {
        vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
        renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
      } : null,
      extensions: extensions?.slice(0, 20), // First 20 extensions
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
      },
    };
    
    // Try to get current WebGL state
    const viewport = new Int32Array(4);
    gl.getParameter(gl.VIEWPORT);
    const viewportParam = gl.getParameter(gl.VIEWPORT);
    info.webgl.currentViewport = Array.from(viewportParam);
    
    // Try to get bound textures
    try {
      const textureUnit = gl.getParameter(gl.TEXTURE_BINDING_2D);
      info.webgl.boundTexture = textureUnit ? 'has texture' : 'no texture';
    } catch (e) {
      // Ignore
    }
    
    return info;
  });
  
  console.log('\n=== Detailed WebGL & Canvas Info ===');
  console.log(JSON.stringify(detailedInfo, null, 2));
  
  // Try to analyze the page source for clues about grid structure
  const pageAnalysis = await page.evaluate(() => {
    // Look for any data attributes, classes, or IDs that might indicate grid structure
    const allElements = document.querySelectorAll('*');
    const gridRelated: any[] = [];
    
    allElements.forEach(el => {
      const id = el.id;
      const className = el.className;
      const tagName = el.tagName;
      
      if (id && (id.includes('grid') || id.includes('card') || id.includes('tile'))) {
        gridRelated.push({
          type: 'id',
          value: id,
          tag: tagName,
          rect: el.getBoundingClientRect(),
        });
      }
      
      if (typeof className === 'string' && 
          (className.includes('grid') || className.includes('card') || className.includes('tile'))) {
        gridRelated.push({
          type: 'class',
          value: className,
          tag: tagName,
          rect: el.getBoundingClientRect(),
        });
      }
    });
    
    return {
      gridRelatedElements: gridRelated.slice(0, 10), // First 10 matches
      bodyHTML: document.body.innerHTML.substring(0, 2000), // First 2000 chars
    };
  });
  
  console.log('\n=== Page Structure Analysis ===');
  console.log('Grid-related elements:', JSON.stringify(pageAnalysis.gridRelatedElements, null, 2));
  
  // Calculate approximate card dimensions based on visible grid
  const cardDimensions = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;
    
    // This is a rough estimation - we'd need to analyze the WebGL scene for exact values
    // But we can at least get the viewport ratio
    const rect = canvas.getBoundingClientRect();
    
    return {
      viewportWidth: rect.width,
      viewportHeight: rect.height,
      aspectRatio: rect.width / rect.height,
      estimatedCardAspectRatio: 'unknown - requires WebGL scene analysis',
    };
  });
  
  console.log('\n=== Estimated Card Dimensions ===');
  console.log(JSON.stringify(cardDimensions, null, 2));
  
  // Take a full page screenshot for visual analysis
  console.log('\nTaking full page screenshot...');
  await page.screenshot({ 
    path: 'phantom-detailed-screenshot.png', 
    fullPage: true 
  });
  
  // Try to intercept WebGL calls to understand the rendering (advanced)
  console.log('\n=== Attempting WebGL Call Analysis ===');
  const webglCalls = await page.evaluate(() => {
    // This would require more advanced instrumentation
    // For now, just return that we'd need to use WebGL Inspector or similar
    return {
      note: 'WebGL call interception requires browser extension or advanced instrumentation',
      suggestion: 'Use browser DevTools > Sources > Event Listener Breakpoints > WebGL',
    };
  });
  
  console.log(JSON.stringify(webglCalls, null, 2));
  
  console.log('\n✅ Inspection complete!');
  console.log('📸 Screenshots saved:');
  console.log('   - phantom-screenshot.png');
  console.log('   - phantom-detailed-screenshot.png');
  
  // Keep browser open for manual inspection
  console.log('\nBrowser will stay open for 30 seconds for manual inspection...');
  await page.waitForTimeout(30000);
  
  await browser.close();
}

detailedInspect().catch(console.error);
