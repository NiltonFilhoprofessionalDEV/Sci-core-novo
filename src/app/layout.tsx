import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SecoesProvider } from "@/contexts/SecoesContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sistema de Indicadores | Bombeiro",
    template: "%s | Sistema de Indicadores",
  },
  description: "Sistema de Indicadores do Corpo de Bombeiros",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      {process.env.NODE_ENV === 'development' ? (
        <head>
          <meta
            httpEquiv="Content-Security-Policy"
            content="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' http://localhost:* ws://localhost:* https://*.supabase.co; font-src 'self' data:; object-src 'none'; frame-ancestors 'none';"
          />
        </head>
      ) : (
        <head />
      )}
      <body
        className={`${inter.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <SecoesProvider>
              {children}
              <Toaster position="top-right" />
            </SecoesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
