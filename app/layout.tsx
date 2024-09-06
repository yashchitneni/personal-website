import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import type { Metadata } from 'next';

/**
 * Metadata for the application.
 * @type {Metadata}
 */
export const metadata: Metadata = {
  title: 'Your App Name',
  description: 'Your app description',
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
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
