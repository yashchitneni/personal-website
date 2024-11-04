import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export const revalidate = 0; // Disable caching for this route

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
    // Add cache-busting query parameter to prevent caching
    const feed = await parser.parseURL(`https://yashchitneni.substack.com/feed?t=${Date.now()}`);
    
    const posts = feed.items.map(item => {
      const content = item['content:encoded'] as string;
      const imageMatch = content.match(/<div class="captioned-image-container">.*?<img.*?src="(.*?)".*?>/);
      const imageUrl = imageMatch ? imageMatch[1] : null;

      return {
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        content: content,
        contentSnippet: item.contentSnippet,
        imageUrl: imageUrl,
      };
    });

    return NextResponse.json({ posts }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch RSS feed' }, { status: 500 });
  }
}
