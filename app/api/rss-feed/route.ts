import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export async function GET() {
  console.log('RSS feed route called'); // This will appear in your terminal

  const parser = new Parser({
    customFields: {
      item: [
        ['content:encoded', 'content'],
        ['dc:creator', 'creator'],
        ['description', 'description'],
      ],
    },
  });

  try {
    console.log('Attempting to fetch RSS feed');
    const feed = await parser.parseURL('https://yashchitneni.substack.com/feed');
    console.log('RSS feed fetched successfully');
    
    const posts = feed.items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      content: item['content:encoded'],
      contentSnippet: item.contentSnippet,
      categories: item.categories || [],
    }));

    console.log('Processed posts:', JSON.stringify(posts, null, 2)); // Log processed posts

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return NextResponse.json({ error: 'Failed to fetch RSS feed' }, { status: 500 });
  }
}
