"use client";

import React, { useEffect, useState } from "react";
import { X, ArrowRight, Loader2, Monitor } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/app/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

interface NewAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

import { api } from "@/app/lib/api";

export function NewAssetModal({ isOpen, onClose, onSuccess }: NewAssetModalProps) {
    const [name, setName] = useState("");
    const [value, setValue] = useState(0);
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || value < 0) return;

        try {
            setSubmitting(true);
            const payload = {
                name,
                value,
                purchaseDate: new Date(purchaseDate).toISOString(),
                status: 'Active',
            };

            await api.post('/assets', payload);
            onSuccess();
            onClose();
            setName("");
            setValue(0);
        } catch (error) {
            console.error('Failed to register asset:', error);
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
                className="bg-card w-full max-w-lg rounded-3xl shadow-2xl border flex flex-col max-h-[90vh] overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                            <Monitor size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Register Asset</h2>
                            <p className="text-xs text-muted-foreground font-bold">Add fixed asset to registry.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">

                    <div className="space-y-2">
                        <label className="text-sm font-bold ml-1">Asset Name</label>
                        <input
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. MacBook Pro M3"
                            className="w-full h-12 rounded-xl border bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Purchase Value ($)</label>
                            <input
                                type="number"
                                min="0"
                                required
                                value={value}
                                onChange={e => setValue(Number(e.target.value))}
                                className="w-full h-12 rounded-xl border bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Purchase Date</label>
                            <input
                                type="date"
                                required
                                value={purchaseDate}
                                onChange={e => setPurchaseDate(e.target.value)}
                                className="w-full h-12 rounded-xl border bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all date-picker-indicator"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                        <p className="text-xs text-muted-foreground font-medium text-center">
                            This asset will be automatically filed under <span className="text-indigo-500 font-bold">General Assets</span>.
                        </p>
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
                        disabled={submitting || !name}
                        className={cn(
                            "px-8 py-3 rounded-xl bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2",
                            (submitting || !name) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {submitting ? "Registering..." : "Register Asset"}
                        <ArrowRight size={18} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
