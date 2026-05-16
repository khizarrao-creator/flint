"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Search,
  Plus,
  Loader2,
  RefreshCcw
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/app/lib/utils";

import { useAuth } from "@/app/lib/auth-context";

import { api } from "@/app/lib/api";

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: "Total Revenue", value: "$0.00", change: "0%", trendingUp: true, icon: DollarSign },
    { label: "Active Orders", value: "0", change: "0%", trendingUp: true, icon: ShoppingCart },
    { label: "New Customers", value: "0", change: "0%", trendingUp: true, icon: Users },
    { label: "Products", value: "0 Items", change: "In Stock", trendingUp: true, icon: Package },
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [ordersData, statsData] = await Promise.all([
        api.get<any[]>('/orders'),
        api.get<any>('/dashboard/stats')
      ]);

      setOrders(Array.isArray(ordersData) ? ordersData : []);

      if (statsData) {
        setStats([
          { label: "Total Revenue", value: `$${parseFloat(statsData.totalRevenue || 0).toLocaleString()}`, change: "+12.5%", trendingUp: true, icon: DollarSign },
          { label: "Active Orders", value: (statsData.activeOrders || 0).toString(), change: "+8.2%", trendingUp: true, icon: ShoppingCart },
          { label: "New Customers", value: (statsData.customers || 0).toString(), change: "+2.4%", trendingUp: true, icon: Users },
          { label: "Products", value: `${statsData.products || 0} Items`, change: "Safe", trendingUp: true, icon: Package },
        ]);
      }
    } catch (error) {
      console.error("Flint Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase"
          >
            <div className="w-4 h-[2px] bg-primary" />
            Live Intelligence
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black tracking-tight"
          >
            Welcome back, {user?.username || "Flint Admin"}
          </motion.h1>
          <p className="text-muted-foreground">Flint Brain is currently monitoring your operations.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-muted hover:bg-muted/80 transition-all border group"
          >
            <RefreshCcw className={cn("w-5 h-5 text-muted-foreground group-hover:rotate-180 transition-transform duration-500", loading && "animate-spin")} />
          </button>
          <button
            onClick={() => router.push('/orders/new')}
            className="flex items-center gap-2 px-6 h-12 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={20} />
            New Order
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="p-6 rounded-3xl bg-card border shadow-sm group hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <stat.icon size={24} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
                stat.trendingUp ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
              )}>
                {stat.trendingUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <p className="text-muted-foreground text-sm font-semibold">{stat.label}</p>
            <h3 className="text-2xl font-black mt-1 tracking-tight">{stat.value}</h3>
          </motion.div>
        ))}
      </section>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              Recent Sales Orders
              {!loading && (
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-black">
                  {orders.length}
                </span>
              )}
            </h2>
            <button className="text-sm font-bold text-primary hover:underline">View All</button>
          </div>

          <div className="bg-card border rounded-3xl overflow-hidden shadow-sm relative min-h-[400px]">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Reading Ledger Integrity...</p>
                </div>
              </div>
            ) : null}

            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Order Ref</th>
                  <th className="text-left p-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Entity</th>
                  <th className="text-left p-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="text-right p-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={4} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Package className="w-12 h-12 opacity-20" />
                        <p className="font-bold tracking-tight">No Transactions Recorded</p>
                        <p className="text-sm">Start by creating your first sales order.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="hover:bg-muted/20 transition-colors group cursor-pointer"
                    >
                      <td className="p-5">
                        <span className="font-bold text-sm tracking-tight">{order.code}</span>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                          {new Date(order.orderDate).toLocaleDateString()} • {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="p-5 font-bold text-sm">
                        {order.customer
                          ? `${order.customer.firstName} ${order.customer.lastName}`
                          : (order.supplier?.companyName || "Internal Partner")
                        }
                        {order.customer?.companyName && (
                          <p className="text-[10px] text-muted-foreground font-medium">{order.customer.companyName}</p>
                        )}
                      </td>
                      <td className="p-5">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                          order.status === "Paid" ? "bg-emerald-500/10 text-emerald-500" :
                            order.status === "Pending" ? "bg-amber-500/10 text-amber-500" :
                              "bg-blue-500/10 text-blue-500"
                        )}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-5 text-right font-black text-sm text-foreground">
                        ${parseFloat(order.totalAmount).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick Actions / Integration Status */}
        <section className="space-y-4">
          <h2 className="text-xl font-black tracking-tight">Ecosystem Health</h2>
          <div className="bg-card border rounded-3xl p-6 space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Shopify Sync</span>
                <span className="text-emerald-500 font-black text-[10px] uppercase">Synced</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "95%" }}
                  className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Engine Latency</span>
                <span className="text-primary font-black text-[10px] uppercase">0.4 ms</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "15%" }}
                  className="h-full bg-primary shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                />
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Channels</p>
              <div className="flex flex-wrap gap-2">
                {['Shopify', 'Stripe', 'QuickBooks', 'Xero', 'WhatsApp', 'Cloud R2'].map(item => (
                  <div key={item} className="px-3 py-1.5 rounded-lg bg-muted border text-[9px] font-black uppercase tracking-tighter text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors cursor-default">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary via-orange-500 to-orange-600 rounded-3xl p-8 text-primary-foreground shadow-xl shadow-primary/20 relative overflow-hidden group">
            <div className="relative z-10 space-y-3">
              <h3 className="text-2xl font-black leading-none">Flint Intelligence</h3>
              <p className="text-sm opacity-90 leading-relaxed font-semibold">Enable predictive analytics to forecast your inventory stockouts before they happen.</p>
              <button className="mt-4 w-full h-12 bg-white text-primary rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all hover:shadow-lg active:scale-95">
                Activate AI Core
              </button>
            </div>
            {/* Visual Flair */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          </div>
        </section>
      </div>

    </div>
  );
}
