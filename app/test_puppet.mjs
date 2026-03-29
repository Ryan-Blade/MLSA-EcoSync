import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({headless: 'new'});
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/map', {waitUntil: 'networkidle0'});
  
  // Wait a bit and search
  await new Promise(r => setTimeout(r, 2000));
  await page.type('input[placeholder="e.g., 400001"]', '400001');
  await page.click('button.bg-emerald-600'); // Go button is probably this, or text/Go
  
  // Quick specific click on Go
  await page.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('button'));
     const goBtn = btns.find(b => b.textContent && b.textContent.includes('Go'));
     if (goBtn) goBtn.click();
  });
  
  // Wait 8s for map
  await new Promise(r => setTimeout(r, 8000));
  
  // Click Start Simulation
  await page.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('button'));
     const startBtn = btns.find(b => b.textContent && b.textContent.includes('Start Simulation'));
     if (startBtn) startBtn.click();
  });
  
  // Wait for Dashboard
  await new Promise(r => setTimeout(r, 5000));
  
  // Extract state
  const data = await page.evaluate(() => {
     return {
         path: window.location.pathname,
         buildingsLength: window.history.state.usr?.buildings?.length,
         firstBuildingType: window.history.state.usr?.buildings?.[0]?.geometry?.type,
         firstBuildingCoords: window.history.state.usr?.buildings?.[0]?.geometry?.coordinates
     };
  });
  
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
