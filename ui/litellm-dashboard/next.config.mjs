import path from "path";
import { fileURLToPath } from "url";

/** @type {import('next').NextConfig} */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const devProxyUrl = process.env.LENS_DEV_PROXY_URL;
const dashboardBasePath = process.env.NODE_ENV === "production" ? "/dashboard" : "";

const nextConfig = {
  transpilePackages: ["@litellm/lens-ui"],
  ...(devProxyUrl
    ? {
        async rewrites() {
          return {
            beforeFiles: [
              {
                source: "/:path*",
                has: [{ type: "header", key: "accept", value: "application/json.*" }],
                destination: `${devProxyUrl}/:path*`,
              },
              { source: "/ui/:path*", destination: "/:path*" },
            ],
            fallback: [{ source: "/:path*", destination: `${devProxyUrl}/:path*` }],
          };
        },
      }
    : {}),
  output: devProxyUrl ? undefined : "export",
  typescript: { tsconfigPath: "tsconfig.production.json" },
  experimental: {
    useTypeScriptCli: false,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  images: {
    unoptimized: true,
  },
  basePath: dashboardBasePath,
  trailingSlash: !devProxyUrl,
  skipTrailingSlashRedirect: Boolean(devProxyUrl),
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
