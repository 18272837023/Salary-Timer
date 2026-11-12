import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page not found · Salary Timer",
  description: "This page does not exist. Return to Salary Timer or browse the guides.",
  robots: { index: false, follow: true },
};

// Global 404 bypasses both root layouts, so it supplies its own full document.
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <head><link rel="ard" href="/ard.json" /></head>
      <body>
        <main className="wrap section">
          <div className="eyebrow">404</div>
          <h1>Page not found</h1>
          <p className="lede">The page you requested does not exist.</p>
          <p><a className="btn btn-mint" href="/">Open Salary Timer</a></p>
          <p><a href="/learn/">Browse the guides</a> · <a href="/zh/">简体中文首页</a></p>
        </main>
        <footer className="wrap section">
          <a href="/privacy/">Privacy Policy</a> · <a href="/terms/">Terms of Use</a>
        </footer>
      </body>
    </html>
  );
}
