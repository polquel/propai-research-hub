// Displays the list of saved research articles.
// Receives articles array and onDelete function as props from App.jsx.

import { deleteArticle } from '../services/api';

export default function ArticleList({ articles, onDelete }) {
  if (articles.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-12">
        No articles saved yet. Add your first one above.
      </p>
    );
  }

  async function handleDelete(id) {
    await deleteArticle(id);
    onDelete(id); // Tell App.jsx to remove this article from its list
  }

  return (
    <ul className="flex flex-col gap-4">
      {articles.map((article) => (
        <li key={article.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1 min-w-0">
              {/* Article title — link if URL exists, plain text otherwise */}
              {article.url ? (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 font-medium hover:underline truncate"
                >
                  {article.title}
                </a>
              ) : (
                <span className="font-medium text-gray-800">{article.title}</span>
              )}

              {/* Source + date badge */}
              <div className="flex gap-2 text-xs text-gray-400">
                {article.source && (
                  <span className="bg-gray-100 rounded px-2 py-0.5">{article.source}</span>
                )}
                <span>{new Date(article.savedAt).toLocaleDateString()}</span>
              </div>

              {/* Personal notes */}
              {article.notes && (
                <p className="text-sm text-gray-600 mt-1">{article.notes}</p>
              )}
            </div>

            {/* Delete button */}
            <button
              onClick={() => handleDelete(article.id)}
              className="text-red-400 hover:text-red-600 text-xs shrink-0 transition-colors"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
