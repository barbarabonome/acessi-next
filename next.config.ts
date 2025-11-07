import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ignora erros de ESLint no build (aqueles "Unexpected any", etc.)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ignora erros de TypeScript no build (útil quando o TS barra o deploy)
  typescript: {
    ignoreBuildErrors: true,
  },
  // pode deixar outras configs aqui depois
};

export default nextConfig;
