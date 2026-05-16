
"use client";

import React, { useEffect, useState } from "react";
import {
    Scale,
    Search,
    Plus,
    Loader2,
    Trash2,
    Edit2,
    ChevronRight,
    Divide,
    Save,
    X,
    Ruler,
    Box
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/lib/auth-context";
import Link from "next/link";
import { cn } from "@/app/lib/utils";

interface UOM {
    id: string;
    name: string;
    code: string;
    symbol: string | null;
    category: string | null;
    baseUnit: boolean;
    conversion: number | null;
    isActive: boolean;
}

const CATEGORIES = ["Weight", "Volume", "Length", "Quantity", "Time", "Area"];

export default function UnitsPage() {
    const { user } = useAuth();
    const canWrite = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "SUPER_ADMIN";
    const canDelete = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    const [units, setUnits] = useState<UOM[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Inline Form State
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        symbol: "",
        category: "Weight",
        baseUnit: false,
        conversion: 1.0
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchUnits = async () => {
        try {
            setLoading(true);
            const data = await api.get<UOM[]>('/units');
            if (Array.isArray(data)) {
                setUnits(data);
            } else {
                setUnits([]);
            }
        } catch (error) {
            console.error('Failed to fetch units:', error);
            setUnits([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canWrite) return;
        if (!formData.name || !formData.code) return;

        try {
            setIsSaving(true);
            const payload = {
                ...formData,
                conversion: parseFloat(formData.conversion.toString())
            };

            if (editingId) {
                await api.put(`/units/${editingId}`, payload);
            } else {
                await api.post('/units', payload);
            }

            setFormData({ name: "", code: "", symbol: "", category: "Weight", baseUnit: false, conversion: 1.0 });
            setEditingId(null);
            fetchUnits();
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Operation failed");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (unit: UOM) => {
        if (!canWrite) return;
        setEditingId(unit.id);
        setFormData({
            name: unit.name,
            code: unit.code,
            symbol: unit.symbol || "",
            category: unit.category || "Weight",
            baseUnit: unit.baseUnit,
            conversion: unit.conversion || 1.0
        });
    };

    const handleDelete = async (id: string) => {
        if (!canDelete) return;
        if (!confirm("Are you sure? Units currently used in products or BOMs cannot be deleted.")) return;
        try {
            await api.delete(`/units/${id}`);
            fetchUnits();
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to delete");
        }
    };

    const filteredUnits = units.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                        <Link href="/products" className="hover:underline">Inventory</Link> / Units
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Units of Measure</h1>
                    <p className="text-muted-foreground">Define measurement standards for inventory, sales, and manufacturing.</p>
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
                                        {editingId ? <Edit2 size={20} /> : <Divide size={20} />}
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight">
                                        {editingId ? "Update Unit" : "Quick Add"}
                                    </h3>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Unit Code</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. KG, L"
                                                value={formData.code}
                                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                                className="w-full h-12 bg-muted/50 border rounded-xl px-4 font-bold outline-none focus:border-primary/50 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Symbol</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. kg, ℓ"
                                                value={formData.symbol}
                                                onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                                                className="w-full h-12 bg-muted/50 border rounded-xl px-4 font-bold outline-none focus:border-primary/50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Kilogram, Liter"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full h-12 bg-muted/50 border rounded-xl px-4 font-bold outline-none focus:border-primary/50 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full h-12 bg-muted/50 border rounded-xl px-4 font-bold outline-none focus:border-primary/50 appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1rem_1rem]"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-4 py-2">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div
                                                onClick={() => setFormData({ ...formData, baseUnit: !formData.baseUnit, conversion: !formData.baseUnit ? 1.0 : formData.conversion })}
                                                className={cn(
                                                    "w-12 h-6 rounded-full p-1 transition-all duration-300",
                                                    formData.baseUnit ? "bg-primary" : "bg-muted"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-4 h-4 bg-white rounded-full transition-all duration-300",
                                                    formData.baseUnit ? "translate-x-6" : "translate-x-0"
                                                )} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-tighter group-hover:text-primary transition-colors">Mark as Base Unit</span>
                                        </label>
                                    </div>

                                    {!formData.baseUnit && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Conversion Factor (to Base)</label>
                                            <input
                                                type="number"
                                                step="0.000001"
                                                value={formData.conversion}
                                                onChange={e => setFormData({ ...formData, conversion: parseFloat(e.target.value) })}
                                                className="w-full h-12 bg-muted/50 border rounded-xl px-4 font-bold outline-none focus:border-primary/50 transition-all"
                                            />
                                            <p className="text-[9px] text-muted-foreground font-medium px-1 italic">Multiply by this factor to convert to the base unit of this category.</p>
                                        </div>
                                    )}

                                    <div className="pt-4 flex gap-2">
                                        {editingId && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setFormData({ name: "", code: "", symbol: "", category: "Weight", baseUnit: false, conversion: 1.0 });
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
                                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : (editingId ? "Save Changes" : "Register Unit")}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="p-6 bg-muted/30 border border-dashed rounded-[2rem] text-center space-y-2">
                        <Scale size={24} className="mx-auto text-muted-foreground opacity-50" />
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Standards Tip</p>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed font-semibold">Base units are critical for automated stock reconciliation and Bill of Materials calculations.</p>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter by unit name or code..."
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
                            ) : filteredUnits.length === 0 ? (
                                <div className="col-span-full h-80 flex flex-col items-center justify-center bg-card border border-dashed rounded-[2.5rem] text-muted-foreground space-y-4 font-bold">
                                    <Ruler size={48} className="opacity-20" />
                                    <p className="text-xl">Zero units found.</p>
                                </div>
                            ) : (
                                filteredUnits.map((unit, i) => (
                                    <motion.div
                                        key={unit.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={cn(
                                            "group bg-card border rounded-3xl p-6 transition-all duration-300 relative overflow-hidden",
                                            editingId === unit.id ? "border-primary shadow-xl ring-1 ring-primary/20" : "hover:shadow-xl hover:border-primary/10"
                                        )}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-muted group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center text-muted-foreground transition-all">
                                                    {unit.category === "Weight" ? <Scale size={20} /> : unit.category === "Volume" ? <Box size={20} /> : <Ruler size={20} />}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black tracking-tight">{unit.name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest">{unit.code}</p>
                                                        {unit.symbol && <span className="text-[10px] text-muted-foreground font-bold italic opacity-60">({unit.symbol})</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {canWrite && (
                                                    <button
                                                        onClick={() => handleEdit(unit)}
                                                        className="p-2.5 bg-muted hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDelete(unit.id)}
                                                        className="p-2.5 bg-muted hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-tighter">Category: {unit.category}</p>
                                            <p className="text-sm font-semibold">
                                                {unit.baseUnit ? (
                                                    <span className="text-primary tracking-tight italic">Standard Base Unit for {unit.category}</span>
                                                ) : (
                                                    <span className="text-muted-foreground tracking-tight">Factor: 1 {unit.code} = {unit.conversion} [Base]</span>
                                                )}
                                            </p>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-dashed border-muted flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-tighter px-2 py-0.5 bg-emerald-500/10 rounded-full">
                                                Certified Unit
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
