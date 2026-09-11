const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Find the motivation music component
  const hasMusic = await page.evaluate(() => {
    return document.body.innerHTML.includes('Motivation Audio');
  });
  
  console.log('Motivation Music component found:', hasMusic);
  
  await browser.close();
})();
