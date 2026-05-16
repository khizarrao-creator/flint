
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Activity,
    Calendar,
    User,
    Package,
    ArrowLeft,
    Clock,
    CheckCircle2,
    Play,
    Pause,
    XCircle,
    AlertCircle,
    Loader2,
    Warehouse as WarehouseIcon,
    ArrowRight,
    Save
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/lib/auth-context";
import { cn } from "@/app/lib/utils";
import Link from "next/link";

export default function WorkOrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    
    const [wo, setWo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [users, setUsers] = useState<any[]>([]);
    
    // Editable state
    const [completedQty, setCompletedQty] = useState<number>(0);
    const [assignedId, setAssignedId] = useState<string>("");
    const [status, setStatus] = useState<string>("");
    const [serialNumbers, setSerialNumbers] = useState<string[]>([]);

    const [inspections, setInspections] = useState<any[]>([]);
    
    const fetchData = async () => {
        try {
            setLoading(true);
            const [data, userData, qcData] = await Promise.all([
                api.get<any>(`/manufacturing/work-orders/${id}`),
                api.get<any[]>('/auth/users').catch(() => []),
                api.get<any[]>(`/manufacturing/inspections?workOrderId=${id}`).catch(() => [])
            ]);
            
            setWo(data);
            setUsers(userData);
            setInspections(qcData);
            setCompletedQty(Number(data.completedQuantity));
            setAssignedId(data.assignedToId || "");
            setStatus(data.status);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleUpdate = async (updates: any) => {
        try {
            setSaving(true);
            await api.put(`/manufacturing/work-orders/${id}`, updates);
            await fetchData();
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || "Failed to update work order";
            alert(message);
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === 'COMPLETED' && wo.formula?.product?.trackSerial) {
            // Validate serials count
            if (serialNumbers.length < completedQty) {
                alert(`Please enter all ${completedQty} serial numbers before finishing.`);
                return;
            }
        }
        await handleUpdate({ 
            status: newStatus,
            serialNumbers: newStatus === 'COMPLETED' ? serialNumbers : undefined 
        });
    };

    const isSerialized = wo.formula?.product?.trackSerial;

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="font-bold text-muted-foreground animate-pulse">Synchronizing production data...</p>
            </div>
        );
    }

    if (!wo) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <AlertCircle className="w-10 h-10 text-rose-500" />
                <p className="font-bold">Work Order not found.</p>
                <Link href="/manufacturing/work-orders" className="text-primary hover:underline">Return to list</Link>
            </div>
        );
    }

    const progressPercentage = (Number(completedQty) / Number(wo.quantity)) * 100;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-xs font-black uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-5xl font-black tracking-tighter uppercase">{wo.code}</h1>
                            <div className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm",
                                status === "COMPLETED" ? "bg-emerald-500 text-white" :
                                status === "IN_PROGRESS" ? "bg-blue-500 text-white" :
                                status === "CANCELLED" ? "bg-rose-500 text-white" :
                                "bg-amber-500 text-white"
                            )}>
                                {status}
                            </div>
                        </div>
                        <p className="text-xl text-muted-foreground font-medium">Production of <span className="text-foreground font-bold">{wo.formula?.product?.name}</span></p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {status === "PLANNED" && (
                        <button 
                            onClick={() => handleStatusChange("RELEASED")}
                            className="h-14 px-8 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                        >
                            <ArrowRight size={18} /> Release to Floor
                        </button>
                    )}
                    {(status === "RELEASED" || status === "PLANNED") && (
                        <button 
                            onClick={() => handleStatusChange("IN_PROGRESS")}
                            className="h-14 px-8 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            <Play size={18} /> Start Production
                        </button>
                    )}
                    {status === "IN_PROGRESS" && (
                        <button 
                            onClick={() => handleStatusChange("COMPLETED")}
                            className="h-14 px-8 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                        >
                            <CheckCircle2 size={18} /> Finish Job
                        </button>
                    )}
                </div>
            </section>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column - Core Info */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Progress Card */}
                    <div className="bg-card border rounded-[2.5rem] p-10 shadow-sm space-y-8 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-primary/10" />
                         
                         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Production Yield</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-6xl font-black tracking-tighter">{completedQty}</h2>
                                    <span className="text-2xl text-muted-foreground font-medium">/ {wo.quantity}</span>
                                </div>
                                <p className="text-sm font-bold text-muted-foreground italic">Units successfully manufactured</p>
                            </div>

                            <div className="w-full md:w-64 space-y-4">
                                <div className="h-4 w-full bg-muted rounded-full overflow-hidden border">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercentage}%` }}
                                        className={cn(
                                            "h-full transition-all duration-1000",
                                            status === "COMPLETED" ? "bg-emerald-500" : "bg-primary"
                                        )}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span>Progress</span>
                                    <span>{Math.round(progressPercentage)}%</span>
                                </div>
                                {status === "IN_PROGRESS" && (
                                    <div className="flex gap-2">
                                        <input 
                                            type="number"
                                            value={completedQty}
                                            onChange={e => setCompletedQty(Number(e.target.value))}
                                            className="w-full h-10 bg-muted/50 border rounded-xl px-3 font-bold outline-none text-sm"
                                        />
                                        <button 
                                            onClick={() => handleUpdate({ completedQuantity: completedQty })}
                                            className="h-10 px-4 bg-foreground text-background rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                                        >
                                            Save
                                        </button>
                                    </div>
                                )}
                                {status === "IN_PROGRESS" && isSerialized && (
                                    <div className="mt-4 p-4 bg-muted/30 rounded-2xl border border-dashed space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unit Serial Numbers</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Array.from({ length: completedQty }).map((_, idx) => (
                                                <input 
                                                    key={idx}
                                                    placeholder={`Serial #${idx + 1}`}
                                                    value={serialNumbers[idx] || ""}
                                                    onChange={e => {
                                                        const newSerials = [...serialNumbers];
                                                        newSerials[idx] = e.target.value;
                                                        setSerialNumbers(newSerials);
                                                    }}
                                                    className="h-9 bg-background border rounded-lg px-3 text-xs font-bold outline-none focus:border-primary transition-all"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                             </div>
                         </div>
                    </div>

                    {/* BOM Card */}
                    <div className="bg-card border rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b bg-muted/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Package className="text-primary" size={24} />
                                <h3 className="text-xl font-black tracking-tight">Material Requirements</h3>
                            </div>
                            <Link href={`/manufacturing/formulas`} className="text-xs font-black uppercase tracking-widest text-primary hover:underline">View Formula</Link>
                        </div>
                        <div className="divide-y">
                            {wo.formula?.items?.map((item: any) => {
                                const required = Number(item.quantity) * Number(wo.quantity);
                                const available = Number(item.product?.stockQuantity || 0);
                                const isShortage = available < required && status !== 'COMPLETED';
                                
                                return (
                                    <div key={item.id} className="p-6 flex items-center justify-between hover:bg-muted/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0",
                                                isShortage ? "bg-rose-500/10 text-rose-500" : "bg-muted"
                                            )}>
                                                {item.product?.sku?.slice(0, 3)}
                                            </div>
                                            <div>
                                                <p className="font-bold tracking-tight">{item.product?.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.product?.sku}</p>
                                                    <span className="w-1 h-1 rounded-full bg-border" />
                                                    <p className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest",
                                                        isShortage ? "text-rose-500" : "text-emerald-500"
                                                    )}>
                                                        {available.toLocaleString()} On Hand
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn(
                                                "font-black text-lg",
                                                isShortage ? "text-rose-500" : "text-foreground"
                                            )}>
                                                {required.toLocaleString()}
                                            </p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Required Units</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quality Control Card */}
                    <div className="bg-card border rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b bg-muted/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="text-emerald-500" size={24} />
                                <h3 className="text-xl font-black tracking-tight">Quality Control (QC)</h3>
                            </div>
                            <button 
                                onClick={() => alert("Inspection module coming in next update!")}
                                className="h-10 px-4 bg-foreground text-background rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                            >
                                New Inspection
                            </button>
                        </div>
                        <div className="p-8">
                            {inspections.length === 0 ? (
                                <div className="text-center py-10 border border-dashed rounded-[2rem] space-y-2">
                                    <p className="text-sm font-bold text-muted-foreground">No inspection reports found for this batch.</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Final check recommended before completion</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {inspections.map((qc) => (
                                        <div key={qc.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                                    qc.status === 'PASSED' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                                )}>
                                                    {qc.status === 'PASSED' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">Report #{qc.id.slice(0, 8)}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">by {qc.inspector?.username || 'System'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter inline-block",
                                                    qc.status === 'PASSED' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                                                )}>
                                                    {qc.status}
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">
                                                    {new Date(qc.inspectedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Timeline & Assignment */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Assignment Card */}
                    <div className="bg-card border rounded-[2.5rem] p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <User className="text-indigo-500" size={24} />
                            <h3 className="text-lg font-black tracking-tight">Assignment</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Responsible Technician</label>
                                <select 
                                    value={assignedId}
                                    onChange={e => {
                                        setAssignedId(e.target.value);
                                        handleUpdate({ assignedToId: e.target.value });
                                    }}
                                    className="w-full h-12 bg-muted/50 border rounded-xl px-4 font-bold outline-none focus:border-indigo-500 transition-all text-sm appearance-none"
                                >
                                    <option value="">Unassigned</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.username}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Target Location</p>
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    <WarehouseIcon size={16} className="text-indigo-500/50" />
                                    {wo.warehouse?.name || "Main Floor"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Card */}
                    <div className="bg-card border rounded-[2.5rem] p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <Calendar className="text-amber-500" size={24} />
                            <h3 className="text-lg font-black tracking-tight">Timeline</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                    <Clock size={18} className="text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Planned Start</p>
                                    <p className="font-bold text-sm">{wo.plannedStart ? new Date(wo.plannedStart).toLocaleString() : "Not Scheduled"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 text-emerald-500 bg-emerald-500/10">
                                    <Play size={18} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actual Start</p>
                                    <p className="font-bold text-sm">{wo.actualStart ? new Date(wo.actualStart).toLocaleString() : "Pending..."}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 text-primary bg-primary/10">
                                    <CheckCircle2 size={18} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actual Finish</p>
                                    <p className="font-bold text-sm">{wo.actualFinish ? new Date(wo.actualFinish).toLocaleString() : "Ongoing..."}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-indigo-600 text-white space-y-4 shadow-xl shadow-indigo-500/20">
                        <h4 className="font-black text-lg leading-tight">Floor Instructions</h4>
                        <p className="text-sm font-medium opacity-80 leading-relaxed italic">
                            "{wo.notes || "No special instructions provided for this batch."}"
                        </p>
                    </div>

                    <button 
                        onClick={() => {
                            if(confirm("DANGER: This will permanently purge this production record. Proceed?")) {
                                api.delete(`/manufacturing/work-orders/${id}`).then(() => router.push('/manufacturing/work-orders'));
                            }
                        }}
                        className="w-full h-12 rounded-xl text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-500/10 transition-colors"
                    >
                        Purge Work Order Record
                    </button>
                </div>
            </div>
        </div>
    );
}
