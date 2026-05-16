"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/lib/auth-context";
import {
    Activity,
    Plus,
    Box,
    FileText,
    ArrowRight,
    Loader2,
    Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/app/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export default function ManufacturingPage() {
    const { user } = useAuth();
    const tenantId = user?.tenantId || "";

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-500 font-bold tracking-widest text-xs uppercase">
                        <div className="w-4 h-[2px] bg-indigo-500" />
                        Production Control
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Manufacturing</h1>
                    <p className="text-muted-foreground">Manage your Bills of Materials (BOM) and production schedules.</p>
                </div>
            </section>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-outfit">
                <Link href="/manufacturing/formulas" className="group">
                    <div className="h-full bg-card border rounded-[2rem] p-8 hover:shadow-xl hover:border-indigo-500/20 transition-all cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[100px] -mr-8 -mt-8" />

                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <FileText size={32} />
                        </div>

                        <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                            Formulas
                            <ArrowRight size={20} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-500" />
                        </h3>
                        <p className="text-sm text-muted-foreground font-bold">Define recipes and BOM.</p>
                    </div>
                </Link>

                <Link href="/manufacturing/work-orders" className="group">
                    <div className="h-full bg-card border rounded-[2rem] p-8 hover:shadow-xl hover:border-amber-500/20 transition-all cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-[100px] -mr-8 -mt-8" />

                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Activity size={32} />
                        </div>

                        <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                            Work Orders
                            <ArrowRight size={20} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-amber-500" />
                        </h3>
                        <p className="text-sm text-muted-foreground font-bold">Track production status.</p>
                    </div>
                </Link>

                <Link href="/manufacturing/calendar" className="group">
                    <div className="h-full bg-card border rounded-[2rem] p-8 hover:shadow-xl hover:border-emerald-500/20 transition-all cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] -mr-8 -mt-8" />

                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Calendar size={32} />
                        </div>

                        <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                            Schedule
                            <ArrowRight size={20} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500" />
                        </h3>
                        <p className="text-sm text-muted-foreground font-bold">Visual production timeline.</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
