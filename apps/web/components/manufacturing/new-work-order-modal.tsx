"use client";

import React, { useEffect, useState } from "react";
import { X, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

interface NewWorkOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

import { api } from "@/app/lib/api";

export function NewWorkOrderModal({ isOpen, onClose, onSuccess }: NewWorkOrderModalProps) {
    const [code, setCode] = useState("");
    const [selectedProductId, setSelectedProductId] = useState("");
    const [selectedFormulaId, setSelectedFormulaId] = useState("");
    const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState(1);
    const [notes, setNotes] = useState("");
    const [assignedToId, setAssignedToId] = useState("");

    // Data
    const [products, setProducts] = useState<any[]>([]);
    const [formulas, setFormulas] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [filteredFormulas, setFilteredFormulas] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        try {
            setLoadingData(true);
            const [prodData, formData, whData, userData] = await Promise.all([
                api.get<any[]>('/products?hasFormula=true'),
                api.get<any[]>('/manufacturing/formulas'),
                api.get<any[]>('/warehouses').catch(() => []),
                api.get<any[]>('/auth/users').catch(() => [])
            ]);

            setProducts(prodData || []);
            setFormulas(formData || []);
            setUsers(userData || []);
            if (Array.isArray(whData)) {
                setWarehouses(whData);
                if (whData.length > 0) setSelectedWarehouseId(whData[0].id);
            }

        } catch (e) {
            console.error(e);
        } finally {
            setLoadingData(false);
        }
    };

    // Filter formulas when product changes
    useEffect(() => {
        if (selectedProductId) {
            const applicable = formulas.filter(f => f.productId === selectedProductId);
            setFilteredFormulas(applicable);
            if (applicable.length === 1) {
                setSelectedFormulaId(applicable[0].id);
            } else {
                setSelectedFormulaId("");
            }
        } else {
            setFilteredFormulas([]);
        }
    }, [selectedProductId, formulas]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId || !selectedFormulaId || quantity <= 0) return;

        try {
            setSubmitting(true);
            const payload = {
                code: code || `WO-${Date.now()}`,
                productId: selectedProductId,
                quantity,
                startDate,
                dueDate: dueDate || undefined,
                bomId: selectedFormulaId,
                warehouseId: selectedWarehouseId,
                assignedToId: assignedToId || undefined,
                priority,
                notes
            };

            await api.post('/manufacturing/work-orders', payload);
            onSuccess();
            onClose();
            // Reset
            setSelectedProductId("");
            setQuantity(1);
            setCode("");
            setPriority(1);
            setNotes("");
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
                className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl border flex flex-col max-h-[90vh] overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between bg-muted/30">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Create Work Order</h2>
                        <p className="text-muted-foreground">Schedule production for a product.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Work Order Code</label>
                            <input
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                placeholder="Leave blank for auto-gen"
                                className="w-full h-12 rounded-xl border bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Priority Level</label>
                            <select
                                value={priority}
                                onChange={e => setPriority(Number(e.target.value))}
                                className="w-full h-12 rounded-xl border bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                            >
                                <option value={1}>Low Priority</option>
                                <option value={2}>Normal Priority</option>
                                <option value={3}>Medium Priority</option>
                                <option value={4}>High Priority</option>
                                <option value={5}>Critical Priority</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold ml-1">Product to Produce</label>
                        <select
                            required
                            value={selectedProductId}
                            onChange={e => setSelectedProductId(e.target.value)}
                            className="w-full h-12 rounded-xl border bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        >
                            <option value="">Select Product...</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                        </select>
                    </div>

                    {selectedProductId && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold ml-1">Bill of Materials (Formula)</label>
                                <select
                                    required
                                    value={selectedFormulaId}
                                    onChange={e => setSelectedFormulaId(e.target.value)}
                                    className="w-full h-12 rounded-xl border bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                >
                                    <option value="">Select Formula...</option>
                                    {filteredFormulas.map(f => (
                                        <option key={f.id} value={f.id}>{f.name} (Yield: {f.yieldQuantity})</option>
                                    ))}
                                </select>
                                {filteredFormulas.length === 0 && (
                                    <p className="text-xs text-red-500 font-bold ml-1">No formulas found for this product. Create one first.</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold ml-1">Target Warehouse</label>
                                <select
                                    required
                                    value={selectedWarehouseId}
                                    onChange={e => setSelectedWarehouseId(e.target.value)}
                                    className="w-full h-12 rounded-xl border bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                >
                                    <option value="">Select Warehouse...</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Quantity to Produce</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={quantity}
                                onChange={e => setQuantity(Number(e.target.value))}
                                className="w-full h-12 rounded-xl border bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Assigned Technician</label>
                            <select
                                value={assignedToId}
                                onChange={e => setAssignedToId(e.target.value)}
                                className="w-full h-12 rounded-xl border bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                            >
                                <option value="">Select Staff...</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Scheduled Start Date</label>
                            <input
                                type="date"
                                required
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full h-12 rounded-xl border bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Expected Completion</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                className="w-full h-12 rounded-xl border bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold ml-1">Production Notes</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Add any special instructions for the workshop..."
                            className="w-full min-h-[80px] py-3 rounded-xl border bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                        />
                    </div>

                </form>

                {/* Footer */}
                <div className="p-6 border-t bg-muted/30 flex justify-end items-center gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-bold hover:bg-muted transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !selectedProductId || !selectedFormulaId}
                        className={cn(
                            "px-8 py-3 rounded-xl bg-amber-500 text-white font-bold shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2",
                            (submitting || !selectedProductId || !selectedFormulaId) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {submitting ? "Scheduling..." : "Create Work Order"}
                        <ArrowRight size={18} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
