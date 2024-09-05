import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import Link from 'next/link';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Your Name - Coming Soon",
  description: "Personal website of Your Name",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <header className="bg-gray-100 py-4">
            <nav className="container mx-auto px-4">
              <ul className="flex space-x-4">
                <li>
                  <Link href="/" className="text-blue-600 hover:underline">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-blue-600 hover:underline">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/biofeedback" className="text-blue-600 hover:underline">
                    Biofeedback
                  </Link>
                </li>
                <li>
                  <Link href="/upload-json" className="text-blue-600 hover:underline">
                    Upload JSON
                  </Link>
                </li>
              </ul>
            </nav>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
