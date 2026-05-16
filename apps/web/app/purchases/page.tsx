"use client";

import React, { useEffect, useState } from "react";
import {
    ShoppingCart,
    Search,
    Plus,
    Loader2,
    Calendar,
    ChevronRight,
    ArrowDown,
    Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/lib/auth-context";
import { cn } from "@/app/lib/utils";

export default function PurchasesPage() {
    const router = useRouter();
    const { user } = useAuth();
    const canWrite = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "SUPER_ADMIN";

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const allOrders = await api.get<any[]>('/orders');
            if (Array.isArray(allOrders)) {
                // Purchase Types start with 'P' (PO, PI, PR) or rely on code convention
                const purchaseOrders = allOrders.filter((o: any) =>
                    o.code?.startsWith('P') || o.docType?.code?.startsWith('P')
                );
                setOrders(purchaseOrders);
            }
        } catch (error) {
            console.error('Failed to fetch purchase orders:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-amber-500 font-bold tracking-widest text-xs uppercase">
                        <div className="w-4 h-[2px] bg-amber-500" />
                        Procurement
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Purchase Orders</h1>
                    <p className="text-muted-foreground">Manage supplier invoices and incoming stock.</p>
                </div>

                {canWrite && (
                    <button
                        onClick={() => router.push('/purchases/new')}
                        className="flex items-center gap-3 px-6 h-14 rounded-2xl bg-amber-500 text-white font-black shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <ArrowDown size={22} />
                        Create Purchase
                    </button>
                )}
            </section>

            <div className="space-y-4 font-outfit">
                <AnimatePresence>
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-24 bg-card border rounded-3xl animate-pulse" />
                        ))
                    ) : orders.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center bg-card border border-dashed rounded-[2.5rem] text-muted-foreground space-y-4 font-bold">
                            <ShoppingCart size={48} className="opacity-20" />
                            <p>No purchase records found.</p>
                        </div>
                    ) : (
                        orders.map((order, i) => (
                            <motion.div
                                key={order.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => router.push(`/orders/${order.id}`)}
                                className="group bg-card border rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:border-amber-500/10 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-xs">
                                        PO
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight leading-none mb-1">{order.code}</h3>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1 font-bold">
                                                <Calendar size={12} /> {new Date(order.orderDate).toLocaleDateString()}
                                            </span>
                                            <span className="font-medium">
                                                {order.supplier?.companyName || order.customer?.companyName || "Unknown Vendor"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8 md:gap-12">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</p>
                                        <p className="text-xl font-black text-amber-500">${parseFloat(order.totalAmount).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={cn(
                                            "inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border",
                                            order.status === 'Paid' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                        )}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
