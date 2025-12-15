import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== 'production'

// Incluir 'unsafe-eval' e 'unsafe-inline' também em produção
// pois o Next.js e algumas bibliotecas podem precisar disso
const scriptSources = ["'self'", "'unsafe-eval'", "'unsafe-inline'"]

const connectSources = ["'self'", "https://*.supabase.co"]
if (isDev) {
  connectSources.push('http://localhost:*', 'ws://localhost:*')
}

const csp = [
  "default-src 'self'",
  `script-src ${scriptSources.join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  `connect-src ${connectSources.join(' ')}`,
  "font-src 'self' data:",
  "object-src 'none'",
  "frame-ancestors 'none'",
].join('; ') + ';'

const nextConfig: NextConfig = {
  // Configuração mínima e estável para Next.js 15+
  serverExternalPackages: ['@supabase/supabase-js'],

  // Evita o Next inferir o workspace root errado quando há lockfiles acima do projeto
  outputFileTracingRoot: __dirname,
  
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
    ignoreDuringBuilds: false
  },
  typescript: {
    ignoreBuildErrors: false
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
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
        ],
      },
    ]
  },
};

export default nextConfig;
