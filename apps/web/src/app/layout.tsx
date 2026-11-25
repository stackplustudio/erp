import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StackPlus ERP — Back-Office & Distribution Management",
  description:
    "Sistem operasional distributor & grosir (FMCG, sembako, material, farmasi bebas) berkecepatan tinggi, ringan, dan presisi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className={`${inter.className} min-h-screen antialiased selection:bg-brand-primary-soft selection:text-brand-primary`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#FDFBF7",
              color: "#2A2724",
              border: "1px solid #EAE5D9",
              borderRadius: "12px",
              boxShadow: "0 4px 8px rgb(0 0 0 / 0.08)",
              fontSize: "14px",
              padding: "12px 16px",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#15803D",
                secondary: "#F0FDF4",
              },
            },
            error: {
              duration: 6000,
              iconTheme: {
                primary: "#DC2626",
                secondary: "#FEF2F2",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
