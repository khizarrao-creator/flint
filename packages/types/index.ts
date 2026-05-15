export interface User {
    id: string;
    email: string;
    username: string;
    role: "SUPER_ADMIN" | "ADMIN" | "USER";
    tenantId: string;
    tenant?: {
        name: string;
        subdomain: string;
        theme?: string;
    };
}
