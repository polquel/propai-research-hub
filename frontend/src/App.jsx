// Root component — holds the article list in state and coordinates child components.

import { useState, useEffect } from 'react';
import { getAllArticles } from './services/api';
import ArticleForm from './components/ArticleForm';
import ArticleList from './components/ArticleList';

export default function App() {
  // articles = the list we fetched from the backend; starts empty while loading
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect runs once after the component first renders — good place to fetch data
  useEffect(() => {
    async function fetchArticles() {
      const data = await getAllArticles();
      setArticles(data);
      setIsLoading(false);
    }
    fetchArticles();
  }, []); // Empty array = run only once on mount

  // Called by ArticleForm after a new article is saved
  function handleArticleAdded(newArticle) {
    setArticles([newArticle, ...articles]); // Add to top of list
  }

  // Called by ArticleList after an article is deleted
  function handleArticleDeleted(deletedId) {
    setArticles(articles.filter((a) => a.id !== deletedId)); // Remove from list
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">PropAI Research Hub</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track articles, companies, and AI opportunities in property management
          </p>
        </div>

        {/* Add article form */}
        <div className="mb-8">
          <ArticleForm onArticleAdded={handleArticleAdded} />
        </div>

        {/* Article list */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Saved Research ({articles.length})
          </h2>
          {isLoading ? (
            <p className="text-gray-400 text-sm text-center py-12">Loading...</p>
          ) : (
            <ArticleList articles={articles} onDelete={handleArticleDeleted} />
          )}
        </div>

      </div>
    </div>
  );
}
