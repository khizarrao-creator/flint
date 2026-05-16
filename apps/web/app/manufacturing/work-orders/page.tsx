"use client";

import React, { useEffect, useState } from "react";
import {
    Activity,
    Plus,
    Search,
    Loader2,
    Calendar,
    ChevronRight,
    Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/app/lib/utils";
import { api } from "@/app/lib/api";
import Link from "next/link";
import { NewWorkOrderModal } from "@/components/manufacturing/new-work-order-modal";
import { useAuth } from "@/app/lib/auth-context";

export default function WorkOrdersPage() {
    const { user } = useAuth();
    const canWrite = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "SUPER_ADMIN";

    const [workOrders, setWorkOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchWorkOrders();
    }, []);

    const fetchWorkOrders = async () => {
        try {
            setLoading(true);
            const data = await api.get<any[]>('/manufacturing/work-orders');
            setWorkOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch work orders:', error);
            setWorkOrders([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-500 font-bold tracking-widest text-xs uppercase">
                        <Link href="/manufacturing" className="hover:underline">Manufacturing</Link> / Work Orders
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Work Orders</h1>
                    <p className="text-muted-foreground">Manage your production jobs.</p>
                </div>
                {canWrite && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 h-14 rounded-2xl bg-amber-500 text-white font-black shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Plus size={22} />
                        Create Job
                    </button>
                )}
            </section>

            <div className="space-y-4 font-outfit">
                <AnimatePresence>
                    {loading ? (
                        <Loader2 className="animate-spin mx-auto text-indigo-500" />
                    ) : workOrders.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center bg-card border border-dashed rounded-[2.5rem] text-muted-foreground space-y-4 font-bold">
                            <Activity size={48} className="opacity-20" />
                            <p>No active jobs found.</p>
                        </div>
                    ) : (
                        workOrders.map((wo, i) => (
                            <Link key={wo.id} href={`/manufacturing/work-orders/${wo.id}`}>
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="group bg-card border rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:border-amber-500/10 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Activity size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-black tracking-tight leading-none uppercase">{wo.code}</h3>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                                                    wo.priority === '5' ? "bg-rose-500 text-white" :
                                                    wo.priority === '4' ? "bg-orange-500 text-white" :
                                                    "bg-muted text-muted-foreground"
                                                )}>
                                                    P{wo.priority}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground font-bold">{wo.formula?.product?.name} ({wo.quantity} Units)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scheduled</p>
                                            <p className="font-bold text-lg">{new Date(wo.plannedStart).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right min-w-[120px]">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</p>
                                            <span className={cn(
                                                "inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                wo.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-500" :
                                                wo.status === 'IN_PROGRESS' ? "bg-blue-500/10 text-blue-500" :
                                                "bg-amber-500/10 text-amber-500"
                                            )}>
                                                {wo.status}
                                            </span>
                                        </div>
                                        <ChevronRight size={20} className="text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </motion.div>
                            </Link>
                        ))
                    )}
                </AnimatePresence>
            </div>
            <NewWorkOrderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchWorkOrders}
            />
        </div>
    );
}
