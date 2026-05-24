import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGithubPages ? "/new-conecta-mvp" : undefined,
  assetPrefix: isGithubPages ? "/new-conecta-mvp/" : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
