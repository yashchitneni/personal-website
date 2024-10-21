'use client'

import { useState, useEffect } from 'react';
import BlogPost from './BlogPost';

interface Post {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  categories: string[];
}

export default function BlogPostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    async function fetchPosts() {
      const response = await fetch('/api/rss-feed');
      const data = await response.json();
      setPosts(data.posts);
      const tags = Array.from(new Set(data.posts.flatMap((post: Post) => post.categories)));
      setAllTags(tags as string[]);
    }

    fetchPosts();
  }, []);

  const filteredPosts = selectedTag
    ? posts.filter(post => post.categories.includes(selectedTag))
    : posts;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blog Posts</h1>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Filter by Tag:</h2>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 rounded ${!selectedTag ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedTag(null)}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`px-3 py-1 rounded ${selectedTag === tag ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-8">
        {filteredPosts.map((post: Post) => (
          <BlogPost key={post.link} post={post} />
        ))}
      </div>
    </div>
  );
}
