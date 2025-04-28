const puppeteer = require('puppeteer');
const fs = require('fs');

// ✅ روابط المنتجات (ضع روابط الصفحات التي تحتوي منتجات)
// على سبيل المثال:
const urls = [
  'https://www.aliExpress.com/category/100003109/women-clothing.html',
  'https://www.aliExpress.com/category/100003070/mens-clothing.html',
  'https://www.aliExpress.com/category/200003482/mens-shoes.html',
  'https://www.aliExpress.com/category/100003109/women-tops.html',
  'https://www.aliExpress.com/category/200003482/women-shoes.html',
  'https://www.aliExpress.com/category/100003105/bags-shoes.html',
  'https://www.aliExpress.com/category/100003124/accessories.html',
  'https://www.aliExpress.com/category/100003140/watches.html',
  'https://www.aliExpress.com/category/200003482/sports-clothing.html'
];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
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

      console.log(`🟢 Found ${items.length} items`);
      all.push(...items);

      const btn = await page.$('button[aria-label="Next Page"]');
      if (btn) {
        await btn.click();
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
      } else {
        next = false;
      }
    }

    await page.close();
  }

  await browser.close();
  fs.writeFileSync('products.json', JSON.stringify(all, null, 2));
  console.log(`✅ Total scraped: ${all.length} products`);
})();
