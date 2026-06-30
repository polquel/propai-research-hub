// This script automatically fills the database with property management companies.
// It opens a real browser (Puppeteer), searches Google Maps, and saves results.
// Run it once from the backend/ folder: node scripts/seedCompanies.js

require('dotenv').config();
const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

// What to search for and where
const SEARCHES = [
  { query: 'administrador de fincas',              type: 'property_manager', country: 'Spain' },
  { query: 'gestor comunidades de propietarios',   type: 'property_manager', country: 'Spain' },
  { query: 'administracion fincas',                type: 'admin_agency',     country: 'Spain' },
  { query: 'agencia inmobiliaria alquiler',         type: 'real_estate',      country: 'Spain' },
];

const CITIES = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla',
  'Zaragoza', 'Málaga', 'Bilbao', 'Alicante',
  'Murcia', 'Palma de Mallorca',
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Accept Google's cookie consent banner if it appears
async function acceptCookies(page) {
  try {
    await page.waitForSelector('button', { timeout: 3000 });
    const buttons = await page.$$('button');
    for (const button of buttons) {
      const text = await page.evaluate((el) => el.textContent.trim(), button);
      if (/accept|aceptar|agree|acepto/i.test(text)) {
        await button.click();
        await wait(1500);
        return;
      }
    }
  } catch {}
}

// Scroll the results sidebar to load more companies
async function scrollResults(page) {
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => {
      const feed = document.querySelector('[role="feed"]');
      if (feed) feed.scrollBy(0, 400);
    });
    await wait(700);
  }
}

// Extract all company cards from the Google Maps sidebar
async function extractCompanies(page) {
  return page.evaluate(() => {
    const results = [];
    const feed = document.querySelector('[role="feed"]');
    if (!feed) return results;

    const articles = feed.querySelectorAll('[role="article"]');

    articles.forEach((article) => {
      // Name — Google Maps puts it in an aria-label on each card
      const nameEl = article.querySelector('[aria-label]');
      const name = nameEl?.getAttribute('aria-label')?.trim();
      if (!name || name.length < 2) return;

      // Rating number (e.g. "4,2")
      const ratingEl = article.querySelector('.MW4etd');
      const rating = ratingEl
        ? parseFloat(ratingEl.textContent.replace(',', '.'))
        : null;

      // Review count (e.g. "(124)")
      const reviewEl = article.querySelector('.UY7F9');
      const reviewRaw = reviewEl?.textContent?.replace(/[().\s]/g, '').replace(/\./g, '');
      const reviewCount = reviewRaw ? parseInt(reviewRaw) : null;

      // Category / service type shown under the name
      const categoryEls = article.querySelectorAll('.W4Efsd');
      const services = categoryEls[0]?.textContent?.trim() || null;

      // Address line
      const address = categoryEls[1]?.textContent?.trim() || null;

      results.push({ name, rating, reviewCount, services, address });
    });

    return results;
  });
}

// Get review texts by clicking into a company card
async function extractReviews(page, companyName) {
  try {
    // Find and click the company's card
    const cards = await page.$$('[role="article"]');
    for (const card of cards) {
      const label = await page.evaluate(
        (el) => el.querySelector('[aria-label]')?.getAttribute('aria-label'),
        card
      );
      if (label?.trim() === companyName) {
        await card.click();
        await wait(2500);
        break;
      }
    }

    // Wait for the detail panel to open
    await page.waitForSelector('[data-review-id], .wiI7pd', { timeout: 5000 });

    // Extract up to 5 review texts
    const reviews = await page.evaluate(() => {
      const reviewEls = document.querySelectorAll('.wiI7pd');
      return Array.from(reviewEls)
        .slice(0, 5)
        .map((el) => el.textContent.trim())
        .filter((text) => text.length > 10);
    });

    // Go back to the results list
    const backBtn = await page.$('[aria-label="Back"]');
    if (backBtn) {
      await backBtn.click();
      await wait(1500);
    }

    return reviews;
  } catch {
    return [];
  }
}

async function runSearch(browser, searchQuery, city, companyType, country) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const url = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery + ' ' + city)}?hl=en`;
  console.log(`  Searching "${searchQuery}" in ${city}...`);

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await acceptCookies(page);
  await wait(2000);

  // Check we got a results feed (sometimes Google shows a single result instead)
  const hasFeed = await page.$('[role="feed"]');
  if (!hasFeed) {
    console.log(`    No results list found — skipping`);
    await page.close();
    return;
  }

  await scrollResults(page);
  const companies = await extractCompanies(page);
  console.log(`    Found ${companies.length} companies`);

  let saved = 0;
  for (const company of companies) {
    if (!company.name) continue;

    // Skip if already in the database (by name + city combination)
    const existing = await prisma.company.findFirst({
      where: { name: company.name, city },
    });
    if (existing) continue;

    // Get reviews for companies with low ratings (most useful for pain points)
    let reviews = [];
    if (company.rating && company.rating < 3.5) {
      reviews = await extractReviews(page, company.name);
    }

    await prisma.company.create({
      data: {
        name: company.name,
        city,
        country,
        address: company.address,
        services: company.services,
        companyType,
        rating: company.rating,
        reviewCount: company.reviewCount,
        reviews: reviews.length > 0 ? JSON.stringify(reviews) : null,
      },
    });
    saved++;
    console.log(
      `    ✓ ${company.name} — ${company.rating ?? '?'}⭐ (${company.reviewCount ?? 0} reviews)`
    );
  }

  console.log(`    Saved ${saved} new companies\n`);
  await page.close();
}

async function main() {
  console.log('Starting company data collection...');
  console.log(`Searching ${SEARCHES.length} types × ${CITIES.length} cities\n`);

  const browser = await puppeteer.launch({
    headless: false,   // Show the browser window so you can watch it work
    args: ['--lang=en-US,en', '--no-sandbox'],
    defaultViewport: null,
  });

  let total = 0;
  const before = await prisma.company.count();

  for (const search of SEARCHES) {
    for (const city of CITIES) {
      await runSearch(browser, search.query, city, search.type, search.country);
      // Random pause between searches to avoid being blocked
      await wait(2000 + Math.random() * 2000);
    }
  }

  const after = await prisma.company.count();
  total = after - before;

  await browser.close();
  await prisma.$disconnect();

  console.log(`\nDone! Added ${total} new companies to the database.`);
  console.log(`Total in DB: ${after} companies`);
}

main().catch((err) => {
  console.error('Script failed:', err.message);
  process.exit(1);
});
