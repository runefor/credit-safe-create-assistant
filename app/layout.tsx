import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Credit-Safe Create Assistant",
  description: "Public-flow-inspired AI music create workflow portfolio demo.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-cream text-ink antialiased">
        <header className="border-b border-orange-200 bg-white/80 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
            <Link href="/" className="font-semibold tracking-tight">Credit-Safe Create Assistant</Link>
            <div className="flex gap-3 text-sm">
              <Link className="rounded-full px-3 py-1 hover:bg-orange-100" href="/create">Create</Link>
              <Link className="rounded-full px-3 py-1 hover:bg-orange-100" href="/workspace">Workspace</Link>
              <Link className="rounded-full px-3 py-1 hover:bg-orange-100" href="/city-context">City Context</Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
