import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { AuthProvider } from "./lib/auth-context";
import { cn } from "@/app/lib/utils";
import { ClientWrappers } from "@/components/layout/client-wrappers";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flint ERP | Premium Business Intelligence",
  description: "Next-generation ERP focused on speed, design, and data integrity.",
};

import { ThemeProvider } from "./lib/theme-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(outfit.className, "bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary")}>
        <AuthProvider>
          <ThemeProvider>
            <ClientWrappers>
              {children}
            </ClientWrappers>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
