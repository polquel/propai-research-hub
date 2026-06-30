// Aggregated statistics for the charts dashboard.
// All queries run directly on SQLite for speed — no ORM needed for read-only aggregations.

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const router = express.Router();
// This project uses the better-sqlite3 driver adapter — required for this SQLite setup
const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

// GET /api/stats — returns all chart data in one request
router.get('/', async (req, res) => {
  try {
    // Run all aggregations in parallel for speed
    const [
      ratingDistribution,
      topCities,
      companyTypes,
      reviewBuckets,
      avgRatingByCity,
      totals,
    ] = await Promise.all([

      // 1. How many companies have each star rating (rounded to nearest integer)
      prisma.$queryRaw`
        SELECT ROUND(rating, 0) AS star, COUNT(*) AS count
        FROM Company
        WHERE rating IS NOT NULL
        GROUP BY ROUND(rating, 0)
        ORDER BY star ASC
      `,

      // 2. Top 10 cities by company count
      prisma.$queryRaw`
        SELECT city, COUNT(*) AS count
        FROM Company
        WHERE city IS NOT NULL AND city != ''
        GROUP BY city
        ORDER BY count DESC
        LIMIT 10
      `,

      // 3. Company type breakdown (property_manager / real_estate / admin_agency)
      prisma.$queryRaw`
        SELECT
          CASE WHEN companyType IS NULL THEN 'unknown' ELSE companyType END AS type,
          COUNT(*) AS count
        FROM Company
        GROUP BY companyType
        ORDER BY count DESC
      `,

      // 4. Review count buckets — how engaged are customers?
      prisma.$queryRaw`
        SELECT
          CASE
            WHEN reviewCount = 0    THEN '0'
            WHEN reviewCount <= 10  THEN '1-10'
            WHEN reviewCount <= 50  THEN '11-50'
            WHEN reviewCount <= 200 THEN '51-200'
            ELSE '200+'
          END AS bucket,
          COUNT(*) AS count
        FROM Company
        WHERE reviewCount IS NOT NULL
        GROUP BY bucket
        ORDER BY MIN(reviewCount) ASC
      `,

      // 5. Average rating per city (only cities with at least 5 companies)
      prisma.$queryRaw`
        SELECT city, ROUND(AVG(rating), 2) AS avgRating, COUNT(*) AS count
        FROM Company
        WHERE city IS NOT NULL AND rating IS NOT NULL
        GROUP BY city
        HAVING COUNT(*) >= 5
        ORDER BY avgRating DESC
        LIMIT 10
      `,

      // 6. Overall totals for the summary header
      prisma.$queryRaw`
        SELECT
          COUNT(*) AS totalCompanies,
          ROUND(AVG(rating), 2) AS avgRating,
          SUM(reviewCount) AS totalReviews
        FROM Company
        WHERE rating IS NOT NULL
      `,
    ]);

    // Prisma raw query returns BigInt for COUNT — convert to plain numbers
    function normalize(rows) {
      return rows.map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([k, v]) => [k, typeof v === 'bigint' ? Number(v) : v])
        )
      );
    }

    res.json({
      ratingDistribution: normalize(ratingDistribution),
      topCities:          normalize(topCities),
      companyTypes:       normalize(companyTypes),
      reviewBuckets:      normalize(reviewBuckets),
      avgRatingByCity:    normalize(avgRatingByCity),
      totals:             normalize(totals)[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

// GET /api/stats/market-map
// Returns a city × company-type matrix with counts, avg ratings, and company lists.
// Used to render the market landscape grid in the frontend.
router.get('/market-map', async (req, res) => {
  try {
    // Find the top 10 cities by total company count
    const topCityRows = await prisma.$queryRaw`
      SELECT city, COUNT(*) as count
      FROM Company
      WHERE city IS NOT NULL AND city != ''
      GROUP BY city
      ORDER BY count DESC
      LIMIT 10
    `;
    const topCities = topCityRows.map((r) => r.city);

    // Aggregate count + avg rating per city × type combination
    const matrixRows = await prisma.$queryRaw`
      SELECT city, companyType, COUNT(*) as count, ROUND(AVG(rating), 1) as avgRating
      FROM Company
      WHERE city IN (
        SELECT city FROM Company WHERE city IS NOT NULL GROUP BY city ORDER BY COUNT(*) DESC LIMIT 10
      )
      AND companyType IS NOT NULL
      GROUP BY city, companyType
    `;

    // Fetch all companies in those top cities (for the click-to-expand list)
    const companies = await prisma.company.findMany({
      where: { city: { in: topCities }, companyType: { not: null } },
      select: { id: true, name: true, city: true, companyType: true, rating: true, website: true },
      orderBy: { rating: 'asc' },
    });

    // Build a lookup: "city|type" → { count, avgRating, companies[] }
    const cells = {};
    for (const row of matrixRows) {
      const key = `${row.city}|${row.companyType}`;
      cells[key] = {
        count: Number(row.count),
        avgRating: row.avgRating,
        companies: [],
      };
    }
    for (const c of companies) {
      const key = `${c.city}|${c.companyType}`;
      if (cells[key]) cells[key].companies.push(c);
    }

    res.json({
      cities: topCities,                                             // ordered list of city names
      types: ['property_manager', 'real_estate', 'admin_agency'],   // fixed row order
      cells,
    });
  } catch (error) {
    console.error('market-map error:', error);
    res.status(500).json({ error: 'Failed to load market map', detail: error.message });
  }
});

// GET /api/stats/pain-points
// Scans all scraped review texts for recurring complaint patterns.
// Each "theme" is a named category with a list of trigger keywords.
// Returns: [{ theme, count, companies, examples }] sorted by count desc.
router.get('/pain-points', async (req, res) => {
  try {
    const rows = await prisma.company.findMany({
      where: { reviews: { not: null } },
      select: { id: true, name: true, city: true, rating: true, reviews: true },
    });

    // Each theme defines what complaint it represents and which keywords signal it.
    // Keywords match against lowercased review text (English — reviews were scraped in English).
    const THEMES = [
      {
        theme: 'No response / Unreachable',
        description: 'They don\'t pick up the phone or reply to messages',
        keywords: [
          'no answer', 'don\'t answer', 'don\'t respond', 'won\'t respond',
          'never respond', 'calling every day', 'can\'t reach', 'impossible to contact',
          'never picks up', 'nobody answers', 'not responding', 'silence',
          'they disappeared', 'no response', 'unreachable', 'contact number',
          'ignor', 'no devuelven', 'no responden', 'no contestan',
        ],
      },
      {
        theme: 'Financial opacity / Billing problems',
        description: 'Unclear fees, wrong invoices, unexplained charges',
        keywords: [
          'opaque', 'no transparency', 'not transparent', 'no information about',
          'accounts', 'special assessment', 'wrong bill', 'incorrect invoice',
          'exorbitant', 'hidden fee', 'unjustified', 'without explanation',
          'no receipt', 'no breakdown', 'overcharg', 'billing', 'invoice',
          'derrama', 'sin explicacion', 'facturas',
        ],
      },
      {
        theme: 'Only collect fees, ignore problems',
        description: 'Quick to bill but absent when residents need help',
        keywords: [
          'only respond when', 'collect payment', 'collect their pay',
          'when there are problems', 'silence when', 'money but no service',
          'just want money', 'only care about money', 'collect fees',
          'don\'t forget to collect', 'but when problems', 'start off strong',
          'gradually disappear', 'cobran pero',
        ],
      },
      {
        theme: 'Maintenance ignored / Repairs neglected',
        description: 'Breakdowns and repairs left unresolved for months',
        keywords: [
          'water leak', 'leak', 'repair', 'maintenance', 'broken', 'fix',
          'not fixed', 'never fix', 'no repair', 'damage', 'defect',
          'won\'t fix', 'avería', 'gotera', 'reparacion', 'mantenimiento',
        ],
      },
      {
        theme: 'Rude or aggressive staff',
        description: 'Staff yell, hang up, or treat residents with contempt',
        keywords: [
          'yell', 'hang up', 'rude', 'aggressive', 'disrespectful',
          'insulting', 'humiliating', 'treat us badly', 'bad treatment',
          'unprofessional', 'disdainful', 'contempt', 'maleducado',
          'malas formas', 'faltar al respeto',
        ],
      },
      {
        theme: 'Missed meetings / No minutes',
        description: 'Skipping owner assemblies or not documenting decisions',
        keywords: [
          'meeting', 'assembly', 'minutes', 'don\'t show up', 'doesn\'t show',
          'never comes', 'no meeting', 'no assembly', 'acta', 'reunion',
          'junta de propietarios', 'asamblea',
        ],
      },
      {
        theme: 'Cronyism / Sides with landlord not residents',
        description: 'Protects building owners\' interests over the community',
        keywords: [
          'cronyism', 'own interests', 'side with', 'always help the',
          'favors the owner', 'not neutral', 'bias', 'corrupt',
          'enchufismo', 'amiguismo', 'intereses propios',
        ],
      },
      {
        theme: 'Incompetence / Negligence',
        description: 'Mistakes, wrong decisions, general lack of competence',
        keywords: [
          'incompetent', 'clueless', 'negligent', 'careless', 'disgrace',
          'appalling', 'terrible', 'useless', 'worthless', 'disaster',
          'shambles', 'inadequate', 'horrible', 'dreadful',
          'incompetente', 'negligencia', 'desastre', 'vergonzoso',
        ],
      },
    ];

    // For each theme, scan every review and collect matching results
    const results = THEMES.map(({ theme, description, keywords }) => {
      const matchingCompanies = [];
      const examples = [];

      for (const company of rows) {
        const reviewList = JSON.parse(company.reviews || '[]');
        const companyMatches = [];

        for (const reviewText of reviewList) {
          const lower = reviewText.toLowerCase();
          const hit = keywords.some((kw) => lower.includes(kw.toLowerCase()));
          if (hit) {
            companyMatches.push(reviewText);
          }
        }

        if (companyMatches.length > 0) {
          matchingCompanies.push({
            name: company.name,
            city: company.city,
            rating: company.rating,
          });
          // Collect up to 3 example reviews total across all companies
          if (examples.length < 3) {
            examples.push({
              company: company.name,
              city: company.city,
              text: companyMatches[0].slice(0, 200),
            });
          }
        }
      }

      return {
        theme,
        description,
        count: matchingCompanies.length,   // number of *companies* (not reviews) with this complaint
        companies: matchingCompanies,
        examples,
      };
    });

    // Sort: most widespread complaint first
    results.sort((a, b) => b.count - a.count);

    res.json(results);
  } catch (error) {
    console.error('pain-points error:', error);
    res.status(500).json({ error: 'Failed to analyze pain points', detail: error.message });
  }
});

module.exports = router;
