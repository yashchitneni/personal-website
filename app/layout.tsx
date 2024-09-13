import type { Metadata } from "next";
import { NavBar } from "./components/NavBar";
import "./globals.css";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

/**
 * Metadata for the application.
 * @type {Metadata}
 */
export const metadata: Metadata = {
  title: "Building Yash",
  description: "Exploring life's facets through self-experimentation"
};

/**
 * Root layout component for the application.
 * @function RootLayout
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render.
 * @returns {JSX.Element} The rendered root layout.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavBar />
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}
