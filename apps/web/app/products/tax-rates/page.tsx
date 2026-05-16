
"use client";

import React, { useEffect, useState } from "react";
import {
    Percent,
    Search,
    Plus,
    Loader2,
    Trash2,
    Edit2,
    ChevronRight,
    Calculator,
    Save,
    X,
    Receipt,
    ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/lib/auth-context";
import Link from "next/link";
import { cn } from "@/app/lib/utils";

interface TaxRate {
    id: string;
    name: string;
    rate: number;
    code: string;
    description: string | null;
    isActive: boolean;
}

export default function TaxRatesPage() {
    const { user } = useAuth();
    const canWrite = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "SUPER_ADMIN";
    const canDelete = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    const [rates, setRates] = useState<TaxRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Inline Form State
    const [formData, setFormData] = useState({
        name: "",
        rate: 0,
        code: "",
        description: ""
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchRates = async () => {
        try {
            setLoading(true);
            const data = await api.get<TaxRate[]>('/tax-rates');
            if (Array.isArray(data)) {
                setRates(data);
            } else {
                setRates([]);
            }
        } catch (error) {
            console.error('Failed to fetch tax rates:', error);
            setRates([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canWrite) return;
        if (!formData.name || !formData.code) return;

        try {
            setIsSaving(true);
            const payload = {
                ...formData,
                rate: parseFloat(formData.rate.toString())
            };

            if (editingId) {
                await api.put(`/tax-rates/${editingId}`, payload);
            } else {
                await api.post('/tax-rates', payload);
            }

            setFormData({ name: "", rate: 0, code: "", description: "" });
            setEditingId(null);
            fetchRates();
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Operation failed");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (rate: TaxRate) => {
        if (!canWrite) return;
        setEditingId(rate.id);
        setFormData({
            name: rate.name,
            rate: rate.rate,
            code: rate.code,
            description: rate.description || ""
        });
    };

    const handleDelete = async (id: string) => {
        if (!canDelete) return;
        if (!confirm("Are you sure? Tax rates used in previous transactions should be deactivated instead of deleted.")) return;
        try {
            await api.delete(`/tax-rates/${id}`);
            fetchRates();
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to delete");
        }
    };

    const filteredRates = rates.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                        <Link href="/products" className="hover:underline">Inventory</Link> / Tax Rates
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Tax Configuration</h1>
                    <p className="text-muted-foreground">Manage regional tax rates and VAT codes for automated invoicing.</p>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Form Section */}
                <div className="lg:col-span-4 space-y-6">
                    {canWrite && (
                        <div className="bg-card border rounded-[2rem] p-8 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-primary/10" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                                        {editingId ? <Edit2 size={20} /> : <Percent size={20} />}
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight">
                                        {editingId ? "Update Rate" : "Quick Add"}
                                    </h3>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tax Code</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. VAT15"
                                                value={formData.code}
                                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                                className="w-full h-12 bg-muted/50 border rounded-xl px-4 font-bold outline-none focus:border-primary/50 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Percentage (%)</label>
                                            <input
                                                required
                                                type="number"
                                                step="0.01"
                                                placeholder="15.00"
                                                value={formData.rate}
                                                onChange={e => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                                                className="w-full h-12 bg-muted/50 border rounded-xl px-4 font-bold outline-none focus:border-primary/50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Descriptive Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Standard VAT (15%)"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full h-12 bg-muted/50 border rounded-xl px-4 font-bold outline-none focus:border-primary/50 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description (Optional)</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Applicable to standard goods..."
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-muted/50 border rounded-xl p-4 font-bold outline-none focus:border-primary/50 transition-all resize-none text-sm"
                                        />
                                    </div>

                                    <div className="pt-4 flex gap-2">
                                        {editingId && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setFormData({ name: "", rate: 0, code: "", description: "" });
                                                }}
                                                className="flex-1 h-12 rounded-xl border font-black text-xs uppercase tracking-widest hover:bg-muted transition-all"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            disabled={isSaving}
                                            type="submit"
                                            className="flex-[2] h-12 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : (editingId ? "Save Changes" : "Register Tax Rate")}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="p-6 bg-muted/30 border border-dashed rounded-[2rem] text-center space-y-2">
                        <Receipt size={24} className="mx-auto text-muted-foreground opacity-50" />
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Compliance Tip</p>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed font-semibold">Accurate tax codes are required for cross-border trade and official financial reporting.</p>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter by name or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-14 bg-card border rounded-2xl pl-14 pr-6 font-bold outline-none focus:border-primary/50 transition-all shadow-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-outfit">
                        <AnimatePresence>
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-40 rounded-3xl bg-card border animate-pulse" />
                                ))
                            ) : filteredRates.length === 0 ? (
                                <div className="col-span-full h-80 flex flex-col items-center justify-center bg-card border border-dashed rounded-[2.5rem] text-muted-foreground space-y-4 font-bold">
                                    <Percent size={48} className="opacity-20" />
                                    <p className="text-xl">Zero tax rates found.</p>
                                </div>
                            ) : (
                                filteredRates.map((rate, i) => (
                                    <motion.div
                                        key={rate.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={cn(
                                            "group bg-card border rounded-3xl p-6 transition-all duration-300 relative overflow-hidden",
                                            editingId === rate.id ? "border-primary shadow-xl ring-1 ring-primary/20" : "hover:shadow-xl hover:border-primary/10"
                                        )}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-muted group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center text-muted-foreground transition-all">
                                                    <Calculator size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black tracking-tight">{rate.name}</h4>
                                                    <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest">{rate.code}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {canWrite && (
                                                    <button
                                                        onClick={() => handleEdit(rate)}
                                                        className="p-2.5 bg-muted hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDelete(rate.id)}
                                                        className="p-2.5 bg-muted hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-baseline gap-2 mb-3">
                                            <span className="text-3xl font-black tracking-tighter">{rate.rate}%</span>
                                            <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-tighter">Effective Rate</span>
                                        </div>

                                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] font-semibold">
                                            {rate.description || "No specific details provided for this tax classification."}
                                        </p>

                                        <div className="mt-6 pt-4 border-t border-dashed border-muted flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-tighter px-2 py-0.5 bg-emerald-500/10 rounded-full">
                                                <ShieldCheck size={10} /> Verified Compliant
                                            </div>
                                            <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
