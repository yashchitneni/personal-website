import { Loader2 } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <h1 className="text-4xl font-bold mb-2">Your Name</h1>
      <p className="text-xl mb-8">Coming Soon</p>
      <Loader2 className="w-8 h-8 animate-spin" />
    </main>
  );
}