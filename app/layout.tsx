import { NavBar } from './components/NavBar'
import './globals.css'
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs/'

/**
 * Metadata for the application.
 * @type {Metadata}
 */
export const metadata: Metadata = {
  title: 'Your Site Name',
  description: 'Your site description',
};

/**
 * Root layout component for the application.
 * @function RootLayout
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render.
 * @returns {JSX.Element} The rendered root layout.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <ClerkProvider>
        <body>
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-500 to-indigo-600">
            <NavBar />
            <main className="flex-grow">
              {children}
            </main>
          </div>
        </body>
      </ClerkProvider>
    </html>
  );
}
