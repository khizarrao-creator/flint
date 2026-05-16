"use client";

import React, { useState } from "react";
import { X, Globe, User, Mail, Lock, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/app/lib/utils";

interface ProvisionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

import { api } from "@/app/lib/api";

export function ProvisionModal({ isOpen, onClose, onSuccess }: ProvisionModalProps) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [isDemo, setIsDemo] = useState(false);
    const [demoDuration, setDemoDuration] = useState(30);
    const [formData, setFormData] = useState({
        name: "",
        subdomain: "",
        adminEmail: "",
        adminUsername: "",
        adminPass: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                isDemo,
                expiresAt: isDemo ? new Date(Date.now() + demoDuration * 24 * 60 * 60 * 1000).toISOString() : null
            };

            await api.post('/tenants/onboard', payload);

            onSuccess();
            onClose();
            // Reset state
            setStep(1);
            setFormData({ name: "", subdomain: "", adminEmail: "", adminUsername: "", adminPass: "" });
            setIsDemo(false);
            setDemoDuration(30);
        } catch (error) {
            console.error('Provisioning failed:', error);
            alert("Provisioning Error: Hierarchy Integrity Violated");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
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
                        className="relative w-full max-w-2xl bg-card border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        {/* Header Image/Gradient */}
                        <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="text-primary/40 animate-pulse" size={48} />
                            </div>
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-10 -mt-8 relative z-10 bg-card rounded-t-[2.5rem]">
                            <div className="space-y-2 mb-10">
                                <h2 className="text-3xl font-black tracking-tighter">Provision New Ecosystem</h2>
                                <p className="text-muted-foreground font-medium">Step {step} of 2: {step === 1 ? "Ecosystem Identity" : "Security Architect"}</p>

                                <div className="flex gap-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div className={cn("h-full bg-primary transition-all duration-500", step === 1 ? "w-1/2" : "w-full")} />
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {step === 1 ? (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Instance Name</label>
                                            <div className="relative">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                                <input
                                                    required
                                                    className="w-full h-14 bg-muted/30 border-white/5 border rounded-2xl pl-12 pr-4 font-bold outline-none focus:border-primary/50 transition-all"
                                                    placeholder="Phoenix Industries Ltd."
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Subdomain Identifier</label>
                                            <div className="relative">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                                <input
                                                    required
                                                    className="w-full h-14 bg-muted/30 border-white/5 border rounded-2xl pl-12 pr-16 font-bold outline-none focus:border-primary/50 transition-all lowercase"
                                                    placeholder="phoenix"
                                                    value={formData.subdomain}
                                                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground">.flint-er.com</span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setStep(2)}
                                            className="w-full h-16 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-transform hover:scale-[1.01]"
                                        >
                                            Next: Architect Access
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* ... (Admin inputs) ... */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Admin Email</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                                    <input
                                                        type="email"
                                                        required
                                                        className="w-full h-14 bg-muted/30 border-white/5 border rounded-2xl pl-12 pr-4 font-bold outline-none focus:border-primary/50 transition-all"
                                                        placeholder="admin@phoenix.com"
                                                        value={formData.adminEmail}
                                                        onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Username</label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                                    <input
                                                        required
                                                        className="w-full h-14 bg-muted/30 border-white/5 border rounded-2xl pl-12 pr-4 font-bold outline-none focus:border-primary/50 transition-all"
                                                        placeholder="phoenix_admin"
                                                        value={formData.adminUsername}
                                                        onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Emergency Lockdown Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                                <input
                                                    type="password"
                                                    required
                                                    className="w-full h-14 bg-muted/30 border-white/5 border rounded-2xl pl-12 pr-4 font-bold outline-none focus:border-primary/50 transition-all"
                                                    placeholder="••••••••"
                                                    value={formData.adminPass}
                                                    onChange={(e) => setFormData({ ...formData, adminPass: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Demo Account Config */}
                                        <div className="pt-4 border-t border-white/5">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="font-bold text-sm">Demo Account</h3>
                                                    <p className="text-xs text-muted-foreground">Provision as a temporary trial instance.</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={isDemo}
                                                        onChange={(e) => setIsDemo(e.target.checked)}
                                                    />
                                                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                </label>
                                            </div>

                                            <AnimatePresence>
                                                {isDemo && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden space-y-2"
                                                    >
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Trial Duration</label>
                                                        <div className="grid grid-cols-5 gap-2">
                                                            {[1, 3, 7, 15, 30].map((days) => (
                                                                <button
                                                                    key={days}
                                                                    type="button"
                                                                    onClick={() => setDemoDuration(days)}
                                                                    className={cn(
                                                                        "h-10 rounded-xl font-bold text-xs border transition-all",
                                                                        demoDuration === days
                                                                            ? "bg-primary text-primary-foreground border-primary"
                                                                            : "bg-muted hover:bg-muted/80 border-transparent"
                                                                    )}
                                                                >
                                                                    {days === 7 ? "1 Week" : `${days} Days`}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="h-16 px-8 bg-muted text-foreground rounded-2xl font-black transition-colors hover:bg-muted/80"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-1 h-16 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-transform hover:scale-[1.01] disabled:opacity-50"
                                            >
                                                {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                                                Initialize ERP Subsystem
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
