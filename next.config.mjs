/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pure static output: `next build` writes a fully prerendered site to ./out,
  // deployable to Cloudflare Pages, Netlify, S3, or any plain file host with
  // no Node runtime. SEO is unaffected because every page is real HTML.
  output: "export",

  // /hourly-rate-calculator/ instead of /hourly-rate-calculator — avoids a
  // redirect hop on static hosts and keeps canonical URLs consistent.
  trailingSlash: true,

  images: {
    unoptimized: true,
  },

  // `next dev` only trusts requests whose Host matches the dev server's own
  // origin. Opening the preview at http://127.0.0.1:PORT instead of localhost
  // otherwise gets its /_next/* dev assets (HMR + client chunks) blocked, which
  // silently prevents hydration — the page renders but nothing is interactive.
  allowedDevOrigins: ["127.0.0.1", "localhost"],

  reactStrictMode: true,
};

export default nextConfig;
