"use client";

import React from "react";
import { OrderForm } from "@/components/orders/order-form";

export default function NewSalesOrderPage() {
    return (
        <div className="container mx-auto py-10 px-4 md:px-0">
            <OrderForm type="SALES" />
        </div>
    );
}
