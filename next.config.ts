import type { NextConfig } from "next";

function resolveApiUrl(): string | undefined {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }
  const railwayBackendHost =
    process.env.RAILWAY_SERVICE_VISA_APPLICATION_BACKEND__URL?.trim();
  if (railwayBackendHost) {
    return `https://${railwayBackendHost}/api`;
  }
  return undefined;
}

function resolveBackendOrigin(apiUrl: string | undefined): string | undefined {
  if (!apiUrl || !/^https?:\/\//i.test(apiUrl)) {
    return undefined;
  }
  return apiUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
}

const resolvedApiUrl = resolveApiUrl();
const backendOrigin = resolveBackendOrigin(resolvedApiUrl);

const nextConfig: NextConfig = {
  ...(resolvedApiUrl
    ? {
        env: {
          NEXT_PUBLIC_API_URL: resolvedApiUrl,
        },
      }
    : {}),
  async rewrites() {
    if (!backendOrigin) {
      return [];
    }
    return [
      {
        source: "/api/auth/:path*",
        destination: `${backendOrigin}/api/auth/:path*`,
      },
      {
        source: "/api/admin/:path*",
        destination: `${backendOrigin}/api/admin/:path*`,
      },
      {
        source: "/api/super-admin/:path*",
        destination: `${backendOrigin}/api/super-admin/:path*`,
      },
      {
        source: "/api/company/:path*",
        destination: `${backendOrigin}/api/company/:path*`,
      },
      {
        source: "/api/public/:path*",
        destination: `${backendOrigin}/api/public/:path*`,
      },
      {
        source: "/api/submissions/:path*",
        destination: `${backendOrigin}/api/submissions/:path*`,
      },
      {
        source: "/api/applications/:path*",
        destination: `${backendOrigin}/api/applications/:path*`,
      },
      {
        source: "/api/forms/:path*",
        destination: `${backendOrigin}/api/forms/:path*`,
      },
      {
        source: "/api/links/:path*",
        destination: `${backendOrigin}/api/links/:path*`,
      },
      {
        source: "/api/otp/:path*",
        destination: `${backendOrigin}/api/otp/:path*`,
      },
    ];
  },
};

export default nextConfig;
