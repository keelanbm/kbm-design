import { chromium } from 'playwright';

async function testNavigationBlur() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  console.log('Step 1: Loading homepage...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  // Wait for grid to initialize
  console.log('Waiting for grid to initialize...');
  await page.waitForTimeout(7000);
  
  // Check initial state
  const initialState = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { error: 'No canvas' };
    
    // Check for loading overlay
    const loadingElements = Array.from(document.querySelectorAll('*'))
      .filter(el => el.textContent?.includes('Loading grid'));
    
    return {
      canvasVisible: canvas ? true : false,
      loadingOverlayVisible: loadingElements.length > 0,
      loadingElements: loadingElements.map(el => ({
        visible: window.getComputedStyle(el).display !== 'none',
        opacity: window.getComputedStyle(el).opacity,
      })),
    };
  });
  
  console.log('\n=== Initial State ===');
  console.log(JSON.stringify(initialState, null, 2));
  
  // Take screenshot of initial state
  await page.screenshot({ path: 'test-1-initial.png', fullPage: true });
  
  console.log('\nStep 2: Clicking on a tile...');
  
  // Try to click on the canvas (simulating a tile click)
  // We'll click in the center area where tiles should be
  await page.mouse.click(960, 540);
  await page.waitForTimeout(2000);
  
  // Check if navigation happened
  const afterClick = await page.evaluate(() => {
    return {
      url: window.location.href,
      pathname: window.location.pathname,
    };
  });
  
  console.log('After click:', JSON.stringify(afterClick, null, 2));
  
  // If we navigated to a project page, wait a bit then go back
  if (afterClick.pathname !== '/') {
    console.log('\nStep 3: On project page, waiting 2 seconds...');
    await page.waitForTimeout(2000);
    
    console.log('Step 4: Navigating back to homepage...');
    await page.goBack({ waitUntil: 'networkidle' });
    
    console.log('Waiting for grid to reinitialize...');
    await page.waitForTimeout(7000);
    
    // Check state after returning
    const afterReturn = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return { error: 'No canvas' };
      
      // Check for loading overlay
      const loadingElements = Array.from(document.querySelectorAll('*'))
        .filter(el => el.textContent?.includes('Loading grid'));
      
      // Check WebGL context
      const gl = (canvas as HTMLCanvasElement).getContext('webgl2') || 
                 (canvas as HTMLCanvasElement).getContext('webgl');
      
      return {
        url: window.location.href,
        canvasVisible: canvas ? true : false,
        loadingOverlayVisible: loadingElements.length > 0,
        loadingElements: loadingElements.map(el => ({
          visible: window.getComputedStyle(el).display !== 'none',
          opacity: window.getComputedStyle(el).opacity,
        })),
        webglActive: gl ? true : false,
      };
    });
    
    console.log('\n=== State After Returning ===');
    console.log(JSON.stringify(afterReturn, null, 2));
    
    // Take screenshot after returning
    await page.screenshot({ path: 'test-2-after-return.png', fullPage: true });
    
    // Check console for any errors
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(`[ERROR] ${msg.text()}`);
      }
    });
    
    await page.waitForTimeout(2000);
    
    if (consoleMessages.length > 0) {
      console.log('\n=== Console Errors ===');
      consoleMessages.forEach(msg => console.log(msg));
    }
    
    // Try to detect blur by checking if post-processing is active
    const postProcessInfo = await page.evaluate(() => {
      // This is tricky - we can't directly access the shader state
      // But we can check if the canvas is rendering
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) return null;
      
      // Check if canvas has content (not just black)
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;
      
      // Sample a few pixels from the center
      const imageData = ctx.getImageData(
        canvas.width / 2 - 50, 
        canvas.height / 2 - 50, 
        100, 
        100
      );
      const pixels = imageData.data;
      
      // Check if pixels are mostly black (might indicate blur/rendering issue)
      let nonBlackPixels = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        if (r > 10 || g > 10 || b > 10) {
          nonBlackPixels++;
        }
      }
      
      return {
        totalPixels: pixels.length / 4,
        nonBlackPixels,
        percentageNonBlack: ((nonBlackPixels / (pixels.length / 4)) * 100).toFixed(2),
      };
    });
    
    console.log('\n=== Canvas Content Check ===');
    console.log(JSON.stringify(postProcessInfo, null, 2));
    
  } else {
    console.log('Navigation did not occur - tiles might not be clickable or no projects available');
  }
  
  console.log('\n✅ Test complete!');
  console.log('📸 Screenshots saved:');
  console.log('   - test-1-initial.png');
  console.log('   - test-2-after-return.png');
  console.log('\nBrowser will stay open for 30 seconds for manual inspection...');
  
  await page.waitForTimeout(30000);
  
  await browser.close();
}

testNavigationBlur().catch(console.error);

