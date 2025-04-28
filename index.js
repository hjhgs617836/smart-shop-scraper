const puppeteer = require('puppeteer');
const fs = require('fs');

const urls = [
  /* هنا روابطك التسعة */
];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox']
  });
  const all = [];

  for (const url of urls) {
    const page = await browser.newPage();
    console.log(`🔵 Visiting ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    let next = true;
    while (next) {
      await page.waitForTimeout(2000);
      const items = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.product-snippet_ProductSnippet__content__Lf7vK')).map(el => ({
          name: el.querySelector('h1,h2,h3,h4,h5,h6')?.innerText.trim() || '',
          price: el.querySelector('.multi--price-sale--U-S0jtj')?.innerText.trim() || '',
          image: el.querySelector('img')?.src || ''
        }));
      });
      console.log(`🟢 Got ${items.length}`);
      all.push(...items);

      const btn = await page.$('button[aria-label="Next Page"]');
      if (btn) {
        await btn.click();
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
      } else next = false;
    }
    await page.close();
  }

  await browser.close();
  fs.writeFileSync('products.json', JSON.stringify(all, null, 2));
  console.log(`✅ Total ${all.length} products.`);
})();
