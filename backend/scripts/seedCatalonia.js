// Focused seed script for Catalonia — your target market.
// Searches in both Spanish and Catalan to maximize coverage.
// Run from backend/ folder: node scripts/seedCatalonia.js

require('dotenv').config();
const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

// All relevant Catalan cities — from large to small
const CITIES = [
  // Major cities
  'Barcelona',
  "L'Hospitalet de Llobregat",
  'Badalona',
  'Terrassa',
  'Sabadell',
  'Lleida',
  'Tarragona',
  'Mataró',
  'Santa Coloma de Gramenet',
  'Reus',
  'Girona',
  'Cornellà de Llobregat',
  'Sant Cugat del Vallès',
  'Rubí',
  'Manresa',
  'Viladecans',
  'El Prat de Llobregat',
  'Granollers',
  'Mollet del Vallès',
  'Gavà',
  'Castelldefels',
  'Vilanova i la Geltrú',
  'Cerdanyola del Vallès',
  'Vic',
  'Sitges',
  'Igualada',
  'Olot',
  'Figueres',
  'Blanes',
  'Lloret de Mar',
];

// Search in both languages — many Catalan firms only appear under one
const SEARCHES = [
  // Spanish terms
  { query: 'administrador de fincas',            type: 'property_manager' },
  { query: 'administracion comunidades vecinos',  type: 'property_manager' },
  { query: 'gestor comunidades propietarios',     type: 'property_manager' },
  { query: 'agencia inmobiliaria alquiler',       type: 'real_estate'      },
  // Catalan terms
  { query: 'administrador de finques',            type: 'property_manager' },
  { query: 'gestió comunitats propietaris',       type: 'property_manager' },
  { query: 'agència immobiliària lloguer',        type: 'real_estate'      },
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

async function scrollResults(page) {
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => {
      const feed = document.querySelector('[role="feed"]');
      if (feed) feed.scrollBy(0, 400);
    });
    await wait(700);
  }
}

async function extractCompanies(page) {
  return page.evaluate(() => {
    const results = [];
    const feed = document.querySelector('[role="feed"]');
    if (!feed) return results;

    feed.querySelectorAll('[role="article"]').forEach((article) => {
      const nameEl = article.querySelector('[aria-label]');
      const name = nameEl?.getAttribute('aria-label')?.trim();
      if (!name || name.length < 2) return;

      const ratingEl = article.querySelector('.MW4etd');
      const rating = ratingEl
        ? parseFloat(ratingEl.textContent.replace(',', '.'))
        : null;

      const reviewEl = article.querySelector('.UY7F9');
      const reviewRaw = reviewEl?.textContent?.replace(/[().\s]/g, '').replace(/\./g, '');
      const reviewCount = reviewRaw ? parseInt(reviewRaw) : null;

      const categoryEls = article.querySelectorAll('.W4Efsd');
      const services = categoryEls[0]?.textContent?.trim() || null;
      const address   = categoryEls[1]?.textContent?.trim() || null;

      results.push({ name, rating, reviewCount, services, address });
    });

    return results;
  });
}

async function extractReviews(page, companyName) {
  try {
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

    await page.waitForSelector('.wiI7pd', { timeout: 5000 });

    const reviews = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.wiI7pd'))
        .slice(0, 5)
        .map((el) => el.textContent.trim())
        .filter((t) => t.length > 10)
    );

    const backBtn = await page.$('[aria-label="Back"]');
    if (backBtn) { await backBtn.click(); await wait(1500); }

    return reviews;
  } catch {
    return [];
  }
}

async function runSearch(browser, searchQuery, city, companyType) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const url = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery + ' ' + city)}?hl=en`;
  console.log(`  "${searchQuery}" · ${city}`);

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await acceptCookies(page);
    await wait(2000);

    const hasFeed = await page.$('[role="feed"]');
    if (!hasFeed) {
      console.log(`    — no results`);
      await page.close();
      return 0;
    }

    await scrollResults(page);
    const companies = await extractCompanies(page);

    let saved = 0;
    for (const company of companies) {
      if (!company.name) continue;

      // Skip duplicates (same name already in DB for this city)
      const existing = await prisma.company.findFirst({
        where: { name: company.name, city },
      });
      if (existing) continue;

      // Collect reviews for poorly-rated companies — most useful for pain points
      let reviews = [];
      if (company.rating !== null && company.rating < 3.5) {
        reviews = await extractReviews(page, company.name);
      }

      await prisma.company.create({
        data: {
          name: company.name,
          city,
          country: 'Spain',
          address: company.address,
          services: company.services,
          companyType,
          rating: company.rating,
          reviewCount: company.reviewCount,
          reviews: reviews.length > 0 ? JSON.stringify(reviews) : null,
        },
      });
      saved++;
      console.log(`    ✓ ${company.name} — ${company.rating ?? '?'}⭐ (${company.reviewCount ?? 0} reviews)`);
    }

    console.log(`    → ${saved} new saved\n`);
    await page.close();
    return saved;
  } catch (err) {
    console.log(`    Error: ${err.message}`);
    await page.close();
    return 0;
  }
}

async function main() {
  const before = await prisma.company.count();
  console.log(`Starting Catalonia deep scan — ${SEARCHES.length} search types × ${CITIES.length} cities`);
  console.log(`Current DB: ${before} companies\n`);

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--lang=en-US,en', '--no-sandbox'],
    defaultViewport: null,
  });

  for (const search of SEARCHES) {
    console.log(`\n── ${search.query.toUpperCase()} ──`);
    for (const city of CITIES) {
      await runSearch(browser, search.query, city, search.type);
      await wait(1500 + Math.random() * 1500);
    }
  }

  await browser.close();
  await prisma.$disconnect();

  const after = await prisma.company.count();
  console.log(`\nDone!`);
  console.log(`Added: ${after - before} new companies`);
  console.log(`Total in DB: ${after} companies`);
}

main().catch((err) => {
  console.error('Script failed:', err.message);
  process.exit(1);
});
