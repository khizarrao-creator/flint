"use client";

import React, { useState } from "react";
import { usePortalAuth } from "../lib/portal-auth-context";
import { Globe, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { api } from "@/app/lib/api";

export default function PortalLoginPage() {
    const { login } = usePortalAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subdomain: "",
        email: "",
        pass: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await api.post<any>('/auth/portal/login', formData);
            login(data.access_token, data.customer);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Portal Access Denied. Please verify your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8"
            >
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter">Welcome Back</h1>
                    <p className="text-muted-foreground">Access your invoices and billing history.</p>
                </div>

                <div className="p-8 bg-card border border-white/5 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-[80px]" />

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Organization ID</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    required
                                    className="w-full h-14 bg-muted/30 border-white/5 border rounded-2xl pl-12 pr-4 font-bold outline-none focus:border-primary/50 transition-all lowercase"
                                    placeholder="phoenix"
                                    value={formData.subdomain}
                                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground opacity-50">.flint-erp.com</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full h-14 bg-muted/30 border-white/5 border rounded-2xl pl-12 pr-4 font-bold outline-none focus:border-primary/50 transition-all"
                                    placeholder="you@company.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="w-full h-14 bg-muted/30 border-white/5 border rounded-2xl pl-12 pr-4 font-bold outline-none focus:border-primary/50 transition-all"
                                    placeholder="••••••••"
                                    value={formData.pass}
                                    onChange={(e) => setFormData({ ...formData, pass: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-transform hover:scale-[1.01] mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={20} /></>}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
