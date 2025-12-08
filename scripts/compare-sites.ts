import { chromium } from 'playwright';
import fs from 'fs';

async function compareSites() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  // First, inspect our site
  console.log('\n=== Inspecting Our Site ===');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(6000); // Wait longer for grid to fully initialize
  
  const ourSiteInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return { error: 'No canvas' };
    
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return { error: 'No WebGL' };
    
    const container = document.querySelector('.infinite-grid-container');
    
    return {
      canvas: {
        width: canvas.width,
        height: canvas.height,
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight,
        style: {
          position: window.getComputedStyle(canvas).position,
          display: window.getComputedStyle(canvas).display,
        },
      },
      container: {
        exists: container !== null,
        styles: container ? {
          position: window.getComputedStyle(container).position,
          width: window.getComputedStyle(container).width,
          height: window.getComputedStyle(container).height,
          overflow: window.getComputedStyle(container).overflow,
        } : null,
      },
      webgl: {
        drawingBufferWidth: gl.drawingBufferWidth,
        drawingBufferHeight: gl.drawingBufferHeight,
        dpr: window.devicePixelRatio,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      hasLoadingText: !!Array.from(document.querySelectorAll('*'))
        .find(el => el.textContent?.includes('Loading grid')),
    };
  });
  
  console.log(JSON.stringify(ourSiteInfo, null, 2));
  await page.screenshot({ path: 'comparison-our-site.png', fullPage: true });
  
  // Then inspect phantom.land
  console.log('\n=== Inspecting Phantom.land ===');
  await page.goto('https://phantom.land', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  const phantomInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return { error: 'No canvas' };
    
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return { error: 'No WebGL' };
    
    const container = document.querySelector('#work-grid');
    
    return {
      canvas: {
        width: canvas.width,
        height: canvas.height,
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight,
        style: {
          position: window.getComputedStyle(canvas).position,
          display: window.getComputedStyle(canvas).display,
        },
      },
      container: {
        exists: container !== null,
        id: container?.id,
        styles: container ? {
          position: window.getComputedStyle(container).position,
          width: window.getComputedStyle(container).width,
          height: window.getComputedStyle(container).height,
          overflow: window.getComputedStyle(container).overflow,
        } : null,
      },
      webgl: {
        drawingBufferWidth: gl.drawingBufferWidth,
        drawingBufferHeight: gl.drawingBufferHeight,
        dpr: window.devicePixelRatio,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  });
  
  console.log(JSON.stringify(phantomInfo, null, 2));
  await page.screenshot({ path: 'comparison-phantom-land.png', fullPage: true });
  
  // Compare key metrics
  console.log('\n=== Comparison Summary ===');
  console.log('\nCanvas Dimensions:');
  console.log(`  Our site:     ${ourSiteInfo.canvas?.width}x${ourSiteInfo.canvas?.height}`);
  console.log(`  Phantom.land: ${phantomInfo.canvas?.width}x${phantomInfo.canvas?.height}`);
  
  console.log('\nCanvas Position:');
  console.log(`  Our site:     ${ourSiteInfo.canvas?.style.position}`);
  console.log(`  Phantom.land: ${phantomInfo.canvas?.style.position}`);
  
  console.log('\nContainer:');
  console.log(`  Our site:     ${ourSiteInfo.container?.exists ? 'exists' : 'missing'}`);
  console.log(`  Phantom.land: ${phantomInfo.container?.exists ? 'exists' : 'missing'} (id: ${phantomInfo.container?.id})`);
  
  console.log('\nContainer Position:');
  console.log(`  Our site:     ${ourSiteInfo.container?.styles?.position}`);
  console.log(`  Phantom.land: ${phantomInfo.container?.styles?.position}`);
  
  // Identify differences
  const differences: string[] = [];
  
  if (ourSiteInfo.canvas?.style.position !== phantomInfo.canvas?.style.position) {
    differences.push(`Canvas position differs: ours="${ourSiteInfo.canvas?.style.position}", theirs="${phantomInfo.canvas?.style.position}"`);
  }
  
  if (ourSiteInfo.container?.styles?.position !== phantomInfo.container?.styles?.position) {
    differences.push(`Container position differs: ours="${ourSiteInfo.container?.styles?.position}", theirs="${phantomInfo.container?.styles?.position}"`);
  }
  
  if (ourSiteInfo.hasLoadingText) {
    differences.push('Loading text is still visible (should be hidden after initialization)');
  }
  
  console.log('\n=== Differences Found ===');
  if (differences.length > 0) {
    differences.forEach(diff => console.log(`  ⚠️  ${diff}`));
  } else {
    console.log('  ✅ No major structural differences found');
  }
  
  console.log('\n✅ Comparison complete!');
  console.log('📸 Screenshots saved:');
  console.log('   - comparison-our-site.png');
  console.log('   - comparison-phantom-land.png');
  
  await page.waitForTimeout(15000);
  
  await browser.close();
}

compareSites().catch(console.error);
