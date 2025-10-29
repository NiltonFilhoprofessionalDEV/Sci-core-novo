import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removido 'standalone' que pode causar problemas na Vercel
  // Atualizado para Next.js 15+
  serverExternalPackages: ['@supabase/supabase-js'],
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  // Configurações específicas para Vercel
  trailingSlash: false,
  poweredByHeader: false
};

export default nextConfig;
