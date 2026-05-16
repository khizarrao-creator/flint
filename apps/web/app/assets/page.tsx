"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Plus,
    Search,
    Loader2,
    Monitor,
    Trash2,
    Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/app/lib/utils";
import { api } from "@/app/lib/api";
import { NewAssetModal } from "@/components/assets/new-asset-modal";
import { useAuth } from "@/app/lib/auth-context";

export default function AssetsPage() {
    const { user } = useAuth();
    const canWrite = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "SUPER_ADMIN";

    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            setLoading(true);
            const data = await api.get<any[]>('/assets');
            setAssets(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch assets:', error);
            setAssets([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredAssets = assets.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-500 font-bold tracking-widest text-xs uppercase">
                        <div className="w-4 h-[2px] bg-indigo-500" />
                        Fixed Assets
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Asset Registry</h1>
                    <p className="text-muted-foreground">Track equipment, machinery, and depreciation.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search Assets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 h-14 bg-card border rounded-2xl pl-14 pr-6 font-bold outline-none focus:border-indigo-500/50 transition-all shadow-sm"
                        />
                    </div>
                    {canWrite && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-6 h-14 rounded-2xl bg-indigo-500 text-white font-black shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <Plus size={22} />
                            New Asset
                        </button>
                    )}
                </div>
            </section>

            <div className="space-y-4 font-outfit">
                <AnimatePresence>
                    {loading ? (
                        <Loader2 className="animate-spin mx-auto text-indigo-500" />
                    ) : filteredAssets.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center bg-card border border-dashed rounded-[2.5rem] text-muted-foreground space-y-4 font-bold">
                            <Monitor size={48} className="opacity-20" />
                            <p>No assets registered yet.</p>
                        </div>
                    ) : (
                        filteredAssets.map((asset, i) => (
                            <motion.div
                                key={asset.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="group bg-card border rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:border-indigo-500/10 transition-all"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                                        <Monitor size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight leading-none mb-1">{asset.name}</h3>
                                        <p className="text-sm text-muted-foreground font-bold">{asset.category?.name || "General"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8 md:gap-12">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Original Value</p>
                                        <p className="text-lg font-black text-indigo-500">${parseFloat(asset.value).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</p>
                                        <span className={cn(
                                            "inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border",
                                            asset.status === 'Active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                        )}>
                                            {asset.status}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
            <NewAssetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchAssets}
            />
        </div>
    );
}
