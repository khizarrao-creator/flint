"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/app/lib/theme-context";
import { Check, Palette, Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/app/lib/utils";

const THEMES = [
    { id: "default", name: "Fiery Flint", primary: "#f97316", ring: "#fb923c" },
    { id: "ocean", name: "Oceanic Depths", primary: "#3b82f6", ring: "#60a5fa" },
    { id: "midnight", name: "Royal Violet", primary: "#8b5cf6", ring: "#a78bfa" },
    { id: "emerald", name: "Emerald Forest", primary: "#10b981", ring: "#34d399" },
    { id: "crimson", name: "Crimson Guard", primary: "#ef4444", ring: "#f87171" },
    { id: "gold", name: "Midas Touch", primary: "#eab308", ring: "#facc15" },
    { id: "rose", name: "Midnight Rose", primary: "#f43f5e", ring: "#fb7185" },
];

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="space-y-10 max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3 text-primary font-black tracking-[0.3em] text-xs uppercase italic py-2">
                    <Palette size={16} /> Personalization
                </div>
                <h1 className="text-5xl font-black tracking-tighter">System Appearance</h1>
                <p className="text-muted-foreground font-medium text-lg">Customize the interface to match your brand or personal preference.</p>
            </div>

            {/* Theme Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {THEMES.map((t, i) => (
                    <motion.button
                        key={t.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setTheme(t.id as any)}
                        className={cn(
                            "group relative overflow-hidden rounded-[2rem] border transition-all duration-300 text-left p-6 h-48 flex flex-col justify-between",
                            theme === t.id
                                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                                : "border-white/5 bg-card hover:border-white/10 hover:bg-white/5"
                        )}
                    >
                        {/* Fake UI Elements for Preview */}
                        <div className="space-y-3 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: t.primary }}>
                                    <Palette size={14} />
                                </div>
                                <div className="h-2 w-20 bg-muted rounded-full" />
                            </div>
                            <div className="h-2 w-32 bg-muted/50 rounded-full" />
                            <div className="flex gap-2 mt-4">
                                <div className="h-8 w-20 rounded-lg opacity-80" style={{ backgroundColor: t.primary }} />
                                <div className="h-8 w-8 rounded-lg bg-muted" />
                            </div>
                        </div>

                        <div className="flex items-end justify-between relative z-10">
                            <div>
                                <h3 className={cn(
                                    "font-black text-lg transition-colors",
                                    theme === t.id ? "text-primary" : "text-foreground"
                                )}>
                                    {t.name}
                                </h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Theme Preset</p>
                            </div>
                            {theme === t.id && (
                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transform translate-x-1 translate-y-1">
                                    <Check size={16} strokeWidth={4} />
                                </div>
                            )}
                        </div>

                        {/* Background Glow */}
                        <div
                            className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                            style={{ backgroundColor: t.primary }}
                        />
                    </motion.button>
                ))}
            </div>

            {/* Mode Switcher (Future Proofing) */}
            <div className="p-8 rounded-[2.5rem] bg-card border border-white/5 space-y-6">
                <div className="flex items-center gap-3">
                    <Monitor size={24} className="text-muted-foreground" />
                    <div>
                        <h3 className="font-black text-xl">Interface Mode</h3>
                        <p className="text-sm text-muted-foreground font-medium">Select your preferred lighting environment.</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <button className="h-32 rounded-3xl bg-muted/20 border-2 border-primary relative overflow-hidden flex flex-col items-center justify-center gap-3 hover:bg-muted/30 transition-all">
                        <Moon size={32} className="text-primary" />
                        <span className="font-black text-sm">Dark Mode</span>
                        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" />
                    </button>
                    <button className="h-32 rounded-3xl bg-muted/5 border-2 border-transparent relative overflow-hidden flex flex-col items-center justify-center gap-3 opacity-50 cursor-not-allowed">
                        <Sun size={32} />
                        <span className="font-black text-sm">Light Mode</span>
                        <div className="absolute top-3 right-3 text-[10px] bg-muted px-2 py-1 rounded-md font-bold">SOON</div>
                    </button>
                    <button className="h-32 rounded-3xl bg-muted/5 border-2 border-transparent relative overflow-hidden flex flex-col items-center justify-center gap-3 opacity-50 cursor-not-allowed">
                        <Monitor size={32} />
                        <span className="font-black text-sm">System</span>
                        <div className="absolute top-3 right-3 text-[10px] bg-muted px-2 py-1 rounded-md font-bold">SOON</div>
                    </button>
                </div>
            </div>
        </div>
    );
}
