"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../lib/auth-context";
import { useRouter } from "next/navigation";
import {
    ShieldAlert,
    Plus,
    ExternalLink,
    Activity,
    Globe,
    Users,
    Database,
    Search,
    Loader2,
    Trash2,
    Settings,
    Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/app/lib/utils";
import { ProvisionModal } from "@/components/admin/provision-modal";
import { ManageTenantModal } from "@/components/admin/manage-tenant-modal";

import { api } from "@/app/lib/api";

export default function SuperAdminPortal() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "SUPER_ADMIN")) {
            router.push("/");
        }
    }, [user, authLoading, router]);

    const fetchTenants = async () => {
        try {
            setLoading(true);
            const data = await api.get<any[]>('/tenants');
            setTenants(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch tenants:', error);
            setTenants([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === "SUPER_ADMIN") {
            fetchTenants();
        }
    }, [user]);

    if (authLoading || (user && user.role !== "SUPER_ADMIN")) {
        return (
            <div className="h-screen flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-muted-foreground font-black uppercase text-xs tracking-widest italic">Verifying Authorization Matrix...</p>
            </div>
        );
    }

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subdomain?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-primary font-black tracking-[0.3em] text-xs uppercase italic py-2">
                        <ShieldAlert size={16} /> Super Admin Control
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter">Flint Central Registry</h1>
                    <p className="text-muted-foreground font-medium text-lg">Infrastructure management for all provisioned ERP instances.</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-3 px-8 h-14 rounded-2xl bg-primary text-primary-foreground font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus size={24} />
                    Provision New Instance
                </button>
            </section>

            {/* Global Stats bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Active Instances", value: tenants.length, icon: Globe },
                    { label: "Total Users", value: tenants.reduce((acc, t) => acc + (t._count?.users || 0), 0), icon: Users },
                    { label: "Data Integrity", value: "99.9%", icon: Activity },
                    { label: "Engine Load", value: "0.2%", icon: Terminal },
                ].map((stat, i) => (
                    <div key={i} className="bg-card border-white/5 border rounded-3xl p-6 flex items-center justify-between shadow-xl">
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">{stat.label}</p>
                            <h4 className="text-2xl font-black">{stat.value}</h4>
                        </div>
                        <stat.icon size={24} className="text-primary/40" />
                    </div>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder="Filter ecosystems by name, ID, or subdomain..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-20 bg-card border rounded-3xl pl-16 pr-8 text-xl font-black outline-none focus:border-primary/50 transition-all shadow-inner"
                />
            </div>

            {/* Tenant Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AnimatePresence>
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-40 bg-muted/40 animate-pulse rounded-[2.5rem] border border-dashed border-white/10" />
                        ))
                    ) : filteredTenants.map((tenant, i) => (
                        <motion.div
                            key={tenant.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="group bg-card/40 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 relative overflow-hidden"
                        >
                            {/* Glow Effect */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-[80px] group-hover:bg-primary/10 transition-colors" />

                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-muted group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center text-muted-foreground transition-all duration-500">
                                        <Database size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight">{tenant.name}</h3>
                                        <p className="text-xs font-bold text-primary italic uppercase tracking-widest">{tenant.subdomain}.flint-er.com</p>
                                        <div className="flex items-center gap-4 mt-4">
                                            <div className="flex items-center gap-1.5 text-xs font-black text-muted-foreground uppercase italic px-3 py-1 bg-muted rounded-full">
                                                <Activity size={12} className="text-emerald-500" /> Operational
                                            </div>
                                            {tenant.isDemo && (
                                                <div className="flex items-center gap-1.5 text-xs font-black text-orange-500 uppercase italic px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full animate-pulse">
                                                    DEMO MODE
                                                </div>
                                            )}
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">ID: {tenant.id.split('-')[0]}</p>
                                        </div>
                                        {tenant.expiresAt && (
                                            <div className="mt-2 text-[10px] font-bold text-muted-foreground">
                                                Expires: <span className={cn(new Date(tenant.expiresAt) < new Date() ? "text-red-500" : "text-foreground")}>{new Date(tenant.expiresAt).toLocaleDateString()}</span>
                                                <span className="ml-2 opacity-50">({Math.ceil((new Date(tenant.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedTenant(tenant);
                                            setIsManageModalOpen(true);
                                        }}
                                        className="p-3 bg-muted hover:bg-muted-foreground hover:text-white rounded-xl transition-all"
                                    >
                                        <Settings size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-3 gap-4 relative z-10 text-center">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Users</p>
                                    <p className="text-lg font-black">{tenant._count?.users || 0}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Products</p>
                                    <p className="text-lg font-black">{tenant._count?.products || 0}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Orders</p>
                                    <p className="text-lg font-black">{tenant._count?.orders || 0}</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between relative z-10 font-bold">
                                <div className="flex items-center gap-2 text-xs opacity-50">
                                    Infrastructure Provisioned: {new Date(tenant.createdAt).toLocaleDateString()}
                                </div>
                                <a
                                    href={`#`}
                                    className="flex items-center gap-2 text-xs text-primary hover:underline group-hover:translate-x-1 transition-transform"
                                >
                                    Open Instance <ExternalLink size={14} />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <ProvisionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchTenants}
            />

            <ManageTenantModal
                isOpen={isManageModalOpen}
                onClose={() => setIsManageModalOpen(false)}
                tenant={selectedTenant}
                onSuccess={fetchTenants}
            />
        </div>
    );
}
