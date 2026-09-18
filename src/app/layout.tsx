import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import ThemeProvider from "@/components/ThemeProvider";
import FloatingControls from "@/components/FloatingControls";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "ClinicFlow — Healthcare Management",
    template: "%s · ClinicFlow",
  },
  description: "Streamline your clinic operations with ClinicFlow — appointments, patient records, prescriptions, and billing in one secure, role-based platform.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "ClinicFlow — Healthcare Management",
    description: "Streamline your clinic operations with ClinicFlow.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <FloatingControls />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
