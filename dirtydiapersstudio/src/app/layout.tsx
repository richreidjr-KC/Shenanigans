import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Dirty Diapers Studio",
  description: "Dirty Diaperz / Shenanigans Studio Control",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="app-root min-h-screen bg-[#0d0d0d] text-white">
        <header className="app-header">
          <div className="app-title">Dirty Diapers Studio</div>
          <nav className="app-nav">
            <a href="/">Home</a>
            <a href="/dashboard">Dashboard</a>
            <a href="/songs">Songs</a>
            <a href="/setlist">Setlist</a>
            <a href="/live">Go Live</a>
            <a href="/stems">Stems</a>
            <a href="/studio">Studio</a>
          </nav>
        </header>
        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
