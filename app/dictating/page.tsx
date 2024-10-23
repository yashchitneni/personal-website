import Image from 'next/image';
import BlogPostList from '../components/BlogPostList';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative h-[30vh] md:h-[40vh] lg:h-[50vh]">
        {/* <Image
          src="/path-to-your-writing-image.jpg" // Replace with your actual image path
          alt="Yash Chitneni writing"
          layout="fill"
          objectFit="cover"
          priority
        /> */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center">
            Dictating
          </h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto my-8 px-4">
        <div className="w-full max-w-lg mx-auto">
          <iframe 
            src="https://yashchitneni.substack.com/embed" 
            width="480" 
            height="320" 
            style={{ border: '1px solid #EEE', background: '#F3F4F6' }}
            frameBorder="0" 
            scrolling="no"
            className="w-full"
          ></iframe>
        </div>
      </div>
      <BlogPostList />
    </div>
  );
}
