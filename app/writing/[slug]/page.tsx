'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Post {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  categories: string[];
}

export default function BlogPostPage() {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const { slug } = params;

  useEffect(() => {
    async function fetchPost() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/rss-feed');
        const data = await response.json();
        const foundPost = data.posts.find((p: Post) => p.link.includes(slug as string));
        if (foundPost) {
          setPost(foundPost);
        } else {
          setError('Post not found');
        }
      } catch (err) {
        setError('Failed to fetch post');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  if (isLoading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (error) return <div className="container mx-auto px-4 py-8">Error: {error}</div>;
  if (!post) return <div className="container mx-auto px-4 py-8">Post not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-600 mb-4">{new Date(post.pubDate).toLocaleDateString()}</p>
      </div>
      <div className="prose max-w-none mb-8">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
      <Link href={post.link} className="text-blue-600 hover:underline">
        Read full article on Substack
      </Link>
      <div className="mt-4 flex flex-wrap gap-2">
        {post.categories.map(category => (
          <span key={category} className="bg-gray-200 px-2 py-1 rounded text-sm">
            {category}
          </span>
        ))}
      </div>
    </div>
  );
}
