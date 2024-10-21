import Link from 'next/link';

interface Post {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  categories: string[];
}

interface BlogPostProps {
  post: Post;
}

export default function BlogPost({ post }: BlogPostProps) {
  const slug = post.link.split('/').pop();

  return (
    <div className="border rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-2">
        <Link href={`/writing/${slug}`} className="text-blue-600 hover:underline">
          {post.title}
        </Link>
      </h2>
      <p className="text-gray-600 mb-2">{new Date(post.pubDate).toLocaleDateString()}</p>
      <p className="mb-4">{post.contentSnippet}</p>
      <div className="flex flex-wrap gap-2">
        {post.categories.map(category => (
          <span key={category} className="bg-gray-200 px-2 py-1 rounded text-sm">
            {category}
          </span>
        ))}
      </div>
    </div>
  );
}
