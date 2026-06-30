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

module.exports = router;
