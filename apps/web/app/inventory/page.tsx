"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/lib/auth-context";
import {
    Box,
    Search,
    Loader2,
    ArrowUp,
    ArrowDown,
    RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/app/lib/utils";
import { api } from "@/app/lib/api";

export default function InventoryPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const data = await api.get<any[]>('/products');
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch inventory:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-500 font-bold tracking-widest text-xs uppercase">
                        <div className="w-4 h-[2px] bg-emerald-500" />
                        Stock Control
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Inventory Intelligence</h1>
                    <p className="text-muted-foreground">Real-time stock levels, valuation, and threshold alerts.</p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-80 h-14 bg-card border rounded-2xl pl-14 pr-6 font-bold outline-none focus:border-emerald-500/50 transition-all shadow-sm"
                    />
                </div>
            </section>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-emerald-500 text-white rounded-[2rem] p-8 shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Total Valuation</p>
                    <h2 className="text-4xl font-black tracking-tighter">
                        ${products.reduce((acc, p) => acc + (Number(p.stockQuantity) * Number(p.costPrice || p.basePrice)), 0).toLocaleString()}
                    </h2>
                    <p className="text-[10px] mt-4 font-black uppercase opacity-60">Estimated Asset Value</p>
                </div>

                <div className="bg-card border rounded-[2rem] p-8 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Low Stock Alerts</p>
                    <h2 className={cn(
                        "text-4xl font-black tracking-tighter",
                        products.filter(p => Number(p.stockQuantity) <= Number(p.minStockLevel || 10)).length > 0 ? "text-rose-500" : "text-foreground"
                    )}>
                        {products.filter(p => Number(p.stockQuantity) <= Number(p.minStockLevel || 10)).length}
                    </h2>
                    <p className="text-[10px] mt-4 font-black uppercase text-muted-foreground/60 tracking-widest">Requiring Restock</p>
                </div>

                <div className="bg-card border rounded-[2rem] p-8 shadow-sm relative overflow-hidden group">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Active SKUs</p>
                    <h2 className="text-4xl font-black tracking-tighter">
                        {products.length}
                    </h2>
                    <p className="text-[10px] mt-4 font-black uppercase text-muted-foreground/60 tracking-widest">Catalog Depth</p>
                </div>

                <div className="bg-card border rounded-[2rem] p-8 shadow-sm relative overflow-hidden group">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Units</p>
                    <h2 className="text-4xl font-black tracking-tighter">
                        {products.reduce((acc, p) => acc + Number(p.stockQuantity), 0).toLocaleString()}
                    </h2>
                    <p className="text-[10px] mt-4 font-black uppercase text-muted-foreground/60 tracking-widest">Physical Volume</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-outfit">
                <AnimatePresence>
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-40 bg-card border rounded-3xl animate-pulse" />
                        ))
                    ) : filteredProducts.length === 0 ? (
                        <div className="col-span-full h-64 flex flex-col items-center justify-center bg-card border border-dashed rounded-[2.5rem] text-muted-foreground space-y-4 font-bold">
                            <Box size={48} className="opacity-20" />
                            <p>No inventory found.</p>
                        </div>
                    ) : (
                        filteredProducts.map((product, i) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-card border rounded-3xl p-6 hover:shadow-xl hover:border-emerald-500/10 transition-all flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xs">
                                            SKU
                                        </div>
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                            Number(product.stockQuantity) > 10 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                        )}>
                                            {Number(product.stockQuantity) > 10 ? "In Stock" : "Low Stock"}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black mb-1 line-clamp-1" title={product.name}>{product.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase">{product.sku}</p>
                                        <span className="w-1 h-1 rounded-full bg-border" />
                                        <p className="text-[10px] font-black uppercase text-emerald-500/60">{product.category?.name || "General"}</p>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-dashed flex items-end justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">On Hand</p>
                                        <p className="text-3xl font-black text-foreground">{Number(product.stockQuantity)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Base Value</p>
                                        <p className="text-lg font-bold text-emerald-500">${Number(product.basePrice).toLocaleString()}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
