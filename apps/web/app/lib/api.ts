/**
 * Secure API Client
 * 
 * This utility provides a wrapper around the native fetch API to automatically
 * include the JWT authentication token and handle common error states.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
    token?: string | null;
    unauthorizedRedirect?: string;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, token: customToken, unauthorizedRedirect, ...rest } = options;

    // 1. Build URL with query parameters
    let url = `${API_URL}${endpoint}`;
    if (params) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
    }

    // 2. Get token from localStorage if not provided
    const token = customToken !== undefined ? customToken : (typeof window !== 'undefined' ? localStorage.getItem('flint_token') : null);

    // 3. Prepare headers
    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // 4. Perform request
    const response = await fetch(url, {
        ...rest,
        headers: {
            ...defaultHeaders,
            ...headers,
        },
    });

    // 5. Handle response states
    if (response.status === 401) {
        // Token expired or invalid
        if (typeof window !== 'undefined') {
            console.error('Session expired. Redirecting to login.');
            if (customToken === undefined) {
                localStorage.removeItem('flint_token');
                localStorage.removeItem('flint_user');
            }
            if (unauthorizedRedirect) {
                window.location.href = unauthorizedRedirect;
            } else if (customToken === undefined) {
                window.location.href = '/login';
            }
        }
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    // 6. Return parsed JSON
    return response.json();
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
    get: <T>(endpoint: string, params?: Record<string, string>, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { method: 'GET', params, ...options }),

    post: <T>(endpoint: string, body: any, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),

    put: <T>(endpoint: string, body: any, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),

    delete: <T>(endpoint: string, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { method: 'DELETE', ...options }),
};
