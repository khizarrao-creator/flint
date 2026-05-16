"use client";

import React, { useEffect, useState } from "react";
import { 
    ChevronLeft, 
    ChevronRight, 
    Calendar as CalendarIcon, 
    Clock, 
    ArrowLeft,
    Loader2,
    Filter,
    Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/app/lib/api";
import { cn } from "@/app/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductionCalendarPage() {
    const router = useRouter();
    const [workOrders, setWorkOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        fetchWorkOrders();
    }, []);

    const fetchWorkOrders = async () => {
        try {
            setLoading(true);
            const data = await api.get<any[]>('/manufacturing/work-orders');
            setWorkOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Calendar Math
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const daysInMonth = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="font-bold text-muted-foreground animate-pulse">Building production timeline...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <Link 
                        href="/manufacturing"
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-xs font-black uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} /> Back to Manufacturing
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight">Production Schedule</h1>
                        <p className="text-muted-foreground font-medium">Visualizing factory floor load and deadlines.</p>
                    </div>
                </div>

                <div className="flex items-center bg-card border rounded-2xl p-2 shadow-sm">
                    <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-xl transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="px-6 font-black uppercase tracking-widest text-sm min-w-[160px] text-center">
                        {monthName} {currentDate.getFullYear()}
                    </div>
                    <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-xl transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </section>

            {/* Timeline View */}
            <div className="bg-card border rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                
                {/* Timeline Header */}
                <div className="flex border-b bg-muted/30">
                    <div className="w-64 border-r p-6 shrink-0 flex items-center gap-2">
                        <Layers size={18} className="text-muted-foreground" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Work Orders</span>
                    </div>
                    <div className="flex-1 overflow-x-auto no-scrollbar flex">
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth();
                            return (
                                <div 
                                    key={day} 
                                    className={cn(
                                        "min-w-[40px] flex-1 border-r flex flex-col items-center justify-center py-4",
                                        isToday && "bg-primary/5"
                                    )}
                                >
                                    <span className="text-[10px] font-black text-muted-foreground/50">{day}</span>
                                    <span className={cn(
                                        "text-xs font-black",
                                        isToday && "text-primary"
                                    )}>{['S','M','T','W','T','F','S'][new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay()]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Timeline Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {workOrders.length === 0 ? (
                        <div className="p-20 text-center space-y-4">
                            <CalendarIcon size={48} className="mx-auto text-muted-foreground opacity-20" />
                            <p className="text-muted-foreground font-bold">No active work orders for this period.</p>
                        </div>
                    ) : (
                        workOrders.map((wo) => {
                            const start = wo.plannedStart ? new Date(wo.plannedStart) : null;
                            const end = wo.plannedFinish ? new Date(wo.plannedFinish) : null;

                            // Calculate position
                            let startDay = 0;
                            let duration = 0;

                            if (start && start.getMonth() === currentDate.getMonth()) {
                                startDay = start.getDate();
                                if (end && end.getMonth() === currentDate.getMonth()) {
                                    duration = end.getDate() - startDay + 1;
                                } else {
                                    duration = daysInMonth - startDay + 1;
                                }
                            }

                            return (
                                <div key={wo.id} className="flex border-b hover:bg-muted/10 transition-colors group">
                                    <div className="w-64 border-r p-6 shrink-0 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                wo.status === 'COMPLETED' ? "bg-emerald-500" :
                                                wo.status === 'IN_PROGRESS' ? "bg-blue-500" :
                                                "bg-amber-500"
                                            )} />
                                            <p className="font-black text-sm tracking-tight uppercase group-hover:text-primary transition-colors cursor-pointer" onClick={() => router.push(`/manufacturing/work-orders/${wo.id}`)}>
                                                {wo.code}
                                            </p>
                                        </div>
                                        <p className="text-[10px] font-bold text-muted-foreground truncate">{wo.formula?.product?.name}</p>
                                    </div>
                                    <div className="flex-1 relative flex items-center px-[2px]">
                                        {/* Grid lines */}
                                        <div className="absolute inset-0 flex pointer-events-none">
                                            {Array.from({ length: daysInMonth }).map((_, i) => (
                                                <div key={i} className="flex-1 border-r border-muted/30" />
                                            ))}
                                        </div>

                                        {/* Work Order Bar */}
                                        {startDay > 0 && (
                                            <motion.div
                                                initial={{ scaleX: 0 }}
                                                animate={{ scaleX: 1 }}
                                                style={{ 
                                                    left: `${((startDay - 1) / daysInMonth) * 100}%`,
                                                    width: `${(duration / daysInMonth) * 100}%`
                                                }}
                                                className={cn(
                                                    "absolute h-8 rounded-lg shadow-sm flex items-center px-3 overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform",
                                                    wo.status === 'COMPLETED' ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30" :
                                                    wo.status === 'IN_PROGRESS' ? "bg-blue-500/20 text-blue-600 border border-blue-500/30" :
                                                    "bg-amber-500/20 text-amber-600 border border-amber-500/30"
                                                )}
                                                onClick={() => router.push(`/manufacturing/work-orders/${wo.id}`)}
                                            >
                                                <span className="text-[9px] font-black uppercase truncate">{wo.quantity} Units</span>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-6 items-center justify-center p-6 bg-muted/20 rounded-3xl border border-dashed">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Planned / Released</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Completed</span>
                </div>
            </div>
        </div>
    );
}
