"use client";

import React, { useState, useEffect } from "react";
import { X, Globe, ShieldCheck, Loader2, Save, Trash2, AlertTriangle, Power, PowerOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/app/lib/utils";

interface ManageTenantModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenant: any | null;
    onSuccess: () => void;
}

import { api } from "@/app/lib/api";

export function ManageTenantModal({ isOpen, onClose, tenant, onSuccess }: ManageTenantModalProps) {
    const [loading, setLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        isActive: true,
        expiresAt: null as string | null,
        isDemo: false
    });

    useEffect(() => {
        if (tenant) {
            setFormData({
                name: tenant.name,
                isActive: tenant.isActive,
                expiresAt: tenant.expiresAt,
                isDemo: tenant.isDemo
            });
            setDeleteConfirm(false);
        }
    }, [tenant]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;
        setLoading(true);
        try {
            await api.put(`/tenants/${tenant.id}`, formData);

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Update failed:', error);
            alert("Administrative Update Failure");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!tenant) return;
        setLoading(true);
        try {
            await api.delete(`/tenants/${tenant.id}`);

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Delete failed:', error);
            alert("Critical Error: Ecosystem De-provisioning Refused");
        } finally {
            setLoading(false);
        }
    };

    const extendSubscription = (days: number) => {
        const current = formData.expiresAt ? new Date(formData.expiresAt) : new Date();
        const next = new Date(current.getTime() + days * 24 * 60 * 60 * 1000);
        setFormData({ ...formData, expiresAt: next.toISOString() });
    };

    return (
        <AnimatePresence>
            {isOpen && tenant && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-xl bg-card border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 space-y-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">Manage Ecosystem</h2>
                                    <div className="flex items-center gap-4 mt-1">
                                        <p className="text-xs font-black text-primary uppercase tracking-widest">ID: {tenant.id.slice(0, 8)}...</p>
                                        {formData.isDemo && <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">Demo Instance</span>}
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 bg-muted rounded-full hover:bg-muted-foreground/20 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Instance Name</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <input
                                            required
                                            className="w-full h-14 bg-muted/30 border-white/5 border rounded-2xl pl-12 pr-4 font-bold outline-none focus:border-primary/50 transition-all"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Subscription / Expiry Management */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Subscription Expiry</label>
                                        {formData.expiresAt && (
                                            <span className="text-[10px] font-bold text-muted-foreground">
                                                {new Date(formData.expiresAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-4 rounded-2xl border bg-muted/20 space-y-4">
                                        <input
                                            type="datetime-local"
                                            className="w-full bg-transparent font-mono text-sm outline-none"
                                            value={formData.expiresAt ? new Date(formData.expiresAt).toISOString().slice(0, 16) : ""}
                                            onChange={(e) => setFormData({ ...formData, expiresAt: new Date(e.target.value).toISOString() })}
                                        />
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => extendSubscription(7)} className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">+1 Week</button>
                                            <button type="button" onClick={() => extendSubscription(30)} className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">+30 Days</button>
                                            <button type="button" onClick={() => extendSubscription(365)} className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">+1 Year</button>
                                            <button type="button" onClick={() => setFormData({ ...formData, expiresAt: null })} className="px-3 py-2 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-colors ml-auto">Clear (Lifetime)</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Infrastructure Status</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isActive: true })}
                                            className={cn(
                                                "h-16 rounded-2xl border flex items-center justify-center gap-3 font-black transition-all",
                                                formData.isActive ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500" : "bg-muted/30 border-white/5 text-muted-foreground opacity-50"
                                            )}
                                        >
                                            <Power size={20} /> Active
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isActive: false })}
                                            className={cn(
                                                "h-16 rounded-2xl border flex items-center justify-center gap-3 font-black transition-all",
                                                !formData.isActive ? "bg-rose-500/10 border-rose-500/50 text-rose-500 shadow-lg shadow-rose-500/20" : "bg-muted/30 border-white/5 text-muted-foreground opacity-50"
                                            )}
                                        >
                                            <PowerOff size={20} /> Suspended
                                        </button>
                                    </div>
                                    {!formData.isActive && (
                                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3">
                                            <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                                            <p className="text-[10px] font-bold text-rose-500 leading-relaxed uppercase">
                                                Instance Suspension will immediately revoke all user access tokens and halt background processing tasks for this tenant.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 h-16 bg-primary text-primary-foreground rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        {loading && !deleteConfirm ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                        Apply Mutations
                                    </button>
                                </div>
                            </form>

                            <div className="pt-8 border-t border-white/5">
                                {!deleteConfirm ? (
                                    <button
                                        onClick={() => setDeleteConfirm(true)}
                                        className="w-full h-14 bg-rose-500/10 text-rose-500 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-rose-500/20 transition-all border border-rose-500/20"
                                    >
                                        <Trash2 size={18} />
                                        Initiate De-provisioning
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-6 bg-rose-500 rounded-3xl text-white space-y-2">
                                            <p className="font-black flex items-center gap-2 uppercase text-xs tracking-widest italic">
                                                <AlertTriangle size={18} /> Internal Security Override
                                            </p>
                                            <p className="text-sm font-bold opacity-90">Confirm de-provisioning? This action is IRREVERSIBLE and will purge all ecosystem data including financial ledgers and product history.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setDeleteConfirm(false)}
                                                className="h-14 bg-muted rounded-2xl font-black hover:bg-muted-foreground/20 transition-all"
                                            >
                                                Abort
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                disabled={loading}
                                                className="h-14 bg-rose-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                            >
                                                {loading ? <Loader2 className="animate-spin" /> : "Purge Core"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
