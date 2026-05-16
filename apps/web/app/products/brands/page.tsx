
"use client";

import React, { useEffect, useState } from "react";
import {
    Award,
    Search,
    Plus,
    Loader2,
    Trash2,
    Edit2,
    ChevronRight,
    Globe,
    Save,
    X,
    BadgePlus,
    Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/lib/auth-context";
import Link from "next/link";
import { cn } from "@/app/lib/utils";

interface Brand {
    id: string;
    name: string;
    logo: string | null;
    description: string | null;
    website: string | null;
    isActive: boolean;
}

export default function BrandsPage() {
    const { user } = useAuth();
    const canWrite = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "SUPER_ADMIN";
    const canDelete = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Inline Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        logo: "",
        website: ""
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const data = await api.get<Brand[]>('/brands');
            if (Array.isArray(data)) {
                setBrands(data);
            } else {
                setBrands([]);
            }
        } catch (error) {
            console.error('Failed to fetch brands:', error);
            setBrands([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canWrite) return;
        if (!formData.name) return;

        try {
            setIsSaving(true);
            if (editingId) {
                await api.put(`/brands/${editingId}`, formData);
            } else {
                await api.post('/brands', formData);
            }

            setFormData({ name: "", description: "", logo: "", website: "" });
            setEditingId(null);
            fetchBrands();
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Operation failed");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (brand: Brand) => {
        if (!canWrite) return;
        setEditingId(brand.id);
        setFormData({
            name: brand.name,
            description: brand.description || "",
            logo: brand.logo || "",
            website: brand.website || ""
        });
    };

    const handleDelete = async (id: string) => {
        if (!canDelete) return;
        if (!confirm("Are you sure? Brands associated with products cannot be deleted.")) return;
        try {
            await api.delete(`/brands/${id}`);
            fetchBrands();
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to delete");
        }
    };

    const filteredBrands = brands.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                        <Link href="/products" className="hover:underline">Inventory</Link> / Brands
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Product Brands</h1>
                    <p className="text-muted-foreground">Manage manufacturer brands and corporate identities.</p>
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
                                        {editingId ? <Edit2 size={20} /> : <BadgePlus size={20} />}
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight">
                                        {editingId ? "Update Brand" : "Quick Add"}
                                    </h3>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Brand Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Apple, Samsung"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full h-12 bg-muted/50 border rounded-xl px-4 font-bold outline-none focus:border-primary/50 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Website URL</label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="url"
                                                placeholder="https://example.com"
                                                value={formData.website}
                                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                                                className="w-full h-12 bg-muted/50 border rounded-xl pl-10 pr-4 font-bold outline-none focus:border-primary/50 transition-all text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Logo URL</label>
                                        <div className="relative">
                                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                placeholder="URL to image"
                                                value={formData.logo}
                                                onChange={e => setFormData({ ...formData, logo: e.target.value })}
                                                className="w-full h-12 bg-muted/50 border rounded-xl pl-10 pr-4 font-bold outline-none focus:border-primary/50 transition-all text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Write a brief note..."
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
                                                    setFormData({ name: "", description: "", logo: "", website: "" });
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
                                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : (editingId ? "Save Changes" : "Register Brand")}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="p-6 bg-muted/30 border border-dashed rounded-[2rem] text-center space-y-2">
                        <Award size={24} className="mx-auto text-muted-foreground opacity-50" />
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Branding Tip</p>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed font-semibold">Consolidating brands allows for automated procurement flows and supplier performance tracking.</p>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter by brand name..."
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
                            ) : filteredBrands.length === 0 ? (
                                <div className="col-span-full h-80 flex flex-col items-center justify-center bg-card border border-dashed rounded-[2.5rem] text-muted-foreground space-y-4 font-bold">
                                    <Award size={48} className="opacity-20" />
                                    <p className="text-xl">Zero brands found.</p>
                                </div>
                            ) : (
                                filteredBrands.map((brand, i) => (
                                    <motion.div
                                        key={brand.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={cn(
                                            "group bg-card border rounded-3xl p-6 transition-all duration-300 relative overflow-hidden",
                                            editingId === brand.id ? "border-primary shadow-xl ring-1 ring-primary/20" : "hover:shadow-xl hover:border-primary/10"
                                        )}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-muted group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center text-muted-foreground overflow-hidden transition-all">
                                                    {brand.logo ? (
                                                        <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Award size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black tracking-tight">{brand.name}</h4>
                                                    {brand.website && (
                                                        <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1 tracking-widest transition-all">
                                                            <Globe size={10} /> Official Site
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {canWrite && (
                                                    <button
                                                        onClick={() => handleEdit(brand)}
                                                        className="p-2.5 bg-muted hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDelete(brand.id)}
                                                        className="p-2.5 bg-muted hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] font-semibold">
                                            {brand.description || "No description provided for this brand."}
                                        </p>

                                        <div className="mt-6 pt-4 border-t border-dashed border-muted flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-tighter px-2 py-0.5 bg-emerald-500/10 rounded-full">
                                                Active Status
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
