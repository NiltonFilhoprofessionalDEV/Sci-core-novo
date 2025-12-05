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
  // CSP será configurado via next.config.ts e middleware.ts
  // Não precisamos configurar aqui para evitar duplicação
  return (
    <html lang="pt-BR">
      <head />
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
