import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração mínima e estável para Next.js 15+
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // Configurações essenciais para desenvolvimento
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Configuração webpack otimizada
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    // Otimizações para desenvolvimento
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    
    return config
  },
  
  // Configurações básicas de imagem
  images: {
    unoptimized: true
  },
  
  // Configurações de build
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  
  // Configurações de produção
  trailingSlash: false,
  poweredByHeader: false,
  
  // Configurações de desenvolvimento para reduzir erros de rede
  async rewrites() {
    return []
  },
  
  // Headers para melhorar conectividade
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
