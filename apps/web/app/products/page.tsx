"use client";

import React, { useEffect, useState } from "react";
import {
    Package,
    Search,
    Plus,
    Loader2,
    Filter,
    MoreVertical,
    AlertTriangle,
    Edit,
    Trash2,
    Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/app/lib/utils";
import { ProductModal } from "@/components/products/product-modal";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/lib/auth-context";
import Link from "next/link";

export default function ProductsPage() {
    const { user } = useAuth();
    const canWrite = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "SUPER_ADMIN";
    const canDelete = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean, product?: any }>({
        isOpen: false
    });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await api.get<any[]>('/products');
            if (Array.isArray(data)) {
                setProducts(data);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string) => {
        if (!canDelete) return;
        if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (error) {
            console.error('Failed to delete product:', error);
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
                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                        <div className="w-4 h-[2px] bg-primary" />
                        Flint Inventory
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Product Catalog</h1>
                    <p className="text-muted-foreground">Manage your SKUs, pricing, and stock levels.</p>
                </div>

                {canWrite && (
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/products/categories"
                            className="flex items-center gap-2 px-6 h-14 rounded-2xl bg-muted border font-bold hover:bg-muted/80 transition-all shadow-sm"
                        >
                            <Tag size={20} className="text-primary" />
                            Categories
                        </Link>
                        <Link
                            href="/products/brands"
                            className="flex items-center gap-2 px-6 h-14 rounded-2xl bg-muted border font-bold hover:bg-muted/80 transition-all shadow-sm"
                        >
                            <Tag size={20} className="text-primary" />
                            Brands
                        </Link>
                        <Link
                            href="/products/units"
                            className="flex items-center gap-2 px-6 h-14 rounded-2xl bg-muted border font-bold hover:bg-muted/80 transition-all shadow-sm"
                        >
                            <Tag size={20} className="text-primary" />
                            Units
                        </Link>
                        <Link
                            href="/products/tax-rates"
                            className="flex items-center gap-2 px-6 h-14 rounded-2xl bg-muted border font-bold hover:bg-muted/80 transition-all shadow-sm"
                        >
                            <Tag size={20} className="text-primary" />
                            Taxes
                        </Link>
                        <button
                            onClick={() => setModalConfig({ isOpen: true })}
                            className="flex items-center gap-2 px-6 h-14 rounded-2xl bg-primary text-primary-foreground font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all ml-auto"
                        >
                            <Plus size={22} />
                            Register SKU
                        </button>
                    </div>
                )}
            </section>

            <section className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by SKU or Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-16 bg-card border rounded-2xl pl-14 pr-6 font-bold outline-none focus:border-primary/50 transition-all shadow-sm"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-6 h-16 rounded-2xl bg-muted border font-bold hover:bg-muted/80 transition-all">
                    <Filter size={20} />
                    Filters
                </button>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-outfit">
                <AnimatePresence>
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-[280px] rounded-3xl bg-card border animate-pulse border-border/50" />
                        ))
                    ) : filteredProducts.length === 0 ? (
                        <div className="col-span-full h-80 flex flex-col items-center justify-center bg-card border border-dashed rounded-[2.5rem] text-muted-foreground space-y-4 font-bold">
                            <Package size={48} className="opacity-20" />
                            <p className="text-xl">No products matched your search.</p>
                        </div>
                    ) : (
                        filteredProducts.map((product, i) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2, delay: i * 0.05 }}
                                className="group bg-card border rounded-[2rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />

                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-muted group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center text-muted-foreground transition-all duration-500">
                                        <Package size={28} />
                                    </div>
                                    <div className="flex gap-2">
                                        {canWrite && (
                                            <button
                                                onClick={() => setModalConfig({ isOpen: true, product })}
                                                className="p-3 bg-muted hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-3 bg-muted hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight leading-none mb-1">{product.name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">{product.sku}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-muted/30 border border-transparent group-hover:border-primary/10 transition-all">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter mb-1">Stock</p>
                                            <div className="flex items-center gap-2 font-black">
                                                <span className={cn(
                                                    "text-lg",
                                                    Number(product.stockQuantity) <= Number(product.minStockLevel) ? "text-rose-500" : "text-foreground"
                                                )}>
                                                    {parseFloat(product.stockQuantity).toLocaleString()}
                                                </span>
                                                {Number(product.stockQuantity) <= Number(product.minStockLevel) && (
                                                    <AlertTriangle size={14} className="text-rose-500" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-muted/30 border border-transparent group-hover:border-primary/10 transition-all text-right font-black">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter mb-1">Price</p>
                                            <span className="text-lg text-primary">
                                                ${parseFloat(product.basePrice).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex items-center justify-between border-t border-white/5 mt-2">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                            {product.category?.name || "General Goods"}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-tighter px-2 py-0.5 bg-emerald-500/10 rounded-full">
                                            Operational
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <ProductModal
                isOpen={modalConfig.isOpen}
                product={modalConfig.product}
                onClose={() => setModalConfig({ isOpen: false })}
                onSuccess={fetchProducts}
            />
        </div>
    );
}
