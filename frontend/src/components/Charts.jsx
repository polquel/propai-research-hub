// Charts dashboard — visual summary of all company data in the database.
// Uses Recharts: a library that turns data arrays into React chart components.

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getStats } from '../services/api';

const PIE_COLORS = ['#aa3bff', '#7c3aed', '#a855f7', '#c084fc', '#e9d5ff'];

const TYPE_NAMES = {
  property_manager: 'Property Manager',
  real_estate:      'Real Estate',
  admin_agency:     'Admin Agency',
  unknown:          'Unknown',
};

// px per bar row in horizontal bar charts — enough for the bar + label breathing room
const ROW_HEIGHT = 26;

// Width the YAxis needs so the longest Spanish city name never gets clipped.
// "L'Hospitalet de Llobregat" ≈ 25 chars × ~7px = 175px — use 180 to be safe.
const CITY_AXIS_WIDTH = 180;

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}
      className="border rounded-lg px-3 py-2 shadow-md text-sm">
      {label && <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: 'var(--text-muted)' }}>
          {entry.name}:{' '}
          <span className="font-semibold text-[var(--accent)]">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="border border-l-4 border-l-[var(--accent)] rounded-xl p-6 shadow-sm"
      style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</p>
      {subtitle && <p className="text-xs mt-0.5 mb-5" style={{ color: 'var(--text-subtle)' }}>{subtitle}</p>}
      {!subtitle && <div className="mb-5" />}
      {children}
    </div>
  );
}

function StatBadge({ label, value }) {
  return (
    <div className="flex-1 bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded-xl p-4 text-center">
      <p className="text-2xl font-bold text-[var(--accent)]">{value}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
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

  const ratingData = stats.ratingDistribution.map((row) => ({
    name: `${row.star} ★`,
    count: row.count,
  }));

  // All cities sorted by count — backend no longer caps at 10
  const cityData = stats.topCities.map((row) => ({
    name: row.city,
    count: row.count,
  }));

  const typeData = stats.companyTypes.map((row) => ({
    name: TYPE_NAMES[row.type] || row.type,
    value: row.count,
  }));

  const reviewData = stats.reviewBuckets.map((row) => ({
    name: row.bucket,
    count: row.count,
  }));

  // All cities with avg rating — sorted best first
  const avgRatingCityData = stats.avgRatingByCity.map((row) => ({
    name: row.city,
    avgRating: Number(row.avgRating),
    count: row.count,
  }));

  // Dynamic heights so every city gets a row — no clipping
  const cityChartHeight  = cityData.length        * ROW_HEIGHT + 40;
  const ratingCityHeight = avgRatingCityData.length * ROW_HEIGHT + 40;

  const axisTick = { fontSize: 11, fill: 'var(--text-muted)' };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Summary badges ──────────────────────────────── */}
      <div className="flex gap-4">
        <StatBadge label="Companies tracked"  value={stats.totals.totalCompanies} />
        <StatBadge label="Average rating"     value={`${Number(stats.totals.avgRating).toFixed(2)} ★`} />
        <StatBadge label="Total reviews"      value={Number(stats.totals.totalReviews).toLocaleString()} />
      </div>

      {/* ── Row 1: Rating + donut ───────────────────────── */}
      <div className="grid grid-cols-2 gap-6">

        <ChartCard title="Rating distribution" subtitle="Companies per star rating (1 – 5)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ratingData} barSize={44}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Companies" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Company type breakdown" subtitle="Property managers vs real estate vs admin agencies">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name"
                innerRadius={55} outerRadius={90} paddingAngle={3}>
                {typeData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── All cities by company count ─────────────────── */}
      <ChartCard
        title="Companies by city"
        subtitle={`All ${cityData.length} cities — sorted by number of tracked companies`}
      >
        {/* Height grows with number of cities so every row is readable */}
        <ResponsiveContainer width="100%" height={cityChartHeight}>
          <BarChart data={cityData} layout="vertical" barSize={14}
            margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
            <XAxis type="number" tick={axisTick} />
            <YAxis
              type="category"
              dataKey="name"
              tick={axisTick}
              width={CITY_AXIS_WIDTH}   // wide enough for the longest Spanish city name
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Companies" fill="var(--accent)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── Row 3: Review buckets + avg rating by city ──── */}
      <div className="grid grid-cols-2 gap-6">

        <ChartCard title="Review volume distribution" subtitle="How many reviews do companies typically have?">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={reviewData} barSize={44}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Companies" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Average rating by city"
          subtitle={`All ${avgRatingCityData.length} cities (min. 3 companies) — best rated first`}
        >
          <div style={{ overflowY: 'auto', maxHeight: 420 }}>
            <div style={{ height: ratingCityHeight, minHeight: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={avgRatingCityData} layout="vertical" barSize={14}
                  margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                  {/* Domain starts at 3 so small differences between cities are visible */}
                  <XAxis type="number" domain={[3, 5]} tick={axisTick} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={axisTick}
                    width={CITY_AXIS_WIDTH}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgRating" name="Avg rating" fill="var(--accent)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>
      </div>

    </div>
  );
}
