'use client'

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const TwitterEmbed = dynamic(() => import('../../components/TwitterEmbed'), { ssr: false });

interface Post {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  imageUrl: string | null;
}

const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

const removeSubscriptionWidget = (content: string) => {
  return content.replace(/<div class="subscription-widget-wrap-editor".*?<\/div><\/div>/s, '');
};

async function getPost(slug: string): Promise<Post | null> {
  const res = await fetch('/api/rss-feed');
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  const data = await res.json();
  const post = data.posts.find((post: Post) => createSlug(post.title) === slug);
  
  if (post) {
    post.content = removeSubscriptionWidget(post.content);
  }
  
  return post || null;
}

const processTweetEmbeds = (content: string) => {
  console.log("Raw content:", content); // Log raw content for debugging

  // Look for the entire tweet embed structure
  const tweetRegex = /<div class="tweet".*?data-attrs="(.*?)".*?<\/div>/gs;
  const parts = [];
  let lastIndex = 0;

  while (true) {
    const match = tweetRegex.exec(content);
    if (match === null) break;

    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }

    const tweetDataString = match[1].replace(/&quot;/g, '"');
    const tweetData = JSON.parse(tweetDataString);
    const tweetId = tweetData.url.split('/').pop();

    parts.push({ type: 'tweet', id: tweetId });
    lastIndex = match.index + match[0].length;
  }

  // Add any remaining content after the last tweet
  if (lastIndex < content.length) {
    const remainingContent = content.slice(lastIndex);
    if (remainingContent.trim()) {
      parts.push({ type: 'text', content: remainingContent });
    }
  }

  console.log("Processed parts:", parts); // Log processed parts for debugging
  return parts;
};

export default function BlogPost({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [contentParts, setContentParts] = useState<Array<{ type: string; content?: string; id?: string }>>([]);

  useEffect(() => {
    const fetchPost = async () => {
      const fetchedPost = await getPost(params.slug);
      setPost(fetchedPost);
      if (fetchedPost) {
        setContentParts(processTweetEmbeds(fetchedPost.content));
      }
    };
    fetchPost();
  }, [params.slug]);

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="w-full max-w-lg mx-auto">
            <iframe 
              src="https://yashchitneni.substack.com/embed" 
              width="480" 
              height="320" 
              style={{ border: '1px solid #EEE', background: 'white' }}
              frameBorder="0" 
              scrolling="no"
              className="w-full"
            ></iframe>
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-center">{post.title}</h1>
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-8">{new Date(post.pubDate).toLocaleDateString()}</p>
          {contentParts.map((part, index) => 
            part.type === 'text' ? (
              <div key={index} dangerouslySetInnerHTML={{ __html: part.content || '' }} />
            ) : (
              <div key={part.id} className="my-4">
                <TwitterEmbed tweetId={part.id || ''} />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
