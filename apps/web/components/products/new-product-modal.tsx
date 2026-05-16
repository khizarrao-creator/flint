"use client";

import React, { useState } from "react";
import { X, Plus, Loader2, Package, Tag, DollarSign, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NewProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

import { api } from "@/app/lib/api";

export function NewProductModal({ isOpen, onClose, onSuccess }: NewProductModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        basePrice: 0,
        costPrice: 0,
        stockQuantity: 0,
        minStockLevel: 5
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.post('/products', formData);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create product:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-xl bg-card border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
                >
                    <div className="p-8 border-b flex items-center justify-between bg-muted/30">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                                    <Package size={24} />
                                </div>
                                Register New SKU
                            </h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Tag size={12} /> Product Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SKU Code</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sales Price ($)</label>
                                <input
                                    required
                                    type="number"
                                    value={formData.basePrice}
                                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                                    className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stock Quantity</label>
                                <input
                                    required
                                    type="number"
                                    value={formData.stockQuantity}
                                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseFloat(e.target.value) })}
                                    className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Min Stock Level</label>
                                <input
                                    required
                                    type="number"
                                    value={formData.minStockLevel}
                                    onChange={(e) => setFormData({ ...formData, minStockLevel: parseFloat(e.target.value) })}
                                    className="w-full h-14 bg-muted/50 border rounded-2xl px-6 font-bold outline-none focus:border-primary/50"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <> <Plus size={22} /> Register SKU </>}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
