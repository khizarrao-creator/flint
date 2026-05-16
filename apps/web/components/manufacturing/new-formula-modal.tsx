"use client";

import React, { useEffect, useState } from "react";
import { X, Plus, Trash2, Search, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

interface NewFormulaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

import { api } from "@/app/lib/api";

export function NewFormulaModal({ isOpen, onClose, onSuccess }: NewFormulaModalProps) {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [selectedProductId, setSelectedProductId] = useState("");
    const [yieldQuantity, setYieldQuantity] = useState(1);
    const [yieldPercentage, setYieldPercentage] = useState(100);
    const [description, setDescription] = useState("");
    const [type, setType] = useState("MANUFACTURING");

    const [items, setItems] = useState<{ productId: string; quantity: number; unitCost: number }[]>([]);

    // Data
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await api.get<any[]>('/products');
            setProducts(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to fetch products:', e);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        setItems([...items, { productId: "", quantity: 1, unitCost: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'productId') {
            const prod = products.find(p => p.id === value);
            if (prod) {
                newItems[index].unitCost = Number(prod.costPrice) || 0;
            }
        }

        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !selectedProductId) return;

        try {
            setSubmitting(true);
            const payload = {
                name,
                code: code || `BOM-${Date.now()}`,
                productId: selectedProductId,
                yieldQuantity,
                yield: yieldPercentage,
                description,
                type,
                items: items.filter(i => i.productId && i.quantity > 0)
            };

            await api.post('/manufacturing/formulas', payload);
            onSuccess();
            onClose();
            // Reset form
            setName("");
            setCode("");
            setSelectedProductId("");
            setItems([]);
            setYieldPercentage(100);
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card w-full max-w-4xl rounded-3xl shadow-2xl border flex flex-col max-h-[90vh] overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between bg-muted/30">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">New Bill of Materials (BOM)</h2>
                        <p className="text-muted-foreground">Define the recipe for a product.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Formula Name</label>
                            <input
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. Standard Laptop Assembly"
                                className="w-full h-12 rounded-xl border bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Internal BOM Code</label>
                            <input
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                placeholder="Leave blank for auto-gen"
                                className="w-full h-12 rounded-xl border bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Output Product</label>
                            <select
                                required
                                value={selectedProductId}
                                onChange={e => setSelectedProductId(e.target.value)}
                                className="w-full h-12 rounded-xl border bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            >
                                <option value="">Select Product...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Recipe Type</label>
                            <select
                                required
                                value={type}
                                onChange={e => setType(e.target.value)}
                                className="w-full h-12 rounded-xl border bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            >
                                <option value="MANUFACTURING">Manufacturing</option>
                                <option value="ASSEMBLY">Assembly</option>
                                <option value="DISASSEMBLY">Disassembly</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Standard Batch Size (Yield Qty)</label>
                            <input
                                type="number"
                                min="1"
                                value={yieldQuantity}
                                onChange={e => setYieldQuantity(Number(e.target.value))}
                                className="w-full h-12 rounded-xl border bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                            <p className="text-xs text-muted-foreground ml-1">How many units does this recipe produce?</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Expected Yield (%)</label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={yieldPercentage}
                                onChange={e => setYieldPercentage(Number(e.target.value))}
                                className="w-full h-12 rounded-xl border bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                            <p className="text-xs text-muted-foreground ml-1">Planned efficiency (usually 100%)</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold ml-1">Formula Notes / Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Add any special instructions or technical notes..."
                            className="w-full min-h-[100px] py-3 rounded-xl border bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                        />
                    </div>

                    <div className="h-px bg-border" />

                    {/* Ingredients */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Raw Materials / Components</h3>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="text-sm font-bold text-indigo-500 hover:bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Plus size={16} /> Add Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-4 items-end bg-muted/20 p-4 rounded-xl">
                                    <div className="col-span-6 space-y-1">
                                        <label className="text-xs font-bold text-muted-foreground">Item</label>
                                        <select
                                            value={item.productId}
                                            onChange={e => handleItemChange(index, 'productId', e.target.value)}
                                            className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-indigo-500 transition-all"
                                        >
                                            <option value="">Select Ingredient...</option>
                                            {products.filter(p => p.id !== selectedProductId).map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.stockQuantity} on hand)</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-3 space-y-1">
                                        <label className="text-xs font-bold text-muted-foreground">Qty Required</label>
                                        <input
                                            type="number"
                                            min="0.1"
                                            step="0.1"
                                            value={item.quantity}
                                            onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))}
                                            className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-xs font-bold text-muted-foreground">Est. Cost</label>
                                        <div className="h-10 flex items-center text-sm font-medium text-muted-foreground">
                                            ${(item.unitCost * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="col-span-1 flex justify-end pb-2">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            className="text-muted-foreground hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm italic bg-muted/20 rounded-xl border border-dashed">
                                    No ingredients added.
                                </div>
                            )}
                        </div>
                    </div>

                </form>

                {/* Footer */}
                <div className="p-6 border-t bg-muted/30 flex justify-between items-center">
                    <div className="text-sm font-medium text-muted-foreground">
                        Total Est. Cost: <span className="text-foreground font-bold">${items.reduce((acc, i) => acc + (i.unitCost * i.quantity), 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-bold hover:bg-muted transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !name || !selectedProductId || items.length === 0}
                            className={cn(
                                "px-8 py-3 rounded-xl bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2",
                                (submitting || items.length === 0) && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {submitting ? "Saving..." : "Create Formula"}
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
