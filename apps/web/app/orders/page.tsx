"use client";

import React, { useEffect, useState } from "react";
import {
    ShoppingCart,
    Search,
    Plus,
    Loader2,
    Filter,
    CreditCard,
    Calendar,
    ChevronRight,
    Printer,
    FileText,
    Trash2,
    RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { cn } from "@/app/lib/utils";
import { useAuth } from "@/app/lib/auth-context";

export default function OrdersPage() {
    const router = useRouter();
    const { user } = useAuth();
    const canWrite = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "SUPER_ADMIN";
    const canDelete = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await api.get<any[]>('/orders');
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleDelete = async (id: string) => {
        if (!canDelete) return;
        if (!confirm("Void this order? Flint will automatically Roll Back Inventory and Deduct the Customer's debt. This action is irreversible.")) return;

        try {
            await api.delete(`/orders/${id}`);
            fetchOrders();
        } catch (error) {
            console.error('Failed to void order:', error);
        }
    };

    const filteredOrders = orders.filter(o => {
        const orderCode = o.code || "";
        const partyName = o.customer
            ? `${o.customer.firstName} ${o.customer.lastName}`
            : (o.supplier?.companyName || "");

        return orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            partyName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                        <div className="w-4 h-[2px] bg-primary" />
                        Flint Ledger
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Orders & Transactions</h1>
                    <p className="text-muted-foreground">Comprehensive history of all sales and purchase activities.</p>
                </div>

                <div className="flex items-center gap-3">
                    {canWrite && (
                        <button
                            onClick={() => router.push('/orders/new')}
                            className="flex items-center gap-2 px-6 h-14 rounded-2xl bg-primary text-primary-foreground font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <Plus size={22} />
                            Commit New Order
                        </button>
                    )}
                </div>
            </section>

            {/* Stats Summary */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Volume", value: orders.length, icon: ShoppingCart },
                    { label: "Pending Payments", value: orders.filter(o => o.status !== 'Paid').length, icon: CreditCard },
                    { label: "Gross Valuation", value: `$${orders.reduce((acc, o) => acc + parseFloat(o.totalAmount), 0).toLocaleString()}`, icon: Calendar },
                ].map((stat, i) => (
                    <div key={i} className="bg-card border rounded-3xl p-6 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                            <h3 className="text-2xl font-black mt-1">{stat.value}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-primary">
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </section>

            {/* Toolbar */}
            <section className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by Order # or Party Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-16 bg-card border rounded-2xl pl-14 pr-6 font-bold outline-none focus:border-primary/50 transition-all shadow-sm"
                    />
                </div>
            </section>

            {/* List */}
            <div className="space-y-4 font-outfit">
                <AnimatePresence>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-28 bg-card border rounded-3xl animate-pulse" />
                        ))
                    ) : filteredOrders.length === 0 ? (
                        <div className="h-80 flex flex-col items-center justify-center bg-card border border-dashed rounded-[2.5rem] text-muted-foreground space-y-4 font-bold">
                            <FileText size={48} className="opacity-20" />
                            <p className="text-xl">No transactions found.</p>
                        </div>
                    ) : (
                        filteredOrders.map((order, i) => (
                            <motion.div
                                key={order.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2, delay: i * 0.05 }}
                                onClick={() => router.push(`/orders/${order.id}`)}
                                className="group bg-card border rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:border-primary/10 transition-all duration-300 cursor-pointer"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all font-black text-xs",
                                        order.code?.startsWith('P') ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
                                    )}>
                                        {order.code?.split('-')[0] || 'ORD'}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight leading-none mb-1">{order.code}</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-muted-foreground flex items-center gap-1 uppercase tracking-widest italic">
                                                <Calendar size={12} /> {new Date(order.orderDate).toLocaleDateString()}
                                            </span>
                                            <span className="w-1 h-1 bg-muted rounded-full" />
                                            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                                                {order.customer
                                                    ? `${order.customer.firstName} ${order.customer.lastName}`
                                                    : (order.supplier?.companyName || "Internal Transfer")}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 md:gap-12">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Items</p>
                                        <p className="font-bold text-sm tracking-tighter">{order.products?.length || 0} SKU(s)</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Valuation</p>
                                        <p className="text-2xl font-black text-primary">${parseFloat(order.totalAmount).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={cn(
                                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                            order.status === 'Paid' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                        )}>
                                            {order.status}
                                        </span>
                                        <div className="flex gap-2">
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDelete(order.id)}
                                                    className="p-3 bg-muted hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all"
                                                    title="Void Order"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                            <button className="p-3 bg-muted hover:bg-muted/80 rounded-xl transition-all">
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
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

