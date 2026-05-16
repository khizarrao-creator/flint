"use client";

import React, { useEffect, useState } from "react";
import {
    Activity,
    Plus,
    Search,
    Loader2,
    FileText,
    ChevronRight,
    Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/app/lib/utils";
import { api } from "@/app/lib/api";
import Link from "next/link";
import { NewFormulaModal } from "@/components/manufacturing/new-formula-modal";
import { useAuth } from "@/app/lib/auth-context";

export default function FormulasPage() {
    const { user } = useAuth();
    const canWrite = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "SUPER_ADMIN";

    const [formulas, setFormulas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchFormulas();
    }, []);

    const fetchFormulas = async () => {
        try {
            setLoading(true);
            const data = await api.get<any[]>('/manufacturing/formulas');
            setFormulas(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch formulas:', error);
            setFormulas([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-500 font-bold tracking-widest text-xs uppercase">
                        <Link href="/manufacturing" className="hover:underline">Manufacturing</Link> / BOM
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Formulas</h1>
                    <p className="text-muted-foreground">Manage Bill of Materials for your products.</p>
                </div>
                {canWrite && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 h-14 rounded-2xl bg-indigo-500 text-white font-black shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Plus size={22} />
                        New Formula
                    </button>
                )}
            </section>

            <div className="space-y-4 font-outfit">
                <AnimatePresence>
                    {loading ? (
                        <Loader2 className="animate-spin mx-auto text-indigo-500" />
                    ) : formulas.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center bg-card border border-dashed rounded-[2.5rem] text-muted-foreground space-y-4 font-bold">
                            <FileText size={48} className="opacity-20" />
                            <p>No formulas defined yet.</p>
                        </div>
                    ) : (
                        formulas.map((formula, i) => (
                            <motion.div
                                key={formula.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="group bg-card border rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:border-indigo-500/10 transition-all relative overflow-hidden"
                            >
                                {!formula.isActive && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-muted/50" />
                                )}
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                                        formula.isActive ? "bg-indigo-500/10 text-indigo-500" : "bg-muted text-muted-foreground/50"
                                    )}>
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-black tracking-tight leading-none">{formula.name}</h3>
                                            <span className="px-2 py-0.5 bg-muted rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                v{formula.version}
                                            </span>
                                            {formula.isActive && (
                                                <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground font-bold">{formula.product?.name} ({formula.product?.sku})</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Components</p>
                                        <p className="font-bold text-lg">{formula.items?.length || 0}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Yield</p>
                                        <p className="font-bold text-lg">{formula.yieldQuantity} Units</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => {
                                                const v = prompt("Enter new version number:", (parseFloat(formula.version) + 0.1).toFixed(1));
                                                if (v) {
                                                    api.post(`/manufacturing/formulas/${formula.id}/clone`, { version: v }).then(fetchFormulas);
                                                }
                                            }}
                                            className="px-4 py-2 bg-muted hover:bg-indigo-500/10 hover:text-indigo-500 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                        >
                                            Clone
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if(confirm("Are you sure? This will remove the formula and all its items.")) {
                                                    api.delete(`/manufacturing/formulas/${formula.id}`).then(fetchFormulas);
                                                }
                                            }}
                                            className="p-2 text-muted-foreground hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <NewFormulaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchFormulas}
            />
        </div>
    );
}
