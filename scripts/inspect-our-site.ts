import { chromium } from 'playwright';

async function inspectOurSite() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Set viewport to match what we inspected on phantom.land
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  console.log('Navigating to local dev server...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  // Wait for grid to initialize
  console.log('Waiting for grid to initialize...');
  await page.waitForTimeout(5000);
  
  // Check if canvas exists and is visible
  const canvasCheck = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { error: 'No canvas found' };
    
    const rect = canvas.getBoundingClientRect();
    const computed = window.getComputedStyle(canvas);
    const isVisible = computed.display !== 'none' && computed.visibility !== 'hidden' && computed.opacity !== '0';
    
    return {
      exists: true,
      visible: isVisible,
      width: rect.width,
      height: rect.height,
      position: computed.position,
      zIndex: computed.zIndex,
      opacity: computed.opacity,
    };
  });
  
  console.log('\n=== Canvas Visibility Check ===');
  console.log(JSON.stringify(canvasCheck, null, 2));
  
  // Get WebGL context info
  const webglInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return { error: 'No canvas found' };
    
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return { error: 'No WebGL context' };
    
    return {
      canvas: {
        width: canvas.width,
        height: canvas.height,
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight,
      },
      webgl: {
        drawingBufferWidth: gl.drawingBufferWidth,
        drawingBufferHeight: gl.drawingBufferHeight,
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        devicePixelRatio: window.devicePixelRatio,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  });
  
  console.log('\n=== WebGL Info ===');
  console.log(JSON.stringify(webglInfo, null, 2));
  
  // Check for any console errors
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  // Check for loading overlay
  const loadingCheck = await page.evaluate(() => {
    const loadingText = Array.from(document.querySelectorAll('*'))
      .find(el => el.textContent?.includes('Loading grid'));
    return {
      loadingVisible: loadingText !== undefined,
      loadingText: loadingText?.textContent,
    };
  });
  
  console.log('\n=== Loading State ===');
  console.log(JSON.stringify(loadingCheck, null, 2));
  
  // Take screenshot
  console.log('\nTaking screenshot...');
  await page.screenshot({ 
    path: 'our-site-screenshot.png', 
    fullPage: true 
  });
  
  // Count visible cards (rough estimate by looking for elements or canvas rendering)
  const cardCount = await page.evaluate(() => {
    // This is a rough check - we can't directly count WebGL-rendered cards
    // But we can check the container structure
    const container = document.querySelector('.infinite-grid-container');
    return {
      containerExists: container !== null,
      containerRect: container ? container.getBoundingClientRect() : null,
    };
  });
  
  console.log('\n=== Container Info ===');
  console.log(JSON.stringify(cardCount, null, 2));
  
  // Check for any visual issues
  const visualIssues = await page.evaluate(() => {
    const issues: string[] = [];
    
    // Check if canvas is blank/black
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, Math.min(canvas.width, 100), Math.min(canvas.height, 100));
        const pixels = imageData.data;
        let allBlack = true;
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i] > 10 || pixels[i + 1] > 10 || pixels[i + 2] > 10) {
            allBlack = false;
            break;
          }
        }
        if (allBlack) {
          issues.push('Canvas appears to be all black (may be rendering issue)');
        }
      }
    }
    
    // Check for overflow issues
    const body = document.body;
    const html = document.documentElement;
    if (body.scrollWidth > window.innerWidth || body.scrollHeight > window.innerHeight) {
      issues.push('Page has overflow (unexpected scrollbars)');
    }
    
    return issues;
  });
  
  console.log('\n=== Visual Issues ===');
  if (visualIssues.length > 0) {
    console.log('⚠️  Issues found:');
    visualIssues.forEach(issue => console.log(`   - ${issue}`));
  } else {
    console.log('✅ No obvious visual issues detected');
  }
  
  if (consoleErrors.length > 0) {
    console.log('\n=== Console Errors ===');
    consoleErrors.forEach(err => console.log(`   ❌ ${err}`));
  } else {
    console.log('\n✅ No console errors detected');
  }
  
  console.log('\n✅ Inspection complete!');
  console.log('📸 Screenshot saved as: our-site-screenshot.png');
  console.log('\nBrowser will stay open for 30 seconds for manual inspection...');
  
  await page.waitForTimeout(30000);
  
  await browser.close();
}

inspectOurSite().catch(console.error);

