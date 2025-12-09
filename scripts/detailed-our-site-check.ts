import { chromium } from 'playwright';

async function detailedCheck() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  console.log('Navigating to our site...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  // Wait for initialization
  await page.waitForTimeout(7000);
  
  // Collect console messages
  const consoleMessages: string[] = [];
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleMessages.push(`[${type}] ${text}`);
    if (type === 'error') {
      consoleErrors.push(text);
    } else if (type === 'warning') {
      consoleWarnings.push(text);
    }
  });
  
  // Check for errors
  page.on('pageerror', error => {
    consoleErrors.push(`Page Error: ${error.message}`);
  });
  
  // Get detailed rendering info
  const renderingInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return { error: 'No canvas' };
    
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return { error: 'No WebGL context' };
    
    // Try to read some pixel data to check if rendering is working
    const imageData = new Uint8Array(4);
    
    return {
      canvas: {
        width: canvas.width,
        height: canvas.height,
        style: {
          position: window.getComputedStyle(canvas).position,
          width: window.getComputedStyle(canvas).width,
          height: window.getComputedStyle(canvas).height,
          top: window.getComputedStyle(canvas).top,
          left: window.getComputedStyle(canvas).left,
        },
      },
      webgl: {
        drawingBufferWidth: gl.drawingBufferWidth,
        drawingBufferHeight: gl.drawingBufferHeight,
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        viewport: gl.getParameter(gl.VIEWPORT),
      },
      viewport: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
      },
    };
  });
  
  console.log('\n=== Rendering Info ===');
  console.log(JSON.stringify(renderingInfo, null, 2));
  
  // Check for loading overlay
  const loadingCheck = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    return {
      hasLoadingText: elements.some(el => el.textContent?.includes('Loading grid')),
      loadingElements: elements
        .filter(el => el.textContent?.includes('Loading grid'))
        .map(el => ({
          tag: el.tagName,
          visible: window.getComputedStyle(el).display !== 'none',
          opacity: window.getComputedStyle(el).opacity,
        })),
    };
  });
  
  console.log('\n=== Loading State Check ===');
  console.log(JSON.stringify(loadingCheck, null, 2));
  
  // Check container and layout
  const layoutCheck = await page.evaluate(() => {
    const container = document.querySelector('.infinite-grid-container');
    const canvas = document.querySelector('canvas');
    
    return {
      container: {
        exists: container !== null,
        rect: container ? container.getBoundingClientRect() : null,
        styles: container ? {
          position: window.getComputedStyle(container).position,
          width: window.getComputedStyle(container).width,
          height: window.getComputedStyle(container).height,
          overflow: window.getComputedStyle(container).overflow,
          zIndex: window.getComputedStyle(container).zIndex,
        } : null,
      },
      canvas: {
        exists: canvas !== null,
        rect: canvas ? canvas.getBoundingClientRect() : null,
        parent: canvas?.parentElement?.tagName,
      },
    };
  });
  
  console.log('\n=== Layout Check ===');
  console.log(JSON.stringify(layoutCheck, null, 2));
  
  // Take screenshot
  await page.screenshot({ path: 'our-site-detailed.png', fullPage: true });
  
  // Test scroll/interaction
  console.log('\n=== Testing Interactions ===');
  const interactionTest = await page.evaluate(async () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { error: 'No canvas' };
    
    // Try to simulate a mouse move
    const event = new MouseEvent('mousemove', {
      clientX: 960,
      clientY: 540,
      bubbles: true,
    });
    canvas.dispatchEvent(event);
    
    return {
      canvasInteractable: true,
      testEventFired: true,
    };
  });
  
  console.log(JSON.stringify(interactionTest, null, 2));
  
  // Summary
  console.log('\n=== Summary ===');
  console.log(`Canvas: ${renderingInfo.canvas ? '✅ Found' : '❌ Missing'}`);
  console.log(`WebGL: ${renderingInfo.webgl ? '✅ Active' : '❌ Not active'}`);
  console.log(`Loading overlay: ${loadingCheck.hasLoadingText ? '❌ Still visible' : '✅ Hidden'}`);
  console.log(`Canvas position: ${renderingInfo.canvas?.style.position || 'unknown'}`);
  
  if (consoleErrors.length > 0) {
    console.log('\n⚠️  Console Errors:');
    consoleErrors.forEach(err => console.log(`   - ${err}`));
  } else {
    console.log('\n✅ No console errors');
  }
  
  if (consoleWarnings.length > 0) {
    console.log('\n⚠️  Console Warnings:');
    consoleWarnings.slice(0, 5).forEach(warn => console.log(`   - ${warn}`));
  }
  
  console.log('\n✅ Detailed check complete!');
  console.log('📸 Screenshot: our-site-detailed.png');
  
  await page.waitForTimeout(20000);
  
  await browser.close();
}

detailedCheck().catch(console.error);

