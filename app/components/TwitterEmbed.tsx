import React, { useEffect, useRef, useState } from 'react';

interface TwitterEmbedProps {
  tweetId: string;
}

const TwitterEmbed: React.FC<TwitterEmbedProps> = ({ tweetId }) => {
  const tweetRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadTwitterScript = () => {
      return new Promise<void>((resolve, reject) => {
        if ((window as any).twttr) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Twitter script'));
        document.body.appendChild(script);
      });
    };

    const embedTweet = async () => {
      try {
        await loadTwitterScript();
        if (tweetRef.current && (window as any).twttr) {
          await (window as any).twttr.widgets.createTweet(tweetId, tweetRef.current);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load tweet');
          console.error('Error embedding tweet:', err);
        }
      }
    };

    embedTweet();

    return () => {
      isMounted = false;
    };
  }, [tweetId]);

  if (error) {
    return (
      <div className="border border-gray-300 rounded p-4 my-4">
        <p className="text-red-500 mb-2">{error}</p>
        <a href={`https://twitter.com/x/status/${tweetId}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          View tweet on Twitter
        </a>
      </div>
    );
  }

  return <div ref={tweetRef} className="my-4" />;
};

export default TwitterEmbed;
