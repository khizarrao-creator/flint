"use client";

import React from "react";
import {
    Bell,
    Search,
    Zap,
    LogOut,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { useAuth } from "@/app/lib/auth-context";

export function Navbar() {
    const { user, logout } = useAuth();

    return (
        <header className="h-20 border-b bg-card/10 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder="Global Intelligence Search..."
                    className="w-full h-11 bg-muted/50 border-transparent border focus:border-primary/30 outline-none rounded-2xl pl-12 pr-4 text-sm font-bold transition-all focus:bg-card focus:shadow-xl focus:shadow-primary/5"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-all relative">
                    <Zap className="w-5 h-5" />
                </button>

                <button className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-all relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
                </button>

                <div className="w-[1px] h-6 bg-border mx-4" />

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end hidden sm:flex font-outfit">
                        <span className={cn(
                            "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.1em] mb-1 ring-1 ring-inset",
                            user?.role === "SUPER_ADMIN" ? "bg-primary/10 text-primary ring-primary/20" : "bg-muted text-muted-foreground ring-white/5"
                        )}>
                            {user?.role === "SUPER_ADMIN" ? "System Core" : "Enterprise"}
                        </span>
                        <span className="text-sm font-black tracking-tight">{user?.username || "Guest User"}</span>
                    </div>

                    <div className="relative group/profile">
                        <button className="w-11 h-11 rounded-2xl bg-muted border-2 border-transparent hover:border-primary flex items-center justify-center transition-all font-black text-lg overflow-hidden relative">
                            {user?.role === "SUPER_ADMIN" ? <ShieldCheck className="text-primary" /> : (user?.username?.[0] || "?")}
                        </button>

                        {/* Dropdown menu */}
                        <div className="absolute right-0 top-full pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/profile:opacity-100 group-hover/profile:translate-y-0 group-hover/profile:pointer-events-auto transition-all transition-duration-300">
                            <div className="w-48 bg-card border rounded-2xl shadow-2xl p-2 font-outfit">
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-colors text-sm font-black"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
