// Charts dashboard — visual summary of all company data in the database.
// Uses Recharts: a library that turns data arrays into React chart components.

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getStats } from '../services/api';

// Purple palette — consistent with the app accent color
const PURPLE = 'var(--accent)';
const PURPLE_LIGHT = 'var(--accent-bg)';

// Colors for the pie/donut chart slices
const PIE_COLORS = ['#aa3bff', '#7c3aed', '#a855f7', '#c084fc', '#e9d5ff'];

// Human-readable labels for the company type codes stored in the database
const TYPE_NAMES = {
  property_manager: 'Property Manager',
  real_estate:      'Real Estate',
  admin_agency:     'Admin Agency',
  unknown:          'Unknown',
};

// Custom tooltip that appears when you hover over a bar or slice
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-md text-sm">
      {label && <p className="font-medium text-gray-700 mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-gray-600">
          {entry.name}: <span className="font-semibold text-[var(--accent)]">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// Wrapper card for each individual chart
function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white border border-gray-200 border-l-4 border-l-[var(--accent)] rounded-xl p-6 shadow-sm">
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5 mb-5">{subtitle}</p>}
      {!subtitle && <div className="mb-5" />}
      {children}
    </div>
  );
}

// The three summary numbers shown at the top of the page
function StatBadge({ label, value }) {
  return (
    <div className="flex-1 bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded-xl p-4 text-center">
      <p className="text-2xl font-bold text-[var(--accent)]">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export default function Charts() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => setError('Could not load stats'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 text-sm text-center py-12">{error}</p>;
  }

  // Map raw DB rows to the shape Recharts expects: [{ name, value }]
  const ratingData = stats.ratingDistribution.map((row) => ({
    name: `${row.star} ★`,
    count: row.count,
  }));

  const cityData = stats.topCities.map((row) => ({
    name: row.city,
    count: row.count,
  }));

  // Pie chart data — replace DB codes with human-readable labels
  const typeData = stats.companyTypes.map((row) => ({
    name: TYPE_NAMES[row.type] || row.type,
    value: row.count,
  }));

  const reviewData = stats.reviewBuckets.map((row) => ({
    name: row.bucket,
    count: row.count,
  }));

  const avgRatingCityData = stats.avgRatingByCity.map((row) => ({
    name: row.city,
    avgRating: Number(row.avgRating),
    count: row.count,
  }));

  return (
    <div className="flex flex-col gap-6">

      {/* ── Summary numbers ─────────────────────────────── */}
      <div className="flex gap-4">
        <StatBadge label="Companies tracked" value={stats.totals.totalCompanies} />
        <StatBadge label="Average rating" value={`${Number(stats.totals.avgRating).toFixed(2)} ★`} />
        <StatBadge label="Total reviews" value={Number(stats.totals.totalReviews).toLocaleString()} />
      </div>

      {/* ── Row 1: Rating distribution + Company types ── */}
      <div className="grid grid-cols-2 gap-6">

        <ChartCard
          title="Rating distribution"
          subtitle="How many companies have each star rating (1–5)"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ratingData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Companies" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Company type breakdown"
          subtitle="Share of property managers, real estate firms, and admin agencies"
        >
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={typeData}
                dataKey="value"
                nameKey="name"
                // innerRadius makes it a donut shape — more modern than a full pie
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {typeData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row 2: Top cities ───────────────────────────── */}
      <ChartCard
        title="Companies by city"
        subtitle="Top 10 Spanish cities by number of tracked companies"
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={cityData} layout="vertical" barSize={18} margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Companies" fill="var(--accent)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── Row 3: Reviews + Avg rating by city ─────────── */}
      <div className="grid grid-cols-2 gap-6">

        <ChartCard
          title="Review volume distribution"
          subtitle="How many reviews do companies typically have?"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={reviewData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Companies" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Average rating by city"
          subtitle="Cities with the best-rated firms (min. 5 companies)"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={avgRatingCityData} layout="vertical" barSize={16} margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              {/* Domain [3, 5] so small differences are visible */}
              <XAxis type="number" domain={[3, 5]} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgRating" name="Avg rating" fill="var(--accent)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

    </div>
  );
}
