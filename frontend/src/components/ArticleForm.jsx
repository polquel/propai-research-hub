// Form component for adding a new article.
// Receives onArticleAdded as a prop — a function to call after saving.

import { useState } from 'react';
import { createArticle } from '../services/api';

export default function ArticleForm({ onArticleAdded }) {
  // useState holds the form field values in memory
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); // Stop browser from reloading the page on submit

    if (!title.trim()) return; // Don't submit if title is empty

    setIsSubmitting(true);
    const newArticle = await createArticle({ title, url, source, notes });
    onArticleAdded(newArticle); // Tell App.jsx a new article was saved

    // Reset all fields
    setTitle('');
    setUrl('');
    setSource('');
    setNotes('');
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Research Item</h2>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="url"
          placeholder="URL (optional)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="text"
          placeholder="Source (e.g. Forbes, arXiv)"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <textarea
          placeholder="Notes (your personal observations)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Save Article'}
        </button>
      </div>
    </form>
  );
}
