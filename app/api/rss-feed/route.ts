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

    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch RSS feed' }, { status: 500 });
  }
}
