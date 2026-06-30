// Utilities for exporting data to CSV and Markdown files.
// All exports happen in the browser — no backend call needed.
// The trick: create a temporary invisible link pointing to a Blob (in-memory file), then click it.

function download(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url); // free the memory
}

// Wrap a value in quotes and escape any existing quotes inside it
function csvCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value).replace(/"/g, '""'); // double-up internal quotes
  return `"${str}"`;
}

// --- Companies CSV ---
// Takes the array of company objects currently shown on screen.
export function exportCompaniesCSV(companies) {
  const headers = ['Name', 'City', 'Country', 'Type', 'Rating', 'Reviews', 'Website', 'Services', 'Notes'];
  const rows = companies.map((c) => [
    csvCell(c.name),
    csvCell(c.city),
    csvCell(c.country),
    csvCell(c.companyType),
    csvCell(c.rating),
    csvCell(c.reviewCount),
    csvCell(c.website),
    csvCell(c.services),
    csvCell(c.notes),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const date = new Date().toISOString().slice(0, 10);
  download(`propai-companies-${date}.csv`, csv, 'text/csv;charset=utf-8;');
}

// --- Pain Points Markdown ---
// Takes the themes array from /api/stats/pain-points.
export function exportPainPointsMD(themes) {
  const date = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const totalSignals = themes.reduce((s, t) => s + t.count, 0);

  const lines = [
    '# PropAI — Pain Point Analysis',
    `*Generated ${date} · ${totalSignals} complaint signals across ${themes.length} themes*`,
    '',
    '---',
    '',
  ];

  themes.forEach((t, i) => {
    lines.push(`## ${i + 1}. ${t.theme} — ${t.count} companies`);
    lines.push(`> ${t.description}`);
    lines.push('');

    if (t.examples.length > 0) {
      lines.push('**Example reviews:**');
      t.examples.forEach((ex) => {
        lines.push(`- **${ex.company} (${ex.city}):** "${ex.text}…"`);
      });
      lines.push('');
    }

    if (t.companies.length > 0) {
      const sample = t.companies.slice(0, 8).map((c) => `${c.name} (${c.city}, ${c.rating}⭐)`).join(', ');
      lines.push(`**Affected companies (sample):** ${sample}${t.companies.length > 8 ? `, +${t.companies.length - 8} more` : ''}`);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  });

  lines.push('*Exported from PropAI Research Hub*');

  const dateFile = new Date().toISOString().slice(0, 10);
  download(`propai-pain-points-${dateFile}.md`, lines.join('\n'), 'text/markdown;charset=utf-8;');
}

// --- AI Opportunities Markdown ---
// Takes the array of opportunity objects.
export function exportOpportunitiesMD(opportunities) {
  const date = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

  const viabilityStars = (v) => (v ? '★'.repeat(v) + '☆'.repeat(5 - v) : 'unrated');

  const lines = [
    '# PropAI — AI Opportunities',
    `*Generated ${date} · ${opportunities.length} feature ideas*`,
    '',
    '---',
    '',
  ];

  // Sort by viability descending (most viable first)
  const sorted = [...opportunities].sort((a, b) => (b.viability ?? 0) - (a.viability ?? 0));

  sorted.forEach((o, i) => {
    lines.push(`## ${i + 1}. ${o.title}`);
    lines.push(`**Viability:** ${viabilityStars(o.viability)} (${o.viability ?? '?'}/5)  `);
    if (o.targetArea) lines.push(`**Target area:** ${o.targetArea}  `);
    lines.push('');
    if (o.description) lines.push(o.description);
    lines.push('');
    if (o.notes) {
      lines.push(`*Notes: ${o.notes}*`);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  });

  lines.push('*Exported from PropAI Research Hub*');

  const dateFile = new Date().toISOString().slice(0, 10);
  download(`propai-opportunities-${dateFile}.md`, lines.join('\n'), 'text/markdown;charset=utf-8;');
}
