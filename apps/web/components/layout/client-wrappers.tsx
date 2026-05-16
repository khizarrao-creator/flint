"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";

export function ClientWrappers({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const hideLayout = pathname === "/login" || pathname === "/onboard" || pathname.startsWith("/portal");

    if (hideLayout) {
        return <div className="min-h-screen bg-[#020617]">{children}</div>;
    }

    return (
        <div className="flex bg-slate-50 dark:bg-[#020617] min-h-screen w-full">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <Navbar />
                <div className="p-4 md:p-8 flex-1 overflow-y-auto overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}
