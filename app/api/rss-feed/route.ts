import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export async function GET() {

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
    const feed = await parser.parseURL('https://yashchitneni.substack.com/feed');
    
    const posts = feed.items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      content: item['content:encoded'],
      contentSnippet: item.contentSnippet,
      categories: item.categories || [],
    }));

    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch RSS feed' }, { status: 500 });
  }
}
