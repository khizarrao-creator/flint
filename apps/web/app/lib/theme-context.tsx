"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/app/lib/auth-context";

type Theme = "default" | "ocean" | "midnight" | "emerald" | "crimson" | "gold" | "rose";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "default",
    setTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("default");

    const { user } = useAuth();

    useEffect(() => {
        // 1. If user is logged in, use their tenant's theme
        if (user && user.tenant?.theme) {
            setThemeState(user.tenant.theme as Theme);
            document.documentElement.setAttribute("data-theme", user.tenant.theme);
            return;
        }

        // 2. Fallback to local storage
        const savedTheme = localStorage.getItem("flint_theme") as Theme;
        if (savedTheme) {
            setThemeState(savedTheme);
            document.documentElement.setAttribute("data-theme", savedTheme);
        }
    }, [user]);

    const setTheme = async (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem("flint_theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);

        // 3. Persist to API if logged in (Admin Only for now, as it's a tenant setting)
        if (user && (user.role === 'ADMIN' || user?.role === 'SUPER_ADMIN')) {
            try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"}/tenants/${user.tenantId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("flint_token")}`
                    },
                    body: JSON.stringify({ theme: newTheme })
                });
            } catch (error) {
                console.error("Failed to persist theme preference", error);
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
