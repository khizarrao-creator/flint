"use client";

import React, { useEffect, useState } from "react";
import { usePortalAuth } from "./lib/portal-auth-context";
import { useRouter } from "next/navigation";
import {
    Wallet,
    CreditCard,
    ArrowRight,
    Clock,
    CheckCircle2,
    Package,
    Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/app/lib/utils";

import { api } from "@/app/lib/api";

export default function PortalDashboard() {
    const { customer, loading: authLoading, logout } = usePortalAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !customer) {
            router.push("/portal/login");
        } else if (customer) {
            fetchOrders();
        }
    }, [customer, authLoading]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("flint_portal_token");
            const data = await api.get<any[]>('/orders/portal/my-orders', undefined, {
                token,
                unauthorizedRedirect: '/portal/login'
            });
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !customer) return null;

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">
                        Hello, {customer.firstName}
                    </h1>
                    <p className="text-muted-foreground font-medium">Here is your account overview.</p>
                </div>
                <button onClick={logout} className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                    Sign Out
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 bg-card border border-white/5 rounded-[2.5rem] relative overflow-hidden group"
                >
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                            <Wallet size={24} />
                        </div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Current Balance</p>
                        <h2 className="text-4xl font-black tracking-tighter">${parseFloat(customer.ledgerBalance || 0).toLocaleString()}</h2>
                        <p className="text-sm text-muted-foreground mt-2 font-medium">Amount valid as of today.</p>
                    </div>

                    {/* Background Flair */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-16 -mt-16 blur-[60px]" />
                </motion.div>

                <div className="p-8 bg-card border border-white/5 rounded-[2.5rem] flex flex-col justify-center gap-4">
                    <p className="text-sm font-bold text-muted-foreground">Quick Actions</p>
                    <button className="h-14 bg-primary text-primary-foreground rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-xl shadow-primary/20">
                        <CreditCard size={20} />
                        Pay Invoice
                    </button>
                    <button className="h-14 bg-muted text-foreground rounded-2xl font-black hover:bg-muted/80 transition-colors">
                        View Statement
                    </button>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="space-y-6">
                <h2 className="text-xl font-black tracking-tight">Recent Orders</h2>

                <div className="space-y-4">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-24 bg-card/50 rounded-3xl animate-pulse" />
                        ))
                    ) : orders.length === 0 ? (
                        <div className="p-12 text-center border border-dashed border-white/10 rounded-3xl">
                            <Package className="mx-auto text-muted-foreground mb-3" size={32} />
                            <p className="font-bold text-muted-foreground">No orders found.</p>
                        </div>
                    ) : (
                        orders.map((order: any, i) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="p-6 bg-card border border-white/5 rounded-3xl flex items-center justify-between hover:border-primary/20 transition-all group"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                                        <Package size={20} className="text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg">#{order.code}</h4>
                                        <p className="text-xs font-bold text-muted-foreground">
                                            {new Date(order.orderDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-xs font-black uppercase text-muted-foreground mb-1">Total</p>
                                        <p className="font-black text-lg">${parseFloat(order.totalAmount).toLocaleString()}</p>
                                    </div>
                                    <div className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2",
                                        order.status === 'Completed' ? "bg-emerald-500/10 text-emerald-500" :
                                            order.status === 'Pending' ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground"
                                    )}>
                                        {order.status}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
