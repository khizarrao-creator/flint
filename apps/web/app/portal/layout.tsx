import React from "react";
import { Outfit } from "next/font/google";
import { cn } from "@/app/lib/utils";

const outfit = Outfit({ subsets: ["latin"] });

import { PortalAuthProvider } from "./lib/portal-auth-context";

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PortalAuthProvider>
            <div className={cn(outfit.className, "min-h-screen bg-slate-50 dark:bg-[#020617] text-foreground antialiased selection:bg-primary/20 selection:text-primary")}>
                <div className="flex flex-col min-h-screen">
                    {/* Portal Navbar Placeholder */}
                    <header className="h-16 border-b bg-card/50 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="text-white font-black italic">F</span>
                            </div>
                            <span className="font-black tracking-tight text-lg">Customer Portal</span>
                        </div>
                    </header>

                    <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
                        {children}
                    </main>
                </div>
            </div>
        </PortalAuthProvider>
    );
}
