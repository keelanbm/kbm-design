import { chromium } from 'playwright';

async function inspectPhantomLand() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Navigating to phantom.land...');
  await page.goto('https://phantom.land', { waitUntil: 'networkidle' });
  
  // Wait a bit for any animations to complete
  await page.waitForTimeout(3000);
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'phantom-screenshot.png', fullPage: true });
  
  // Get canvas information
  const canvasInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const computed = window.getComputedStyle(canvas);
    
    return {
      width: rect.width,
      height: rect.height,
      aspectRatio: rect.width / rect.height,
      transform: computed.transform,
      perspective: computed.perspective,
      position: computed.position,
      zIndex: computed.zIndex,
    };
  });
  
  console.log('\n=== Canvas Info ===');
  console.log(JSON.stringify(canvasInfo, null, 2));
  
  // Get viewport dimensions
  const viewport = page.viewportSize();
  console.log('\n=== Viewport ===');
  console.log(JSON.stringify(viewport, null, 2));
  
  // Try to find WebGL context info
  const webglInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;
    
    const gl = (canvas as HTMLCanvasElement).getContext('webgl') || 
               (canvas as HTMLCanvasElement).getContext('webgl2');
    if (!gl) return null;
    
    return {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      drawingBufferWidth: gl.drawingBufferWidth,
      drawingBufferHeight: gl.drawingBufferHeight,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
    };
  });
  
  console.log('\n=== WebGL Info ===');
  console.log(JSON.stringify(webglInfo, null, 2));
  
  // Get computed styles of the main container
  const containerInfo = await page.evaluate(() => {
    const body = document.body;
    const html = document.documentElement;
    
    return {
      bodyWidth: body.clientWidth,
      bodyHeight: body.clientHeight,
      htmlWidth: html.clientWidth,
      htmlHeight: html.clientHeight,
      bodyStyles: {
        overflow: window.getComputedStyle(body).overflow,
        margin: window.getComputedStyle(body).margin,
        padding: window.getComputedStyle(body).padding,
      },
    };
  });
  
  console.log('\n=== Container Info ===');
  console.log(JSON.stringify(containerInfo, null, 2));
  
  // Look for any data attributes or classes that might indicate card structure
  const structureInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const container = canvas?.parentElement;
    
    return {
      canvasParent: {
        tagName: container?.tagName,
        className: container?.className,
        id: container?.id,
        styles: container ? window.getComputedStyle(container) : null,
      },
      scripts: Array.from(document.querySelectorAll('script[src]')).map(s => ({
        src: (s as HTMLScriptElement).src,
        type: (s as HTMLScriptElement).type,
      })),
      stylesheets: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => ({
        href: (l as HTMLLinkElement).href,
      })),
    };
  });
  
  console.log('\n=== Structure Info ===');
  console.log(JSON.stringify(structureInfo, null, 2));
  
  console.log('\nScreenshot saved as phantom-screenshot.png');
  console.log('\nPress any key to close the browser...');
  
  // Keep browser open for a bit so we can see it
  await page.waitForTimeout(10000);
  
  await browser.close();
}

inspectPhantomLand().catch(console.error);
