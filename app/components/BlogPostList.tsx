'use client'

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';

interface Post {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  imageUrl: string | null;
}

const substackLoader = ({ src, width, quality }: { src: string, width: number, quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`
}

// Function to create a slug from the post title
const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

export default function BlogPostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const postsPerPage = 9;

  const fetchPosts = useCallback(async (showRefreshState = false) => {
    try {
      if (showRefreshState) setIsRefreshing(true);
      const response = await fetch('/api/rss-feed');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPosts(data.posts);
    } catch (e) {
      console.error("Fetching posts failed:", e);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
      if (showRefreshState) setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Polling effect - checks every 5 minutes
  useEffect(() => {
    const pollInterval = 5 * 60 * 1000; // 5 minutes
    const interval = setInterval(() => {
      fetchPosts();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [fetchPosts]);

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>{error}</div>;

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-end mb-6">
        <button
          onClick={() => fetchPosts(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Posts'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentPosts.map((post: Post) => (
          <Link href={`/dictating/${createSlug(post.title)}`} key={post.link} className="block group">
            <div className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-200 ease-in-out group-hover:scale-105 h-full flex flex-col">
              {post.imageUrl && (
                <div className="relative h-48 w-full">
                  <Image
                    loader={substackLoader}
                    src={post.imageUrl}
                    alt={post.title}
                    layout="fill"
                    objectFit="cover"
                    className="transition-opacity duration-200 ease-in-out group-hover:opacity-80"
                  />
                </div>
              )}
              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors duration-200 ease-in-out">{post.title}</h2>
                <p className="text-gray-600 text-sm mb-4">{new Date(post.pubDate).toLocaleDateString()}</p>
                <p className="text-gray-700 line-clamp-3 flex-grow">{post.contentSnippet}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {posts.length > postsPerPage && (
        <div className="mt-12 flex justify-center">
          <Pagination
            postsPerPage={postsPerPage}
            totalPosts={posts.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        </div>
      )}
    </div>
  );
}

interface PaginationProps {
  postsPerPage: number;
  totalPosts: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
}

const Pagination: React.FC<PaginationProps> = ({ postsPerPage, totalPosts, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className="flex space-x-2">
        {pageNumbers.map(number => (
          <li key={number}>
            <button
              onClick={() => paginate(number)}
              className={`px-4 py-2 rounded ${
                currentPage === number
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
